import { Client, Message } from "discord.js";
import Commands from "./commands";
const config = require('../config.json');

export default class Bot {
  client: Client;
  commands: Commands;

  constructor() {
    this.client = new Client;
    this.commands = new Commands;

    this.client.once('ready', () => {
      console.log("im ready!");
    });

    this.client.on('message', (message: Message) => {
      if(message.author.bot) return;

      console.log(`${message.author.username}/${message.author.id}: ${message.content}`);
      const args: Array<string> = message.content.split(' ');
      this.commands.run(args[0])(message, args);
    });
  }

  start() {
    this.client.login(config.token);
  }
}