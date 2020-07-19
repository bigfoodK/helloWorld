import Bot from "./bot";

const bot: Bot = new Bot;

process.on('SIGINT', function() {
  console.log("program terminating...");
  bot.exit();
  process.exit();
});

bot.start();