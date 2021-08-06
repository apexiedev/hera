import { Command } from '../../Interfaces';
import Levels from 'discord-xp';
import Canvacord from 'canvacord';
import { MessageAttachment, PresenceStatus } from 'discord.js';

export const command: Command = {
    name: 'rank',
    type: 'bot',
    category: 'Leveling',
    description: 'See your current ranking on the server',
    run: async(client, args, interaction) => {
        const user = await Levels.fetch(interaction.user.id, interaction.guild.id);

        const neededXp = Levels.xpFor(user.level + 1);

        const turnToCanvacordStatus = (s: PresenceStatus): "online"|"idle"|"dnd"|"offline"|"streaming" => s === "invisible" ? "offline" : s;

        const rank = new Canvacord.Rank()
            .setAvatar(interaction.user.displayAvatarURL({ dynamic: false, format: 'png' }))
            .setCurrentXP(user.xp)
            .setRequiredXP(neededXp)
            .setLevel(user.level)
            .setStatus(turnToCanvacordStatus(interaction.guild.members.cache.get(interaction.user.id).presence.status), true)
            .setProgressBar(client.config.colors.main.toString(), 'COLOR')
            .setUsername(interaction.user.username)
            .setDiscriminator(interaction.user.discriminator);
        rank.build({ "fontX": "Manrope", "fontY": "Manrope" })
            .then(data => {
                const attachment = new MessageAttachment(data, `rankCard.png`);
                interaction.reply({ files: [attachment] });
            });

        /* const rankEmbed = new MessageEmbed()
            .setTitle(`${message.author.username}'s ranking`)
            .setColor(client.config.colors.main)
            .addField('Current level', user.level.toString(), true)
            .addField('Current XP', user.xp.toString(), true)
            .addField('Goal', `You need **${Levels.xpFor(user.level + 1)}** XP to reach level **${user.level + 1}**`)
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }));
        
        message.reply({ embeds: [ rankEmbed ] }); */


    }
}