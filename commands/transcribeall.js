const { SlashCommandBuilder, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('transcribeall')
    .setDescription('Transcribe and delete all closed ticket channels.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 }); // ephemeral

    const guild = interaction.guild;
    const logChannel = guild.channels.cache.get(config.transcribeChannelId);
    const closedCategoryId = '1359691252886540670'; // Your Closed Tickets Category

    if (!logChannel) {
      return await interaction.editReply('❌ Transcribe channel not found.');
    }

    // Only channels under the closed category
    const closedChannels = guild.channels.cache.filter(
      ch => ch.parentId === closedCategoryId && ch.type === 0 // text channels only
    );

    if (closedChannels.size === 0) {
      return await interaction.editReply('✅ No closed tickets to process.');
    }

    let processed = 0;
    let skipped = 0;

    for (const [, channel] of closedChannels) {
      try {
        const perms = channel.permissionsFor(guild.members.me);
        if (!perms.has(['ViewChannel', 'ReadMessageHistory'])) {
          console.warn(`⚠️ Skipping ${channel.name} — missing permissions`);
          skipped++;
          continue;
        }

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
        console.error(`❌ Error processing ${channel.name}:`, err);
        skipped++;
      }
    }

    await interaction.editReply(
      `✅ Transcribed and deleted ${processed} ticket(s).\n${skipped > 0 ? `⚠️ Skipped ${skipped} channel(s) due to errors or permissions.` : ''}`
    );
  }
};
