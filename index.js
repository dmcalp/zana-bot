/* eslint-disable brace-style */
const Discord = require('discord.js');
const { prefix, token, mwemail, mwpass } = require('./config.json');
const fs = require('fs');

const zana = new Discord.Client();
zana.commands = new Discord.Collection();

zana.once('ready', () => {
	console.log('Zana is ready!');
});

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	zana.commands.set(command.name, command);
}

const servers = {};

zana.on('message', async (message) => {
	if (!message.guild) return; 	// prevents use in direct messages
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	if (!zana.commands.has(command)) return;

	try {
		zana.commands.get(command).execute(message, args, servers, Discord);
	}	catch (error) {
		console.error(error);
		message.channel.send('Something went wrong!');
	}
});


zana.once('ready', () => {
	
	zana.user.setPresence({
		status: 'online',
		activity: {
			name: 'code fail',
			type: 'WATCHING'
		}
	});
	
});

zana.login(token);
