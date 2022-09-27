const { SlashCommandBuilder } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Return the users avatar'),

    async execute(interaction) {
        await interaction.reply(interaction.user.avatarURL());
    },
};
