const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses/unpauses the current track'),

    async execute(interaction, servers) {
        const server = servers[interaction.guild.id];
        let action = "An error occurred.";
        
        if (server.audioPlayer._state.status == 'playing') {
            server.audioPlayer.pause();
            action = "Track paused.";
        }
        else if (server.audioPlayer._state.status == 'paused') {
            server.audioPlayer.unpause();
            action = "Track resumed.";
        }
        
        interaction.reply(action);

    },
}