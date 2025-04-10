const { AttachmentBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  async transcribeAndDelete(interaction) {
    const channel = interaction.channel;

    if (!channel.name.startsWith('ticket-') && !channel.name.startsWith('closed-')) {
      await interaction.reply({
        content: 'This is not a valid ticket channel.',
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const messages = await channel.messages.fetch({ limit: 100 });
    const sorted = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    const transcript = sorted.map(msg => {
      const timestamp = new Date(msg.createdTimestamp).toLocaleString();
      const author = `${msg.author.tag}`;
      const content = msg.content || '[Embed/Attachment]';
      return `[${timestamp}] ${author}: ${content}`;
    }).join('\n');

    const fileName = `${channel.name}-transcript.txt`;
    const attachment = new AttachmentBuilder(Buffer.from(transcript), { name: fileName });

    const logChannel = interaction.guild.channels.cache.get(config.transcribeChannelId);
    if (logChannel) {
      await logChannel.send({
        content: `📝 Transcript from ${channel.name}`,
        files: [attachment]
      });
    }

    await channel.delete().catch(console.error);
  }
};
