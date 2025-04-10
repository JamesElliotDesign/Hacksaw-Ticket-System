const {
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const config = require('../config');

module.exports = {
  async closeTicket(interaction) {
    try {
      const channel = await interaction.guild.channels.fetch(interaction.channelId);

      if (!channel.name.startsWith('ticket-')) {
        console.warn('⛔ Not a ticket channel:', channel.name);
        await interaction.reply({
          content: 'This is not a ticket channel.',
          ephemeral: true
        });
        return;
      }

      const parts = channel.name.split('-');
      const userId = parts[parts.length - 1];

      // Rename channel to closed-type-username-userId
      const nameWithoutPrefix = parts.slice(1).join('-');
      await channel.setName(`closed-${nameWithoutPrefix}`);

      if (config.closedTicketCategoryId) {
        await channel.setParent(config.closedTicketCategoryId, { lockPermissions: false });
      }

      let user;
      try {
        user = await interaction.guild.members.fetch(userId);
      } catch {
        user = null;
        console.warn(`⚠️ Could not fetch user with ID ${userId}`);
      }

      const isSupport = user?.roles.cache.some(role =>
        config.supportRoleIds.includes(role.id)
      );

      if (user && !isSupport) {
        await channel.permissionOverwrites.edit(user.id, {
          ViewChannel: false
        });
      }

      console.log(`✅ Closing ticket for ${channel.name}`);

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: `Ticket closed. Only support staff can now view this channel.`,
        });
      } else {
        await interaction.reply({
          content: `Ticket closed. Only support staff can now view this channel.`,
          ephemeral: true
        });
      }

      await channel.send(`Ticket closed by <@${interaction.user.id}>.`);

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

    } catch (error) {
      console.error('❌ Error inside closeTicket:', error);

      try {
        if (interaction.deferred) {
          await interaction.editReply({ content: 'Something went wrong closing the ticket.', ephemeral: true });
        } else {
          await interaction.reply({ content: 'Something went wrong closing the ticket.', ephemeral: true });
        }
      } catch (failReply) {
        console.error('❌ Failed to send fallback reply:', failReply.message);
      }
    }
  }
};
