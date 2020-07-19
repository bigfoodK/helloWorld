import CommandBase from './CommandBase';
import { Message, MessageEmbed } from 'discord.js';
import PingCommand from './PingCommand';
import ConfigCommand from './ConfigCommand';
import { ServerConfig } from './types';
import MusicCommand from './MusicCommand';

class CommandManager {
  constructor(commands: CommandBase[]) {
    commands.forEach(command => {
      this.commands.set(command.name, command);
      command.aliases.forEach(alias => this.commands.set(alias, command));
    });
  }

  private commands: Map<string, CommandBase> = new Map();

  private async help(message: Message, args: string[]) {
    const commandName = args.shift();
    const command = this.commands.get(commandName || '');

    if (command) {
      return await message.channel.send(command.getHelp(args));
    }

    const embed = new MessageEmbed();
    embed.setTitle('Commands');

    this.commands.forEach((commandEntry, commandNameEntry) => {
      embed.addField(commandNameEntry, commandEntry.description, true);
    })

    await message.channel.send(embed);
  }

  public async run(message: Message, serverConfig: ServerConfig) {
    const args = message.content.slice(serverConfig.prefix.length).split(/\s+/);

    const commandName = args.shift();

    if (!commandName) {
      return;
    }

    if (commandName === 'help') {
      await this.help(message, args);
      await message.delete();
      return;
    }

    const command = this.commands.get(commandName);
    await command?.handler(message, serverConfig, args);
    await message.delete();
  }
}

const commandManager = new CommandManager([
  new PingCommand(),
  new ConfigCommand(),
  new MusicCommand(),
]);

export default commandManager;
