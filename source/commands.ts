import { Message, TextChannel, DMChannel, GroupDMChannel, MessageReaction, User, ClientUser, Collection } from "discord.js";

type Channels = TextChannel | DMChannel | GroupDMChannel;

export default class commands {
  commandList: {[key: string]: Function};

  constructor() {
    this.commandList = {
      "ping": this.ping,
      "test": this.test,
      "섹": this.섹,
      "제비뽑기": this.제비뽑기,
      "광고체": this.광고체,
    };
  }

  run(commandName: string): Function{
    if (Object.keys(this.commandList).indexOf(commandName) == -1) {
      const errorMessage = `command ${commandName} is not exist`
      throw errorMessage;
    }
    return this.commandList[commandName];
  }

  ping(message: Message): void {
    const channel: Channels = message.channel;
    channel.send("pong");
    console.log("pong");
  }

  test(message: Message): void {
    const channel: Channels = message.channel;
    channel.send("works");
    console.log("works");
  }

  섹(message: Message) {
    const channel: Channels = message.channel;
    channel.send("스");
    console.log("스");
  }

  async 제비뽑기(message: Message, timeRaw: string = "5") {
    const channel: Channels = message.channel;
    const time: number = +timeRaw;

    if(time === NaN) {
      const errorMessage: string = `${timeRaw} is not number`;
      channel.send(errorMessage);
      throw errorMessage;
    }
    if(time < 0) {
      const errorMessage: string = `${timeRaw} is lower than 0`;
      channel.send(errorMessage);
      throw errorMessage;
    }
    if(time > 10) {
      const errorMessage: string = `${timeRaw} is bigger than 10`;
      channel.send(errorMessage);
      throw errorMessage;
    }

    const reactionName: string = '✋';
    const userList: Array<string> = [];
    const filter = (reaction: MessageReaction, user: User) => {
      return reaction.emoji.name === reactionName && !user.bot;
    }
    // 물어볼것: Type | Type[] 형식을 섹시하게 한 변수에 Type으로 저장하는 법
    let board = await channel.send("할 사람 손");
    if(!(board instanceof Message)) {
      board = board[0];
    }
    board.react(reactionName);
    const collector = board.createReactionCollector(filter, {time: time * 1000});

    collector.on('end', (collected: Map<string, MessageReaction>) => {
      const messageReaction = collected.get(reactionName);

      if(!messageReaction) {
        console.error(`MessageReaction named ${reactionName} is not exit`);
        return;
      }
      
      messageReaction.users.forEach((user) => {
        if(user.bot) return;
        userList.push(user.username);
      });

      if(!userList.length) {
        channel.send("아무도 투표하지 않았네요 찐따쉨");
        return;
      }

      const pick = userList[Math.floor(Math.random() * userList.length)];
      const templates: Array<string> = [
        `용의자 목록\n${userList.join('\n')}\n\n범인은 ${pick}`,
        `☆정신병원 환자 목록☆\n${userList.join('\n')}\n\n이 중에서 수석환자는 ${pick}`,
        `범죄자 목록\n${userList.join('\n')}\n\n해명해야 할 사람은 ${pick}`,
        `꼬추s\n${userList.join('\n')}\n\n특히 ${pick} 얘는 나노꼬추`,
        `치킨 먹은 사람들\n${userList.join('\n')}\n\n계산은 ${pick} 카드로`,
        `우르닐 파티\n${userList.join('\n')}\n\n바드 할 사람은 ${pick}`,
      ];

      channel.send(templates[Math.floor(Math.random() * templates.length)]);
    });
  }

  광고체(message: Message, ...words: string[]) {
    const channel: Channels = message.channel;
    const result: string[] = [];
    console.log(words);
    // const words = message.content.split(' ');
    if(!words) throw new Error('there is no input');
    
    words.forEach((word) => {
      const preset = [
        `☆${word}`,
        `★${word}`,
        `▷${word}`,
        `☎${word}`,
        `100%합법◇${word}`,
        `◇${word}`,
        `◆${word}`,
        `.${word}`,
        `*${word}`,
        `@@@${word}`,
        `$$${word}`,
        `♚${word}`,
        `￥${word}`,
        `♜${word}`,
        `→${word}`,
        `☞${word}`,
        `♡${word}`,
        `♬${word}`,
        `♜${word}`,
    
        `♜${word}♜`,
        `￥${word}￥`,
        `◇${word}◇`,
        `☆${word}☆`,
        `★${word}★`,
        `◐${word}◑`,
        `☞${word}☜`,
        `→${word}←`,
        `♬${word}♬`,
        `♨${word}♨`,
        `▲${word}▲`,
        `♠${word}♠`,
        `▷${word}◁`,
        `▶${word}◀`,
        `♥${word}♥`,
        `§${word}§`,
    
        `♚♚${word}♚♚`,
        `§§${word}§§`,
        `♣♣${word}♣♣`,
        `★★${word}★★`,
        `☆★${word}★☆`,
        `☆☆${word}☆☆`,
        `※※${word}※※`,
      ];
    
      result.push(preset[Math.floor(Math.random() * preset.length)]);
    });
  
    channel.send(result.join(''));
  }
}

