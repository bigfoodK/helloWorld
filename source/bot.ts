import { Client, Message } from 'discord.js';
import config from './config';
import commandManager from './command';

export default class Bot {
  constructor() {
    this.client = new Client;

    this.client.once('ready', () => {
      console.log("im ready!");
    });

    this.client.on('message', this.handleMessage);
  }

  private client: Client = new Client();

  private handleMessage(message: Message) {
    if (message.author.bot || !message.content.startsWith(config.prefix)) {
      return;
    }

    console.log(`${message.author.username}/${message.author.id}: ${message.content}`);

    commandManager.run(message);
  }

  public start() {
    this.client.login(config.tokken);
  }

  public exit() {
    this.client.destroy();
  }
}