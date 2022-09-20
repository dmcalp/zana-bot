const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const yts = require('yt-search');
const ytdl = require('ytdl-core');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { NoSubscriberBehavior } = require('@discordjs/voice');
// const pause = require('./pause.js');
// const skip = require('./skip.js');
// const mute = require('./mute.js');
// const leave = require('./leave.js');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('play')
	.setDescription('Plays audio from a youtube search or link')
	.addStringOption(option => option.setName('input').setDescription('Song name or URL').setRequired(true)),
	
	async execute(interaction, servers) {
		if (!servers[interaction.guild.id]) {
			servers[interaction.guild.id] = { queue: [] };
		}
		const server = servers[interaction.guild.id];
		const userChoice = interaction.options.getString('input');
		
		if (interaction.member.voice.channel) {
			if (ytdl.validateURL(userChoice)) {
				server.queue.push(userChoice);
				interaction.reply('Song added!');
			}
			else {
				const results = await yts(userChoice);
				if (results.videos[0]) {					
					
					const video = results.videos[0];
					server.queue.push({
						'url' : video.url,
						'title' : video.title,
						'timestamp' : video.timestamp,
						'requestedBy': interaction.user.username
					});
					
					await interaction.reply({ 
						content: `You've added: ***${video.title}*** [${video.timestamp}]`, 
						ephemeral: true 
					});

					// show queue if something is already playing
					if (server.queue.length > 1) {
						await getQueue(server, interaction);
					}
				}
				else {
					await interaction.reply('Nothing was found, try again.');
					return;
				}
			}

			// if nothing is currently playing (i.e first play)
			if (server.queue.length == 1) {	

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
				
				const subscription = connection.subscribe(server.audioPlayer);
				
				let song = server.queue[0];
				
				let resource = createAudioResource(ytdl(song.url || song, {
					filter: 'audioonly',
					quality: 'lowestaudio',
				}));

				server.audioPlayer.play(resource);
				
				const announcement = `Now playing: ***${song.title}*** [${song.timestamp}] requested by **${song.requestedBy}**`;

				interaction.channel.send(announcement);
					
				server.audioPlayer.on('idle', () => {
					server.queue.shift();
					if (server.queue.length > 0) {
						song = server.queue[0];
						resource = createAudioResource(ytdl(song.url || song, {
							filter: 'audioonly',
						}));
						server.audioPlayer.play(resource);
						interaction.channel.send(announcement);
					} else {
						interaction.channel.send("Queue empty - leaving voice channel.");
						if (server.queue.length == 0) connection.destroy();
					}
				});
				
				server.audioPlayer.on('error', error => {
					console.log(error.name);
					interaction.channel.send(`Error (${error.message}) - terminating connection.`);
					connection.destroy();
					servers[interaction.guild.id] = { queue: [] };
				});
			}
		}
		else {
			interaction.reply("Please join a voice channel in order to request music!");
		}
		
		// response.react('⏸️')
		// 	.then(() => response.react('⏭️'))
		// 	.then(() => response.react('⏹️'))
		// 	.then(() => response.react('🔇'));

		// const filter = (reaction, user) => {
		// 	return ['⏸️', '⏭️', '⏹️', '🔇'].includes(reaction.emoji.name) 
		// 		&& user.id != '626948446095671307';	// bot's own id 
		// };

		// const collector = response.createReactionCollector(filter);
		// collector.on('collect', reaction => {
		// 	if (reaction.emoji.name === '⏸️') {
		// 		//pause.execute(interaction, args, servers);
		// 		console.log("paused");
		// 	}
		// 	if (reaction.emoji.name === '⏭️') {
		// 		console.log("skipped");
		// 		//skip.execute(interaction, args, servers);
		// 	}
		// 	if (reaction.emoji.name === '⏹️') {
		// 		console.log("leave");
		// 		//leave.execute(interaction, args, servers);
		// 	}
		// 	if (reaction.emoji.name === '🔇') {
		// 		console.log("mute");
		// 		//mute.execute(interaction, args, servers);
		// 	}
		// });

	},
};

async function getQueue(server, interaction) {
	let counter = 1;
	const tracks = server.queue.slice(1); // skip currently playing track
	const queueEmbed = new EmbedBuilder()
		.setTitle('Upcoming:')
		.setColor('#e60965');
	tracks.forEach(track => {
		queueEmbed.addFields({ name: `${counter}.`, value: `${track.title} **[${track.timestamp}]** (requested by *${track.requestedBy}*)` });
		counter++;
	});
	await interaction.channel.send({ embeds: [queueEmbed] });
}

