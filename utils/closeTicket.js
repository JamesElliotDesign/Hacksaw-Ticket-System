const {
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const config = require('../config');

module.exports = {
  async closeTicket(interaction) {
    const channel = interaction.channel;

    if (!channel.name.startsWith('ticket-')) {
      await interaction.reply({
        content: 'This is not a ticket channel.',
        ephemeral: true
      });
      return;
    }

    // Safely extract username from channel name (last segment)
    const parts = channel.name.split('-'); // e.g., ["ticket", "comp", "hacksaw"]
    const userMention = parts[parts.length - 1];

    // Rename to closed-username
    await channel.setName(`closed-${userMention}`);

    // Move to closed ticket category if set
    if (config.closedTicketCategoryId) {
      await channel.setParent(config.closedTicketCategoryId, { lockPermissions: false });
    }

    // Try to find the user by username
    const user = interaction.guild.members.cache.find(
      m => m.user.username.toLowerCase() === userMention
    );

    // Only remove access if they are not support staff
    const isSupport = user?.roles.cache.some(role =>
      config.supportRoleIds.includes(role.id)
    );

    if (user && !isSupport) {
      await channel.permissionOverwrites.edit(user.id, {
        ViewChannel: false
      });
    }

    await interaction.reply({
      content: `Ticket closed. Only support staff can now view this channel.`,
      ephemeral: true
    });

    await channel.send(`Ticket closed by <@${interaction.user.id}>.`);

    // Send support-only buttons
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('transcribe_delete')
        .setLabel('Transcribe & Delete')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('reopen_ticket')
        .setLabel('Reopen Ticket')
        .setStyle(ButtonStyle.Success)
    );

    await channel.send({
      content: `Support team: use the button below to transcribe and archive this ticket.`,
      components: [row]
    });
  }
};
