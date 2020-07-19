import CommandBase from '../CommandBase';
import {  Message, MessageEmbed } from 'discord.js';
import { ServerConfig } from '../types';
import ytdl, { validateURL } from 'ytdl-core';
import MusicPlayerManager from './MusicPlayerManager';
import MusicPlayer from './MusicPlayer';
import { MusicInfo } from './types';
import sendPaginationQueueEmbed from './sendPaginationEmbed';

export default class MusicCommand extends CommandBase {
  readonly name = 'music';

  readonly aliases = ['m'];

  readonly description = 'Play music with youtube URL';

  private musicPlayerManager: MusicPlayerManager = new MusicPlayerManager();

  private async play(message: Message, musicPlayer: MusicPlayer) {
    return musicPlayer.play(message.member?.voice.channel || undefined)
      .catch(async (error: Error) => {
        if (error.message === 'QUEUE_IS_EMPTY') {
          await message.channel.send(new MessageEmbed()
            .setColor('#ef5350')
            .setTitle('Queue is empty')
            .setDescription('Add some music')
          )
        } else if (error.message === 'NO_CHANNEL_FOUND') {
          await message.channel.send(new MessageEmbed()
            .setColor('#ef5350')
            .setTitle('No channel found')
            .setDescription('Join to voice channel')
          )
        }
        return false;
      })
  }

  private async addMusics(message: Message, musicPlayer: MusicPlayer, urls: string[]) {
    const ensuredUrls = urls.filter(url => validateURL(url));

    if (ensuredUrls.length < 1) {
      message.channel.send(this.getHelp([]));
      return;
    }

    const musicInfoArray = await Promise.all(ensuredUrls.map(async url => {
      const info = await ytdl.getBasicInfo(url);

      return {
        id: info.video_id,
        url: info.video_url,
        title: info.title,
        adderId: message.author.id,
        addedTime: Date.now(),
      } as MusicInfo;
    }))

    await musicPlayer.addMusics(musicInfoArray);

    if (!musicInfoArray) {
      await message.channel.send(new MessageEmbed()
        .setColor('#ef5350')
        .setTitle('No music added to queue')
        .setDescription('Check youtube link')
      )
      return musicInfoArray;
    }

    const length = musicInfoArray.length;
    const embed = new MessageEmbed()
      .setColor('#2196f3')
      .setTitle(`${length} music added to queue`)
    for (let i = 0; i < Math.min(3, length); i += 1) {
      embed.addField(`${musicInfoArray[i].title}`, `${musicInfoArray[i].url}`);
    }
    if (length > 3) {
      embed.setFooter(`and ${length - 3} more...`)
    }
    await message.channel.send(embed);

    return musicInfoArray;
  }

  public getHelp(args: string[]) {
    const optionName = args.shift();

    switch (optionName) {
      case 'playlist': {
        return new MessageEmbed()
          .setTitle('Playlist')
          .addField('Description', `Manage Playlist`)
          .addField('Usage', '"music playlist"')
      }

      case 'queue': {
        return new MessageEmbed()
          .setTitle('Queue')
          .addField('Description', `Show queue`)
          .addField('Usage', '"music queue"')
      }

      case 'play': {
        return new MessageEmbed()
          .setTitle('Play')
          .addField('Description', `Join to voice channel,\nResume music,\n`)
          .addField('Usage', '"music play" to Join or Resume\n"music play link link li..." to add music to queue')
          .addField('Alias', 'm p')
      }

      case 'pause': {
        return new MessageEmbed()
          .setTitle('Pause')
          .addField('Description', `Pause music`)
          .addField('Usage', '"music pause"')
      }

      case 'stop': {
        return new MessageEmbed()
          .setTitle('Stop')
          .addField('Description', `Stop music`)
          .addField('Usage', '"music stop"')
      }

      case 'skip': {
        return new MessageEmbed()
          .setTitle('Skip')
          .addField('Description', `Skip music`)
          .addField('Usage', '"music skip"')
          .addField('Alias', 'm s')
      }

      case 'leave': {
        return new MessageEmbed()
          .setTitle('Leave')
          .addField('Description', `Leave channel`)
          .addField('Usage', '"music leave"')
      }

      case 'repeat': {
        return new MessageEmbed()
          .setTitle('Repeat')
          .addField('Description', `Set repeat option`)
          .addField('Usage', '"music repeat (all | one | none)"')
          .addField('Alias', '"m r"')
      }

      default: {
        return new MessageEmbed()
          .setTitle('Music')
          .addField('Usage', '"music https://www.youtube.com/watch?v=nuckTcoZG4Q" or "m https://www.youtube.com/watch?v=nuckTcoZG4Q&list=RDMMnuckTcoZG4Q"')
          .addField('Queue Command', '"help music queue"')
          .addField('Play Command', '"help music play"')
          .addField('Pause Command', '"help music pause"')
          .addField('Stop Command', '"help music stop"')
          .addField('Skip Command', '"help music skip"')
          .addField('Leave Command', '"help music leave"')
          .addField('Repeat Command', '"help music repeat"')
      }
    }
  }

  public async handler(message: Message, serverConfig: ServerConfig, args: string[]) {
    if (!message.guild) {
      return;
    }

    const optionName = args.shift();

    const musicPlayer = this.musicPlayerManager.get(message.guild.id);

    switch(optionName) {
      case 'playlist': {

      } break;

      case 'queue': {
        const musicInfoArray = musicPlayer.getQueue();
        await sendPaginationQueueEmbed(message, musicInfoArray);
      }

      case 'p':
      case 'play': {
        if (args.length > 0) {
          await this.addMusics(message, musicPlayer, args);
        }
        await this.play(message, musicPlayer);
      } break;

      case 'pause': {
        musicPlayer.pause();
      } break;

      case 'stop': {
        musicPlayer.stop();
      } break;

      case 's':
      case 'skip': {
        musicPlayer.skip();
      } break;

      case 'leave': {
        musicPlayer.leave();
      } break;

      case 'r':
      case 'repeat': {
        const repeat = args.shift();
        switch(repeat) {
          case 'one': {
            musicPlayer.setRepeat('one');
            await message.channel.send(new MessageEmbed()
              .setColor('#2196f3')
              .setTitle(`Repeat only on music`)
            )
          } break;

          case 'all': {
            musicPlayer.setRepeat('all');
            await message.channel.send(new MessageEmbed()
              .setColor('#2196f3')
              .setTitle(`Repeat whole queue`)
            )
          } break;

          default: {
            musicPlayer.setRepeat('none');
            await message.channel.send(new MessageEmbed()
              .setColor('#2196f3')
              .setTitle(`No repeat`)
            )
          }
        }
      } break;

      default: {
        const urls = [optionName || '', ...args];
        await this.addMusics(message, musicPlayer, urls);
        await this.play(message, musicPlayer);
      } break;
    }
  }
}