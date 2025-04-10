const { Events } = require('discord.js');
const { createTicketChannel } = require('../utils/createTicketChannel');
const { closeTicket } = require('../utils/closeTicket');
const { transcribeAndDelete } = require('../utils/transcribeAndDelete');
const { reopenTicket } = require('../utils/reopenTicket');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Handle buttons
    if (interaction.isButton()) {
      if (interaction.customId.startsWith('create_ticket_')) {
        const type = interaction.customId.replace('create_ticket_', '');
        await createTicketChannel(interaction, type);
      }
    
      if (interaction.customId === 'close_ticket') {
        await closeTicket(interaction);
      }
    
      if (interaction.customId === 'transcribe_delete') {
        await transcribeAndDelete(interaction);
      }

      if (interaction.customId === 'reopen_ticket') {
        await reopenTicket(interaction);
      }
      
    }    

    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`❌ Error in command ${interaction.commandName}:`, error);
        if (interaction.deferred) {
          await interaction.editReply({ content: 'Something went wrong.', ephemeral: true });
        } else {
          await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
        }
      }
    }
  }
};
