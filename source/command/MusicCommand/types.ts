export type MusicInfo = {
  title: string,
  url: string,
  id: string,
  playable?: boolean,
  adderId: string,
  addedTime: number,
}

export type MusicQueueRepeat = 'none' | 'one' | 'all';
