const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Returns the track queue, if any.'),

    async execute(interaction, servers) {
        const server = servers[interaction.guild.id];

        if (server && server.queue.length > 1) {

            let counter = 1;
            const tracks = server.queue.slice(1);
            const queueEmbed = new EmbedBuilder()
                .setTitle('Upcoming:')
                .setColor('#e60965');
            tracks.forEach((track) => {
                queueEmbed.addFields({ name: `${counter}.`, value: `${track.title} **[${track.timestamp}]** (requested by *${track.requestedBy}*)` });
                counter++;
            });
            interaction.channel.send({ embeds: [queueEmbed] });
        } else {
            interaction.reply('There is nothing in the queue.');
        }
    },
};
