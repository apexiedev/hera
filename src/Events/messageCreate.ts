import { Event, Command } from '../Interfaces';
import { Message } from 'discord.js';
import { prefixCollection } from '../Collections/prefix';
import Levels from 'discord-xp';

export const event: Event = {
    name: 'messageCreate',
    run: async (client, message: Message) => {
        if(
            message.author.bot ||
            !message.guild
        ) return;

        const randomXp = Math.floor(Math.random() * 9) + 1;
        const hasLeveledUp = await Levels.appendXp(message.author.id, message.guild.id, randomXp);
        if(hasLeveledUp) {
            const user = await Levels.fetch(message.author.id, message.guild.id);
            message.channel.send(`Congratulations, ${message.author}. You made it to level **${user.level}**`);
        }
    }
}