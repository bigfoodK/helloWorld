import { Message, MessageReaction, User, MessageEmbed } from 'discord.js';
import { MusicInfo } from './types';

type SendPaginationQueueEmbedOptions = {
  height: number;
  timeoutMillisecond: number;
};

export default async function sendPaginationQueueEmbed(message: Message, musicInfoArray: MusicInfo[], options: SendPaginationQueueEmbedOptions = {
  height: 5,
  timeoutMillisecond: 30000,
}) {
  if (musicInfoArray.length < 1) {
    await message.channel.send(new MessageEmbed()
      .setColor('#ef5350')
      .setTitle('Music Queue is empty')
      .setDescription('Add some music')
    )
    return;
  }

  const emojiList = ['⏪', '⏩'];
  const pages: MessageEmbed[] = [];

  while (musicInfoArray.length > 0) {
    const musicInfoArrayChunk = musicInfoArray.splice(0, options.height);
    const embed = new MessageEmbed()
      .setColor('#2196f3')
      .setTitle('Music Queue')

    musicInfoArrayChunk.forEach(musicInfo => {
      const adder = message.guild?.member(musicInfo.adderId);
      embed.addField(`${musicInfo.title}`, `${musicInfo.url}
${adder ? adder.toString() + ' added': ''} at ${new Date(musicInfo.addedTime).toLocaleString()}
${musicInfo.playable ? 'ready to play' : 'downloading'}`)
    })

    pages.push(embed);
  }

  let page = 0;

  const currentPage = await message.channel.send(pages[page].setFooter(`Page ${page + 1} / ${pages.length}`));
  await Promise.all(emojiList.map(emoji => currentPage.react(emoji)))

  const reactionCollector = currentPage.createReactionCollector(
    (reaction: MessageReaction, user: User) => (emojiList.includes(reaction.emoji.name) && !user.bot),
    {time: options.timeoutMillisecond},
  )

  reactionCollector.on('collect', (reaction: MessageReaction) => {
		reaction.users.remove(message.author);
		switch (reaction.emoji.name) {
			case emojiList[0]:
				page = page > 0 ? --page : pages.length - 1;
				break;
			case emojiList[1]:
				page = page + 1 < pages.length ? ++page : 0;
				break;
			default:
				break;
		}
		currentPage.edit(pages[page].setFooter(`Page ${page + 1} / ${pages.length}`));
	});
	reactionCollector.on('end', () => {
    currentPage.reactions.removeAll()
    currentPage.delete();
  });
	return currentPage;
}
