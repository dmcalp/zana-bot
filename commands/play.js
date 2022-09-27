const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const playdl = require('play-dl');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { NoSubscriberBehavior } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays audio from a youtube search or link')
        .addStringOption((option) => option.setName('input').setDescription('Song name or URL').setRequired(true)),

    async execute(interaction, servers) {
        if (!servers[interaction.guild.id]) {
            servers[interaction.guild.id] = { queue: [] };
        }
        const server = servers[interaction.guild.id];
        const userChoice = interaction.options.getString('input');

        if (interaction.member.voice.channel) {
            if (userChoice.startsWith('https') && playdl.yt_validate(userChoice) === 'video') {
                server.queue.push(userChoice);
                interaction.reply('Song added!');
            } else {

                const results = await playdl.search(userChoice, { limit: 1 });

                if (results[0]) {

                    const video = results[0];
                    server.queue.push({
                        'url': video.url,
                        'title': video.title,
                        'timestamp': video.durationRaw,
                        'requestedBy': interaction.user.username,
                    });

                    await interaction.reply({
                        content: `You've added: ***${video.title}*** [${video.durationRaw}]`,
                        ephemeral: true,
                    });

                    // show queue if something is already playing
                    if (server.queue.length > 1) {
                        await getQueue(server, interaction);
                    }

                } else {
                    await interaction.reply('Nothing was found, try again.');
                    return;
                }
            }

            // if nothing is currently playing (i.e first play)
            if (server.queue.length === 1) {

                const connection = joinVoiceChannel({
                    channelId: interaction.member.voice.channel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });

                server.audioPlayer = createAudioPlayer({
                    behaviors: {
                        noSubscriber: NoSubscriberBehavior.Pause,
                    },
                });

                connection.subscribe(server.audioPlayer);

                let song = server.queue[0];
                let source = await playdl.stream(song.url || song);

                let resource = createAudioResource(source.stream, {
                    inputType: source.type,
                });

                server.audioPlayer.play(resource);

                const announcement = `Now playing: ***${song.title}*** [${song.timestamp}] requested by **${song.requestedBy}**`;
                interaction.channel.send(announcement);

                // after track finishes
                server.audioPlayer.on('idle', async () => {
                    server.queue.shift();
                    if (server.queue.length > 0) {

                        song = server.queue[0];
                        source = await playdl.stream(song.url || song);
                        resource = createAudioResource(source.stream, {
                            inputType: source.type,
                        });
                        server.audioPlayer.play(resource);
                        interaction.channel.send(`Now playing: ***${song.title}*** [${song.timestamp}] requested by **${song.requestedBy}**`);
                    } else {

                        interaction.channel.send('Queue empty - leaving voice channel.');
                        if (server.queue.length === 0) connection.destroy();
                    }
                });

                server.audioPlayer.on('error', (error) => {
                    console.log(error.name);
                    interaction.channel.send(`Error (${error.message}) - terminating connection.`);
                    servers[interaction.guild.id] = { queue: [] };
                });
            }
        } else {
            interaction.reply('Please join a voice channel in order to request music!');
        }

    },
};

async function getQueue(server, interaction) {
    let counter = 1;
    const tracks = server.queue.slice(1);
    const queueEmbed = new EmbedBuilder()
        .setTitle('Upcoming:')
        .setColor('#e60965');
    tracks.forEach((track) => {
        queueEmbed.addFields({ name: `${counter}.`, value: `${track.title} **[${track.timestamp}]** (requested by *${track.requestedBy}*)` });
        counter++;
    });
    await interaction.channel.send({ embeds: [queueEmbed] });
}
