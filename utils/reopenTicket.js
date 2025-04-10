const config = require('../config');
const {
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  async reopenTicket(interaction) {
    const channel = interaction.channel;

    if (!channel.name.startsWith('closed-')) {
      return interaction.reply({
        content: 'This is not a closed ticket channel.',
        ephemeral: true
      });
    }

    // Defer interaction early to prevent it from expiring
    await interaction.deferReply({ ephemeral: true });

    const parts = channel.name.split('-'); // closed-type-username
    const type = parts[1];
    const username = parts.slice(2).join('-');

    const name = `ticket-${type}-${username}`;

    const member = interaction.guild.members.cache.find(
      m => m.user.username.toLowerCase() === username
    );

    if (!member) {
      return interaction.editReply({
        content: `Could not find user \`${username}\`.`
      });
    }

    // Rename and move the channel
    await channel.setName(name);
    await channel.setParent(config.ticketCategoryId, { lockPermissions: false });

    // Reset permissions
    await channel.permissionOverwrites.set([
      {
        id: interaction.guild.roles.everyone,
        deny: [PermissionsBitField.Flags.ViewChannel]
      },
      {
        id: member.id,
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
    ]);

    // Delete all old bot messages with buttons
    const messages = await channel.messages.fetch({ limit: 50 });
    const botMessages = messages.filter(
      m => m.author.id === interaction.client.user.id && m.components.length > 0
    );
    for (const [, msg] of botMessages) {
      await msg.delete().catch(() => null);
    }

    // Send new ticket UI
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    const embed = new EmbedBuilder()
      .setTitle(`Support Ticket – ${capitalizedType}`)
      .setDescription('This ticket has been reopened. A member of our support team will be with you shortly.\n\nUse the button below to manage your ticket.')
      .setColor(0xe1501b);

    const supportMentions = config.supportRoleIds.map(id => `<@&${id}>`).join(' ');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close Ticket')
        .setEmoji('<:lock:1359919107599896766>')
        .setStyle(ButtonStyle.Secondary)
    );

    await channel.send({
      content: `<@${member.id}> ${supportMentions}`,
      embeds: [embed],
      components: [row]
    });

    await interaction.editReply({
      content: '✅ Ticket has been successfully reopened and reset.'
    });

    await channel.send(`🔁 Ticket reopened by <@${interaction.user.id}>.`);
  }
};
