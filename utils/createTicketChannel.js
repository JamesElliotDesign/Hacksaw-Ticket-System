const {
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const config = require('../config');

module.exports = {
  async createTicketChannel(interaction, type = 'general') {
    const guild = interaction.guild;
    const user = interaction.user;

    // Updated name format includes user ID
    const name = `ticket-${type}-${user.username.toLowerCase()}-${user.id}`;

    // Check if user already has a ticket of this type open
    const existing = guild.channels.cache.find(ch => ch.name === name);
    if (existing) {
      await interaction.reply({
        content: `You already have an open ${type} ticket: ${existing}`,
        ephemeral: true
      });
      return;
    }

    const channel = await guild.channels.create({
      name,
      type: ChannelType.GuildText,
      parent: config.ticketCategoryId,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        },
        ...config.supportRoleIds.map(roleId => ({
          id: roleId,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.ManageChannels
          ]
        }))
      ]
    });

    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

    const embed = new EmbedBuilder()
      .setTitle(`Support Ticket – ${capitalizedType}`)
      .setDescription('A member of our support team will be with you shortly.\n\nUse the buttons below to manage your ticket.')
      .setColor(0xe1501b);

    const supportMentions = config.supportRoleIds.map(id => `<@&${id}>`).join(' ');

    const closeRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close Ticket')
        .setEmoji('<:lock:1359919107599896766>')
        .setStyle(ButtonStyle.Secondary)
    );

    await channel.send({
      content: `<@${user.id}> ${supportMentions}`,
      embeds: [embed],
      components: [closeRow]
    });

    await interaction.reply({
      content: `Ticket created: ${channel}`,
      ephemeral: true
    });
  }
};
