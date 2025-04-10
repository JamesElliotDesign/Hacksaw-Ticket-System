const config = require('../config');
const { createTicketChannel } = require('./createTicketChannel');

module.exports = {
  async reopenTicket(interaction) {
    const channel = interaction.channel;

    if (!channel.name.startsWith('closed-')) {
      return interaction.reply({
        content: 'This is not a closed ticket channel.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const parts = channel.name.split('-');
    const type = parts[1];
    const username = parts.slice(2).join('-');

    const member = interaction.guild.members.cache.find(
      m => m.user.username.toLowerCase() === username
    );

    if (!member) {
      return interaction.editReply({
        content: `Could not find user \`${username}\`.`
      });
    }

    // 📜 Fetch messages from the old ticket
    const oldMessages = await channel.messages.fetch({ limit: 50 }).catch(() => null);

    // ✅ Edit reply BEFORE deleting the old channel
    await interaction.editReply({
      content: `✅ A new ticket will be created for <@${member.id}> shortly...`
    });

    // ❌ Delete the closed ticket
    await channel.delete().catch(() => null);

    // 🔁 Fake interaction to reuse createTicketChannel()
    const fakeInteraction = {
      guild: interaction.guild,
      user: member.user,
      replied: true,
      deferred: true,
      reply: async () => {}
    };

    const newChannel = await createTicketChannel(fakeInteraction, type);

    // 📨 Repost original messages (safe version)
    if (oldMessages && oldMessages.size > 0) {
      const sorted = [...oldMessages.values()]
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
        .slice(0, 15); // Limit reposting to 15 messages

      await newChannel.send(`🗃 Reopened ticket — here are recent messages from the original thread:\n`);

      for (const msg of sorted) {
        const content = msg.content || '[Embed/Attachment]';
        await newChannel.send(`**${msg.author.tag}**: ${content}`).catch(() => {});
      }
    }

    await newChannel.send(`🔁 Ticket reopened by <@${interaction.user.id}>.`);
  }
};
