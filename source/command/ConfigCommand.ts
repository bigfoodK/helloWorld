import CommandBase from './CommandBase';
import { RichEmbed, Message } from 'discord.js';
import database from '../database';
import config from '../config';
import { ServerConfig } from './types';

export default class ConfigCommand extends CommandBase {
  readonly name = 'config';

  readonly description = 'Config options for this server';

  public getHelp(args: string[]) {
    const optionName = args.shift();

    switch (optionName) {
      case 'prefix': {
        return new RichEmbed()
          .setTitle('Prefix')
          .addField('Description', `Prefix of command. (default: ${config.prefix})`)
          .addField('Usage', 'config prefix prefix')
          .addField('Example', '"config prefix $" will set prefix to "$"')
      }

      default: {
        return new RichEmbed()
          .setTitle('Server options')
          .addField('prefix', 'Prefix of command. (default: $)')
      }
    }
  }

  public async handler(message: Message, serverConfig: ServerConfig, args: string[]) {
    const optionName = args.shift();

    switch(optionName) {
      case 'prefix': {
        const prefix = args.shift();
        if (!prefix) {
          message.channel.send(this.getHelp(['prefix']))
        }

        await database.put(`config.${message.guild.id}.prefix`, prefix);
      } break;

      default: {
        message.channel.send(this.getHelp([]))
        return;
      }
    }
  }
}