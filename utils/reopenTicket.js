const config = require('../config');
const { createTicketChannel } = require('./createTicketChannel');

module.exports = {
  async reopenTicket(interaction) {
    const oldChannel = interaction.channel;

    if (!oldChannel.name.startsWith('closed-')) {
      return await interaction.reply({
        content: 'This is not a closed ticket channel.',
        ephemeral: true
      });
    }

    const parts = oldChannel.name.split('-');
    const type = parts[1];
    const userId = parts[parts.length - 1];

    let user;
    try {
      user = await interaction.guild.members.fetch(userId);
    } catch (err) {
      return await interaction.reply({
        content: `❌ Could not find the user for this ticket.`,
        ephemeral: true
      });
    }

    // Fetch recent messages (context)
    let context = '';
    try {
      const messages = await oldChannel.messages.fetch({ limit: 25 });
      const sorted = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

      context = sorted.map(msg => {
        const timestamp = new Date(msg.createdTimestamp).toLocaleString();
        const author = `${msg.author.tag}`;
        const content = msg.content || '[Embed/Attachment]';
        return `[${timestamp}] ${author}: ${content}`;
      }).join('\n');
    } catch {
      context = '⚠️ Could not fetch previous messages.';
    }

    // Recreate ticket
    const fakeInteraction = {
      guild: interaction.guild,
      user: user.user,
      reply: async () => {},
    };

    const newChannel = await createTicketChannel(fakeInteraction, type, userId);

    if (!newChannel) {
      return await interaction.reply({
        content: '❌ Failed to recreate the ticket channel.',
        ephemeral: true
      });
    }

    // Send context to the new ticket
    await newChannel.send({
      content: `Ticket was reopened by <@${interaction.user.id}> from <#${oldChannel.id}>.`,
    });

    if (context) {
      await newChannel.send({
        files: [{
          attachment: Buffer.from(context),
          name: `previous-transcript.txt`
        }]
      });
    }

    // Delete old closed ticket
    await oldChannel.delete().catch(err => {
      console.warn(`⚠️ Failed to delete closed ticket:`, err.message);
    });

    return await interaction.reply({
      content: `✅ Reopened the ticket in ${newChannel}.`,
      ephemeral: true
    });
  }
};
