const { sendTicketPanel } = require('../components/createTicketButton');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ ${client.user.tag} is online!`);

    const supportChannel = client.channels.cache.get('1359690407507656775');
    if (!supportChannel) return;

    try {
      // Fetch last 10 messages
      const messages = await supportChannel.messages.fetch({ limit: 10 });

      const existingPanel = messages.find(
        msg =>
          msg.author.id === client.user.id &&
          msg.embeds.length > 0 &&
          msg.components.length > 0
      );

      if (existingPanel) {
        console.log('📌 Ticket panel already exists. Skipping resend.');
        return;
      }

      // No panel found — send a new one
      await sendTicketPanel(supportChannel);
      console.log('🆕 Ticket panel sent.');

    } catch (err) {
      console.error('❌ Error checking or sending ticket panel:', err);
    }
  }
};
