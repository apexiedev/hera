import { GuildMember, Interaction, RoleResolvable } from 'discord.js';
import { Event } from '../Interfaces';
import { rolesSchema as Schema } from '../Models/roles';

export const event: Event = {
    name: 'interactionCreate',
    run: async(client, interaction: Interaction) => {
        if(interaction.isButton()) {
			Schema.findOne({ Role: interaction.customId }, async(err, data) => {
				const role = interaction.guild.roles.cache.get(interaction.customId);

				if(data) {
					if((data.Users as string[]).includes(interaction.user.id)) {
						const filtered = (data.Users as string[]).filter((target) => target !== interaction.user.id);
						await Schema.findOneAndUpdate({ Role: interaction.customId }, {
							Role: interaction.customId,
							Users: filtered
						});
						(interaction.member as GuildMember).roles.remove((interaction.customId as RoleResolvable));
						return interaction.reply({ content: `You've been removed the **${role.name}** role.`, ephemeral: true });
					}

					(data.Users as string[]).push(interaction.user.id);
					data.save();
					(interaction.member as GuildMember).roles.add((interaction.customId as RoleResolvable));
				} else {
					new Schema({
						Role: interaction.customId,
						Users: [ interaction.user.id ]
					}).save();
					(interaction.member as GuildMember).roles.add((interaction.customId as RoleResolvable));
				}
				interaction.reply({ content: `You got the **${role.name}** role.`, ephemeral: true });
			});
		}

		if(interaction.isCommand()) {
			if (!client.commands.has(interaction.commandName)) return;

			try {
				await client.commands.get(interaction.commandName).execute(interaction, client);
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
    }
}