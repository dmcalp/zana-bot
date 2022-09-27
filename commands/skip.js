const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current track'),

    async execute(interaction, servers) {
        const server = servers[interaction.guild.id];

        if (getVoiceConnection(interaction.guild.id) !== undefined) {
            server.audioPlayer.stop(true);
            interaction.reply('Skipping track..');
        } else {
            interaction.reply({ content: 'Skip failed - no media playing.', ephemeral: true });
        }
    },
};
