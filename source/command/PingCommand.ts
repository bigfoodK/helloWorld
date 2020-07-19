import CommandBase from './CommandBase';
import { Message, MessageEmbed } from 'discord.js';
import { ServerConfig } from './types';

export default class PingCommand extends CommandBase {
  readonly name = 'ping';

  readonly aliases = [];

  readonly description = 'Just response "pong"';

  public getHelp() {
    return new MessageEmbed()
      .setTitle('Pong')
      .addField('Description', 'Just response "pong"')
  }

  public async handler(message: Message, serverConfig:ServerConfig, args: string[]) {
    const embed = new MessageEmbed()
      .setTitle('Pong')
      .setFooter(`${(new Date).toLocaleTimeString()}`);

    args.forEach((arg, index) => {
      embed.addField(index, arg);
    })

    await message.channel.send(embed);
    return;
  }
}