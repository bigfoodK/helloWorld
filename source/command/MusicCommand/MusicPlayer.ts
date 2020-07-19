import { MusicQueue } from './MusicQueue';
import { MusicInfo } from './types';
import { VoiceConnection, VoiceChannel, StreamDispatcher } from 'discord.js';
import { join } from 'path';
import config from '../../config';

export default class MusicPlayer {
  constructor() {
    this.handleQueuePlayableChange = this.handleQueuePlayableChange.bind(this);
    this.addMusics = this.addMusics.bind(this);
    this.play = this.play.bind(this);
    this.stop = this.stop.bind(this);

    this.queue.on('playableChange', this.handleQueuePlayableChange);
  }

  private queue: MusicQueue = new MusicQueue();

  private isPlaying: boolean = false;

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
    const connection = await voiceChannel.join();
    this.voiceConnection = connection;
  }

  private playMusicInfo(musicInfo?: MusicInfo) {
    if (!this.isPlaying || !musicInfo || !this.voiceConnection) {
      return;
    }
    const filePath = join(config.musicStorageDirectoryPath, `${musicInfo.id}.mp3`);
    const dispatcher = this.voiceConnection.play(filePath);
    dispatcher.on('end', reason => this.playNext(reason))
    this.streamDispatcher = dispatcher;
  }

  private playNext(reason: string) {
    const musicInfo = this.queue.next();
    this.playMusicInfo(musicInfo);
  }

  public async play(voiceChannel?: VoiceChannel) {
    if (voiceChannel && (this.voiceConnection?.channel.id !== voiceChannel.id)) {
      this.leaveChannel()
      await this.joinChannel(voiceChannel);
    }

    if (!this.voiceConnection) {
      throw new Error('NO_CHANNEL_FOUND');
    }

    const musicInfo = this.queue.current();

    if (!musicInfo && this.queue.isEmpty()) {
      throw new Error('QUEUE_IS_EMPTY');
    }

    if (musicInfo && !this.streamDispatcher) {
      this.playMusicInfo(musicInfo);
    }

    if (!this.isPlaying && this.streamDispatcher) {
      this.streamDispatcher.resume();
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
      this.streamDispatcher.end('stop');
      this.streamDispatcher = undefined;
    }
    this.isPlaying = false;
  }

  public getQueue() {
    return this.queue.getQueue();
  }

  public skip() {
    this.playNext('skip');
  }

  public leave() {
    this.leaveChannel();
  }
}
