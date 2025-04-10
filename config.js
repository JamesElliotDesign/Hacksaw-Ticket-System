module.exports = {
    supportRoleIds: JSON.parse(process.env.SUPPORT_ROLE_IDS || '[]'),
    transcribeChannelId: process.env.TRANSCRIBE_CHANNEL_ID,
    ticketCategoryId: process.env.TICKET_CATEGORY_ID,
    closedTicketCategoryId: process.env.CLOSED_TICKET_CATEGORY_ID
  };
  