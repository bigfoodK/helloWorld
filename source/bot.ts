import { Client, Message } from "discord.js";
const config = require('../config.json');

export default class Bot {
  client: Client;

  constructor() {
    this.client = new Client;

    this.client.once('ready', () => {
      console.log("im ready!");
    });

    this.client.on('message', (message: Message) => {
      if(message.author.bot) {
        return;
      }
      console.log("sex 하십시오");
    });
  }

  start() {
    this.client.login(config.token);
  }
}