const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Returns Zana\'s Ping'),
	async execute(interaction) {
		await interaction.reply(`Zana's ping is currently: ${interaction.client.ws.ping}`);
	},
};