/* eslint-disable brace-style */

const fs = require('fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const { token } = require('./config.json');

const servers = {};

const zana = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent
	] 
});

zana.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	zana.commands.set(command.data.name, command);
}

zana.once('ready', () => {
	console.log('Zana is ready!');
	zana.user.setActivity('error messages', { type: ActivityType.Watching });
});

zana.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = zana.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction, servers);
	} catch (error) {
		console.error(error)
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

zana.login(token);
