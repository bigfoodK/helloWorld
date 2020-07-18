import { Message, RichEmbed } from 'discord.js';

export default abstract class CommandBase {
  abstract readonly name: string;

  abstract readonly description: string;

  abstract async handler(message: Message,args: string[]): Promise<void>;

  abstract getHelp(args: string[]): RichEmbed;
}
