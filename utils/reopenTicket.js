const config = require('../config');
const {
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = {
  async reopenTicket(interaction) {
    const channel = interaction.channel;

    if (!channel.name.startsWith('closed-')) {
      await interaction.reply({
        content: 'This is not a closed ticket channel.',
        ephemeral: true
      });
      return;
    }

    // Rename channel from closed- to ticket-
    const name = channel.name.replace('closed-', 'ticket-');
    await channel.setName(name);
    await channel.setParent(config.ticketCategoryId, { lockPermissions: false });

    // Extract user ID from the last part of the channel name
    const parts = name.split('-');
    const userId = parts[parts.length - 1];

    let member;
    try {
      member = await interaction.guild.members.fetch(userId);
    } catch {
      member = null;
    }

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

    // 🧼 Delete old button messages to prevent expired interaction errors
    try {
      const messages = await channel.messages.fetch({ limit: 10 });
      const buttonMessages = messages.filter(m => m.components?.length > 0);
      for (const [, msg] of buttonMessages) {
        await msg.delete().catch(() => {});
      }
    } catch (err) {
      console.warn('Could not delete old button messages:', err.message);
    }

    // ✅ Send a fresh Close Ticket button
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close Ticket')
        .setEmoji('<:lock:1359919107599896766>')
        .setStyle(ButtonStyle.Secondary)
    );

    await channel.send({
      content: 'You may close this ticket again when resolved:',
      components: [row]
    });
  }
};
