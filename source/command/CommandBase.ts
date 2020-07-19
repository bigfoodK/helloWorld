import { Message, RichEmbed } from 'discord.js';
import { ServerConfig } from './types';

export default abstract class CommandBase {
  abstract readonly name: string;

  abstract readonly aliases: string[];

  abstract readonly description: string;

  abstract async handler(message: Message, serverConfig: ServerConfig, args: string[]): Promise<void>;

  abstract getHelp(args: string[]): RichEmbed;
}
