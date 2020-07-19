import MusicPlayer from './MusicPlayer';

export default class MusicPlayerManager {
  private musicPlayers: Map<string, MusicPlayer> = new Map();

  public get(guildId: string) {
    const musicPlayer = this.musicPlayers.get(guildId);
    if (musicPlayer) {
      return musicPlayer;
    }
    const newMusicPlayer = new MusicPlayer();
    this.musicPlayers.set(guildId, newMusicPlayer);
    return newMusicPlayer;
  }
}
