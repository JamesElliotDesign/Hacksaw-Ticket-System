const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  async sendTicketPanel(channel) {
    const embed = new EmbedBuilder()
      .setTitle('Need Help?')
      .setDescription(
        `Click the button below to open a private support ticket with our team.\n
Please allow up to 48 hours for a response — our team is active, but we’re also human.\n\n` +

        `**Ticket Guidelines**\n` +
        `- Don’t ping staff — we’ll respond as soon as we can.\n` +
        `- Tickets with no player reply after 24h will be closed.\n` +
        `- Vehicles are *drive at your own risk* — no comp without valid reason.\n` +
        `- Please avoid tickets for being “stuck” — try https://discord.com/channels/1217816664268083220/1254765445429334087 first.\n` +
        `- Compensation requires *proof* and a valid *server-related issue* (screenshots or video).\n\n` +

        `**Approved Claims**\n` +
        `• Safe zone theft.\n` +
        `• Missing trader items.\n` +
        `• Bugged vehicles.\n` +
        `• Cheater-related losses.\n` +
        `• Crafted/Dono items loss.\n\n` +

        `**Denied Claims**\n` +
        `• Code lock loss.\n` +
        `• Ruined or PvP-lost items.\n` +
        `• Water/AI/turret damage.\n` +
        `• Lost Hacksaw Tokens.\n` +
        `• Lack of *proof*.`
      )
      .setColor(0xe1501b);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('create_ticket_comp')
          .setLabel('Compensation Request')
          .setEmoji('<:compensation:1359913512691962086>')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('create_ticket_donation')
          .setLabel('Donation')
          .setEmoji('<:donation:1359913514528931941>')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('create_ticket_report')
          .setLabel('Report Player')
          .setEmoji('<:report:1359913518144684163>')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('create_ticket_other')
          .setLabel('Other')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('<:other:1359913516227760281>') // Your custom emoji
      );
  
      await channel.send({ embeds: [embed], components: [row] });
    }
  };
