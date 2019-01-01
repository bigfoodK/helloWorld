import * as Discord from 'discord.js';

// const Discord = require('discord.js');
const settings = require('./settings.json');

const botToken = settings.token;

export default class extends Discord.Client {
  constructor() {
    this.client = new Discord.Client();
    this.client.once('ready', () => {
      console.log('Ready!');
    });
  }
  run() {
    client.login(botToken);
  }
}



