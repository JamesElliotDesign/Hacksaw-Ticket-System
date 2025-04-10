const { ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = new ButtonBuilder()
  .setCustomId('close_ticket')
  .setLabel('Close Ticket')
  .setEmoji('<:lock:1359919107599896766>')
  .setStyle(ButtonStyle.Secondary);
