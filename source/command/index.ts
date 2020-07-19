import CommandBase from './CommandBase';
import { Message, RichEmbed } from 'discord.js';
import PingCommand from './PingCommand';
import ConfigCommand from './ConfigCommand';
import { ServerConfig } from './types';

class CommandManager {
  constructor(commands: CommandBase[]) {
    commands.forEach(command => {
      this.commands.set(command.name, command);
      command.aliases.forEach(alias => this.commands.set(alias, command));
    });
  }

  private commands: Map<string, CommandBase> = new Map();

  private help(message: Message, args: string[]) {
    const commandName = args.shift();
    const command = this.commands.get(commandName || '');

    if (command) {
      return message.channel.sendEmbed(command.getHelp(args));
    }

    const embed = new RichEmbed();
    embed.setTitle('Commands');

    this.commands.forEach((commandEntry, commandNameEntry) => {
      embed.addField(commandNameEntry, commandEntry.description, true);
    })

    message.channel.sendEmbed(embed);
  }

  public run(message: Message, serverConfig: ServerConfig) {
    const args = message.content.slice(serverConfig.prefix.length).split(/\s+/);

    const commandName = args.shift();

    if (!commandName) {
      return;
    }

    if (commandName === 'help') {
      this.help(message, args);
      return;
    }

    const command = this.commands.get(commandName);
    command?.handler(message, serverConfig, args);
  }
}

const commandManager = new CommandManager([
  new PingCommand(),
  new ConfigCommand(),
]);

export default commandManager;
