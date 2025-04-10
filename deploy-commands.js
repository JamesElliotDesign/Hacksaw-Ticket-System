require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Your bot token and client/server IDs
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;      // App ID from Discord Dev Portal
const guildId = process.env.GUILD_ID;        // Your server's ID

// Load all slash command data
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if ('data' in command) {
    commands.push(command.data.toJSON());
  }
}

// Register commands
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`📡 Deploying ${commands.length} slash command(s)...`);

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log('✅ Slash commands deployed successfully!');
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
})();
