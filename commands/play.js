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
						content: `You've added *${video.title}* **[${video.timestamp}]**`, 
						ephemeral: true 
					});
					
					console.log(server.queue);

					// show queue if something is already playing
					if (server.queue.length > 1) {
						let counter = 1;
						const tracks = server.queue.slice(1); // skip currently playing track
						const queueEmbed = new EmbedBuilder()
							.setTitle('Upcoming:')
							.setColor('#e60965');
						tracks.forEach(track => {
							queueEmbed.addFields({ name: 'Upcoming', value: `${track.title} ${track.timestamp}` });
							counter++;
						});
						await interaction.channel.send({ embeds: [queueEmbed] });
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
				
				const audioPlayer = createAudioPlayer({
					behaviors: {
						noSubscriber: NoSubscriberBehavior.Pause,
					},
				});
				
				const subscription = connection.subscribe(audioPlayer);
				
				const server = servers[interaction.guild.id];
				
				let song = server.queue[0];
				
				let resource = createAudioResource(ytdl(song.url || song, {
					filter: 'audioonly',
				}));

				if (server.queue.length <= 1) {
					audioPlayer.play(resource);
				}
				
				interaction.channel.send(`Now playing *${song.title}* **[${song.timestamp}]** requested by ${song.requestedBy}`);

				console.log(server.queue);

				audioPlayer.on('idle', () => {
					server.queue.shift();
					if (server.queue[0].title != undefined) {
						song = server.queue[0];
						resource = createAudioResource(ytdl(song.url || song, {
							filter: 'audioonly',
						}));
						audioPlayer.play(resource);
					} else {
						interaction.channel.send("Terminating connection - Queue empty");
						connection.destroy();
					}
				});

				audioPlayer.on('error', error => {
					console.log(error);
					interaction.channel.send('Terminating connection.');
					connection.destroy();
				});
			}
		}
		else {
			interaction.reply("Please join a voice channel in order to request music!");
		}
		
		// const response = (server.queue.length > 1) 
		// 	? await interaction.channel.send(getQueue(interaction))
		// 	: await interaction.channel.send(`${video.title} **[${video.timestamp}]** is now playing.`);
		
		
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


		// function play(connection, interaction) {
		// 	const server = servers[interaction.guild.id];
		// 	const song = server.queue[0];
		// 	server.dispatcher = connection.play(
		// 		ytdl(song.url || song, {
		// 			filter: 'audioonly',
		// 			bitrate: 64000,
		// 			highWaterMark: 50,
		// 		}));
		// 	server.dispatcher.setVolume(0.2);
		// 	server.dispatcher.on('idle', () => {
		// 		if (server.queue[1]) {
		// 			server.queue.shift();
		// 			if (server.queue[0].title != undefined) interaction.reply(`Now playing: **${ server.queue[0].title } [${ server.queue[0].timestamp }]**`);
		// 			play(connection, interaction);
		// 		} else {
		// 			connection.destroy();
		// 			server.queue = [];
		// 		}
		// 	});
		// }
		
		
		
		
		
		
		
		
		// function getQueue(interaction) {
		// 	const server = servers[interaction.guild.id];
		// 	let counter = 1;
		// 	const tracks = server.queue.slice(1); // skip currently playing track
		// 	const embed = new EmbedBuilder()
		// 		.setTitle('Upcoming:')
		// 		.setColor('#e60965');
		// 	tracks.forEach(track => {
		// 		embed.addFields({ name: 'counter', value: `${track.title} ${track.timestamp}` });
		// 		counter++;
		// 	});
		// 	return embed;
		// }

	},
};
