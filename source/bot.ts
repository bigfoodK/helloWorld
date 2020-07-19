import { Client, Message } from 'discord.js';
import config from './config';
import commandManager from './command';
import { getConfig } from './command/utils';

export default class Bot {
  constructor() {
    this.client = new Client;

    this.client.once('ready', () => {
      console.log("im ready!");
    });

    this.client.on('message', this.handleMessage);
  }

  private client: Client = new Client();

  private async handleMessage(message: Message) {
    if (!message.guild) {
      return;
    }
    const serverConfig =  await getConfig(message.guild.id);
    const { prefix } = serverConfig;

    if (message.author.bot || !message.content.startsWith(prefix)) {
      return;
    }

    console.log(`${message.author.username}/${message.author.id}: ${message.content}`);

    await commandManager.run(message, serverConfig);
  }

  public start() {
    this.client.login(config.tokken);
  }

  public exit() {
    this.client.destroy();
  }
}