const fs = require('fs');
const Discord = require('discord.js');
const settings = require('./settings.json');

const botToken = settings["token"];
const client = new Discord.Client();

client.once('ready', () => {
    console.log('Ready!');
});

client.login(botToken);
