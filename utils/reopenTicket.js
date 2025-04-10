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

    // Defer the interaction to prevent expiration
    await interaction.deferReply({ ephemeral: true });

    // Parse ticket info from channel name: closed-comp-username
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

    // Delete the old closed ticket channel
    await channel.delete().catch(() => null);

    // Use a dummy interaction to create a new ticket with original user
    const fakeInteraction = {
      guild: interaction.guild,
      user: member.user,
      replied: true,
      deferred: true,
      reply: async () => {}
    };

    const newChannel = await createTicketChannel(fakeInteraction, type);

    // Send reference and notification in new ticket
    await newChannel.send(`🔁 This ticket was reopened by <@${interaction.user.id}>.\n🗃️ Previous ticket was archived.`);

    await interaction.editReply({
      content: `✅ A new ticket has been created for <@${member.id}> in <#${newChannel.id}>.`
    });
  }
};
