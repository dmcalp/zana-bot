const { SlashCommandBuilder, CommandInteractionOptionResolver } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('choose')
        .setDescription('Chooses between comma-separated values.')
        .addStringOption(option => option.setName('input').setDescription('MW2, RL, Arma 3 etc.').setRequired(true)),

    async execute(interaction) {
        const userChoices = interaction.options.getString('input').split(',');    
        const trimmedOptions = userChoices.map(op => op.trim());
        const choice = trimmedOptions[Math.floor(Math.random() * trimmedOptions.length)];
        
        // user input of only commas will return blank message
        if (!choice) return interaction.reply('Choice failed - incorrect input.');
        
        interaction.reply(`${choice} is the winner.`);
    }
}