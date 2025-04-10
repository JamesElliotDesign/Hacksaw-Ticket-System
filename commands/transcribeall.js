const { SlashCommandBuilder, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('transcribeall')
    .setDescription('Transcribe and delete all closed ticket channels.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    // Use flags instead of deprecated `ephemeral`
    await interaction.deferReply({ flags: 64 }); // 64 = ephemeral

    const guild = interaction.guild;
    const logChannel = guild.channels.cache.get(config.transcribeChannelId);
    const closedChannels = guild.channels.cache.filter(ch => ch.name.startsWith('closed-'));

    if (!logChannel) {
      return await interaction.editReply('❌ Transcribe channel not found.');
    }

    if (closedChannels.size === 0) {
      return await interaction.editReply('✅ No closed tickets to process.');
    }

    let processed = 0;
    for (const [, channel] of closedChannels) {
      try {
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

        await logChannel.send({
          content: `🗂 Transcript from ${channel.name}`,
          files: [attachment]
        });

        await channel.delete();
        processed++;
      } catch (err) {
        console.error(`Error processing channel ${channel.name}:`, err);
      }
    }

    await interaction.editReply(`✅ Finished processing ${processed} ticket(s).`);
  }
};
