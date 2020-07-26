import MusicPlayer from './MusicPlayer';
import { Guild } from 'discord.js';

export default class MusicPlayerManager {
  private musicPlayers: Map<string, MusicPlayer> = new Map();

  public get(guild: Guild) {
    const musicPlayer = this.musicPlayers.get(guild.id);
    if (musicPlayer) {
      return musicPlayer;
    }
    const newMusicPlayer = new MusicPlayer(guild);
    this.musicPlayers.set(guild.id, newMusicPlayer);
    return newMusicPlayer;
  }
}
