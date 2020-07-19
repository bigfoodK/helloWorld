import CommandBase from './CommandBase';
import { RichEmbed, Message } from 'discord.js';

export default class PingCommand extends CommandBase {
  readonly name = 'ping';

  readonly description = 'Just response "pong"';

  public getHelp() {
    return new RichEmbed()
      .setTitle('Pong')
      .addField('Description', 'Just response "pong"')
  }

  public async handler(message: Message, args: string[]) {
    const embed = new RichEmbed()
      .setTitle('Pong')
      .setFooter(`${(new Date).toLocaleTimeString()}`);

    args.forEach((arg, index) => {
      embed.addField(index, arg);
    })

    await message.channel.sendEmbed(embed);
    return;
  }
}