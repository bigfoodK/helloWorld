import { EventEmitter } from 'events';
import { MusicInfo } from './types';
import { pathExists } from 'fs-extra';
import { join } from 'path';
import config from '../../config';
import musicDownloader from './MusicDownloader';

type MusicQueueRepeat = 'none' | 'one' | 'all';

export interface MusicQueue {
  on(event: 'playableChange', listener: (playable: boolean) => void): this;

  once(event: 'playableChange', listener: (playable: boolean) => void): this;

  off(event: 'playableChange', listener: (playable: boolean) => void): this;

  emit(event: 'playableChange', playable: boolean): boolean;
}

export class MusicQueue extends EventEmitter {
  constructor() {
    super();

    this.handleDownloadComplete = this.handleDownloadComplete.bind(this);

    musicDownloader.on('downloadComplete', this.handleDownloadComplete)
  }

  private queue: MusicInfo[] = [];

  private repeat: MusicQueueRepeat = 'none';

  private playable: boolean = false;

  private checkPlayable() {
    const playable = this.queue.some(musicInfo => musicInfo.playable);
    if (playable && this.queue.length > 0 && !this.queue[0].playable) {
      const firstPlayableIndex = this.queue.findIndex(musicInfo => musicInfo.playable);
      const unPlayableFrontMusicInfoArray = this.queue.splice(0, firstPlayableIndex + 1);
      this.queue = [...this.queue, ...unPlayableFrontMusicInfoArray];
    }
    if (playable !== this.playable) {
      this.playable = playable;
      this.emit('playableChange', playable);
    }
  }

  private pushQueue(musicInfo: MusicInfo) {
    this.queue.push(musicInfo);
    this.checkPlayable();
  }

  public handleDownloadComplete(id: string) {
    this.queue = this.queue.reduce((queue: MusicInfo[], musicInfo: MusicInfo) => {
      if (musicInfo.id === id) {
        musicInfo.playable = true;
      }
      return [...queue, musicInfo];
    }, []);
    this.checkPlayable();
  }

  public setRepeat(repeat: MusicQueueRepeat) {
    this.repeat = repeat;
  }

  public isEmpty() {
    return this.queue.length < 1;
  }

  public async addMusics(musics: MusicInfo[]) {
    const ensuredMusics = await Promise.all(musics.map(async musicInfo => {
      const exist = await pathExists(join(config.musicStorageDirectoryPath, `${musicInfo.id}.mp3`));
      musicInfo.playable = exist;

      if (!exist) {
        musicDownloader.download(musicInfo.url);
      }

      return musicInfo;
    }));

    ensuredMusics.forEach(musicInfo => this.pushQueue(musicInfo));
  }

  public next() {
    if (!this.playable) {
      return undefined;
    }

    const current = this.queue[0];

    if (this.repeat !== 'one') {
      this.queue.shift();
    }

    if (this.repeat === 'all') {
      this.queue.push(current);
    }

    this.checkPlayable();

    return this.current();
  }

  public current() {
    if (!this.playable) {
      return undefined;
    }
    return this.queue[0];
  }

  public getQueue() {
    return [...this.queue];
  }
}
