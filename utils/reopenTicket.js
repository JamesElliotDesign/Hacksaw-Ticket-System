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

    // 🔁 Clean up old button messages sent by the bot
    const messages = await channel.messages.fetch({ limit: 50 }); // scan last 50
    const botMessagesWithButtons = messages.filter(
      m => m.author.id === interaction.client.user.id && m.components.length > 0
    );

    for (const [, msg] of botMessagesWithButtons) {
      await msg.delete().catch(() => null); // ignore if already deleted
    }

    // ✅ Send fresh button row (without Transcribe & Delete)
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: 'Support team: use the button below to close this ticket again if needed.',
      components: [row]
    });
  }
};
