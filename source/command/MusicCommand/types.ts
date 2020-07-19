import { User } from "discord.js";

export type MusicInfo = {
  title: string,
  url: string,
  id: string,
  playable?: boolean,
  adderId: string,
  addedTime: number,
}
