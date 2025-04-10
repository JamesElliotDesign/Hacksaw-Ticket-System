const config = require('../config');
const { PermissionsBitField } = require('discord.js');

module.exports = {
  async reopenTicket(interaction) {
    const channel = interaction.channel;
    const name = channel.name.replace('closed-', 'ticket-');

    if (!channel.name.startsWith('closed-')) {
      await interaction.reply({
        content: 'This is not a closed ticket channel.',
        ephemeral: true
      });
      return;
    }

    // Rename and move back to main category
    await channel.setName(name);
    await channel.setParent(config.ticketCategoryId, { lockPermissions: false });

    // Restore user access
    const userMention = name.split('-').slice(2).join('-'); // remove 'ticket-type-'
    const member = interaction.guild.members.cache.find(
      m => m.user.username.toLowerCase() === userMention
    );

    if (member) {
      await channel.permissionOverwrites.edit(member.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });
    }

    await interaction.reply({
      content: 'Ticket has been reopened.',
      ephemeral: true
    });

    await channel.send(`Ticket reopened by <@${interaction.user.id}>.`);
  }
};
