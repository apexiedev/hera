import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { Event } from '../Interfaces';
import { moderationLogsSchema } from '../Models/moderationLogs';
import { partnersSchema } from '../Models/partners';

export const event: Event = {
    name: 'guildMemberRemove',
    run: async(client, member: GuildMember) => {
        if(member.user === client.user) {
            if(partnersSchema.findOne({ guild: member.guild.id })) {
                const logsChannel = client.channels.cache.find(ch => ch.id === moderationLogsSchema.findOne({ guild: client.config.partnership.mainGuild }).get('Channel'));
                if(!logsChannel) return;
                if (!((logsChannel): logsChannel is TextChannel => logsChannel.type === 'GUILD_TEXT')(logsChannel)) return;
                logsChannel.send({ embeds: [
                    new MessageEmbed()
                        .setColor(client.config.colors.negative)
                        .setTitle('Partnership broken')
                        .setDescription(
                            `**❯ Server ID:** ${member.guild.id}\n` +
                            `**❯ Server Name:**${member.guild.name}`
                        )
                ] });
            }
            return;
        }
        const modSchema = await moderationLogsSchema.findOne({ guild: member.guild.id });
        const logsChannel = client.channels.cache.find(ch => ch.id === modSchema.get('Channel'));
        if(!logsChannel) return;
        if (!((logsChannel): logsChannel is TextChannel => logsChannel.type === 'GUILD_TEXT')(logsChannel)) return;
        
        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_KICK',
        });
        // Since there's only 1 audit log entry in this collection, grab the first one
        const kickLog = fetchedLogs.entries.first();
    
        // Perform a coherence check to make sure that there's *something*
        if (!kickLog) return;
    
        // Now grab the user object of the person who kicked the member
        // Also grab the target of this action to double-check things
        const { executor, target } = kickLog;
    
        // Update the output with a bit more information
        // Also run a check to make sure that the log returned was for the same kicked member
        if ((target as unknown as GuildMember).id === member.id) {
            logsChannel.send({ embeds: [
                new MessageEmbed()
                    .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
                    .setColor(client.config.colors.negative)
                    .setTitle('Member kicked')
                    .setDescription(
                        `**❯ User ID:** ${member.user.id}\n` +
                        `**❯ Kicked by:** ${executor.tag}`
                    )
                    .setTimestamp()
            ] });
        } else {
            logsChannel.send({ embeds: [
                new MessageEmbed()
                    .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
                    .setColor(client.config.colors.negative)
                    .setTitle('Member kicked')
                    .setDescription(
                        `**❯ User ID:** ${member.user.id}`
                    )
                    .setTimestamp()
            ] });
        }
    }
}