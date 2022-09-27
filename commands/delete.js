const { SlashCommandBuilder } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Bulk delete 1-10 messages')
        .addIntegerOption((option) => option.setName('input').setDescription('A number from 1 - 10 inclusive').setRequired(true)),

    async execute(interaction) {
        const delAmount = interaction.options.getInteger('input');

        if (delAmount > 0 && delAmount <= 10) {
            interaction.channel.bulkDelete(delAmount)
                .then((messages) => interaction.reply(`Bulk deleted ${messages.size} messages.`))
                .catch(console.error);
        }
    },
};
