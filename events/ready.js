const { sendTicketPanel } = require('../components/createTicketButton');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ ${client.user.tag} is online!`);

    const supportChannel = client.channels.cache.get('1359690407507656775');
    if (supportChannel) {
      await sendTicketPanel(supportChannel);
    }
  }
};
