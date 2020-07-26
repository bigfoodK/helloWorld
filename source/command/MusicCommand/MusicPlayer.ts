import { MusicQueue } from './MusicQueue';
import { MusicInfo, MusicQueueRepeat } from './types';
import { VoiceConnection, VoiceChannel, StreamDispatcher, Message, MessageEmbed, TextChannel, DMChannel, NewsChannel, Guild } from 'discord.js';
import { join } from 'path';
import config from '../../config';

export default class MusicPlayer {
  constructor(guild: Guild) {
    this.handleQueuePlayableChange = this.handleQueuePlayableChange.bind(this);
    this.addMusics = this.addMusics.bind(this);
    this.play = this.play.bind(this);
    this.stop = this.stop.bind(this);
    this.guild = guild;

    this.queue.on('playableChange', this.handleQueuePlayableChange);
  }

  private queue: MusicQueue = new MusicQueue();

  private isPlaying: boolean = false;

  private guild: Guild;

  private lastMessageChannel?: TextChannel | DMChannel | NewsChannel;

  private lastVoiceChannel?: VoiceChannel;

  private voiceConnection?: VoiceConnection;

  private streamDispatcher?: StreamDispatcher;

  private handleQueuePlayableChange(playable: boolean) {
    if (playable && this.isPlaying) {
      this.play();
    } else {
      this.stop();
    }
  }

  public async addMusics(musics: MusicInfo[]) {
    this.queue.addMusics(musics);
  }

  private leaveChannel() {
    if (this.voiceConnection) {
      this.voiceConnection.disconnect();
      this.voiceConnection = undefined;
    }
  }

  private async joinChannel(voiceChannel: VoiceChannel) {
    this.lastVoiceChannel = voiceChannel;
    this.voiceConnection = await voiceChannel.join();
  }

  private playNext() {
    this.streamDispatcher?.destroy();
    this.streamDispatcher = undefined;
    !!this.queue.next() ? this.play() : this.stop();
  }

  public async play(message?: Message) {
    const voiceChannel = message?.member?.voice?.channel || this.lastVoiceChannel;
    const messageChannel = this.lastMessageChannel;
    if (message) {
      this.lastMessageChannel = message.channel;
    }

    if (voiceChannel) {
      this.lastVoiceChannel = voiceChannel;
      if (this.voiceConnection?.channel.id !== voiceChannel.id) {
        this.leaveChannel();
        await this.joinChannel(voiceChannel);
      }
    }

    if (!this.voiceConnection) {
      return await messageChannel?.send(new MessageEmbed()
        .setColor('#ef5350')
        .setTitle('No channel found')
        .setDescription('Join to voice channel')
      )
    }

    const musicInfo = this.queue.current();

    if (!musicInfo && this.queue.isEmpty()) {
      return await messageChannel?.send(new MessageEmbed()
        .setColor('#ef5350')
        .setTitle('Queue is empty')
        .setDescription('Add some music')
      )
    }

    if (!this.isPlaying && this.streamDispatcher) {
      this.streamDispatcher.resume();
      await this.printNowPlaying();
    }

    if (musicInfo && !this.streamDispatcher) {
      const filePath = join(config.musicStorageDirectoryPath, `${musicInfo.id}.mp3`);
      const dispatcher = this.voiceConnection.play(filePath);
      dispatcher.on('finish', () => this.playNext());
      this.streamDispatcher = dispatcher;
      await this.printNowPlaying();
    }

    this.isPlaying = true;
    return true;
  }

  public pause() {
    if (this.streamDispatcher) {
      this.streamDispatcher.pause();
    }
    this.isPlaying = false;
  }

  public stop() {
    if (this.streamDispatcher) {
      this.streamDispatcher.destroy();
      this.streamDispatcher = undefined;
    }
    this.isPlaying = false;
  }

  public getQueue() {
    return this.queue.getQueue();
  }

  public skip() {
    this.playNext();
  }

  public leave() {
    this.leaveChannel();
  }

  public setRepeat(repeat: MusicQueueRepeat) {
    this.queue.setRepeat(repeat);
  }

  public async printNowPlaying() {
    const musicInfo = this.queue.current();
    if (!musicInfo) {
      return false;
    }
    const adder = this.guild.member(musicInfo.adderId);
    const embed = new MessageEmbed();
    embed.setColor('#2196f3');
    embed.setTitle('Now Playing');
    embed.addField(`${musicInfo.title}`, `${musicInfo.url}
${adder ? adder.toString() + ' added': ''} at ${new Date(musicInfo.addedTime).toLocaleString()}
${musicInfo.playable ? 'ready to play' : 'downloading'}`)
    await this.lastMessageChannel?.send(embed);
  }
}
