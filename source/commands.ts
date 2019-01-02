import { Message, Channel, TextChannel, DMChannel, GroupDMChannel } from "discord.js";

type Channels = TextChannel | DMChannel | GroupDMChannel;

export default class commands {
  commandList: {[key: string]: Function};

  constructor() {
    this.commandList = {
      "ping": this.ping,
      "test": this.test,
    };
  }

  run(commandName: string): Function{
    if (Object.keys(this.commandList).indexOf(commandName) == -1) {
      console.log("no such command exist");
      // throw Error('no such command exist');
      return (message: Message) => {
        const channel: Channels = message.channel;
        channel.send("no such command exist");
      };
    }
    return this.commandList[commandName];
  }

  ping(message: Message, args: Array<string>): void {
    const channel: Channels = message.channel;
    channel.send("pong");
    console.log("pong");
  }

  test(message: Message, args: Array<string>): void {
    const channel: Channels = message.channel;
    channel.send("works");
    console.log("works");
  }
}
