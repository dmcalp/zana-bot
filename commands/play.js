const yts = require('yt-search');
const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const pause = require('./pause.js');
module.exports = {
	name: 'play',
	description: 'Plays audio from a youtube search or link',
	async execute(message, args, servers) {
		if (!servers[message.guild.id]) {
			servers[message.guild.id] = { queue: [] };
		}
		const server = servers[message.guild.id];
		if (!args.length) return message.reply('\n' + commands[0]);
		if (message.member.voice.channel) {
			if (ytdl.validateURL(args[0])) {
				server.queue.push(args[0]);
				message.reply('Song added!');
			}
			else {
				const results = await yts(args.join(' '));
				if (results.videos[0]) {
					const video = results.videos[0];
					server.queue.push({
						'url' : video.url,
						'title' : video.title,
						'timestamp' : video.timestamp,
					});
					if (message.guild.voice) {
						const response = await message.channel.send(getQueue(message));
						response.react('🔥');
					} else {
						const response = await message.channel.send(`${video.title} **[${video.timestamp}]** is now playing.`);

						response.react('⏸️')
							.then(() => response.react('⏭️'))
							.then(() => response.react('⏹️'))
							.then(() => response.react('🔇'));

						const filter = (reaction, user) => {
							return ['⏸️', '⏭️', '⏹️', '🔇'].includes(reaction.emoji.name) && user.id != '626948446095671307';
						};
						const collector = response.createReactionCollector(filter);

						collector.on('collect', reaction => {
							if (reaction.emoji.name === '⏸️') {
								pause.execute(message, args, servers);
							}
							if (reaction.emoji.name === '⏭️') {
								skip(message);
							}
							if (reaction.emoji.name === '⏹️') {
								leave(message);
							}
							if (reaction.emoji.name === '🔇') {
								mute(message);
							}
						});
					}
				}
				else {
					message.reply('Nothing was found, try again.');
					return;
				}
			}
			if (!message.guild.voice) {
				message.member.voice.channel.join().then((connection) => {
					play(connection, message);
				});
			}
		}
		
		function play(connection, message) {
			const server = servers[message.guild.id];
			const song = server.queue.shift();
			server.dispatcher = connection.play(
				ytdl(song.url || song, {
					filter: 'audioonly',
					bitrate: 64000,
					highWaterMark: 1 << 25,
				}));
			server.dispatcher.setVolume(0.2);
			server.dispatcher.on('finish', () => {
				if (server.queue[0]) {
					if (server.queue[0].title != undefined) message.channel.send(`Now playing: **${ server.queue[0].title } [${ server.queue[0].timestamp }]**`);
					play(connection, message);
				} else {
					connection.disconnect();
				}
			});
		}
		
		function getQueue(message) {
			const server = servers[message.guild.id];
			let counter = 1;
			const embed = new Discord.MessageEmbed()
				.setTitle('Upcoming:')
				.setColor('#e60965');
			server.queue.forEach(elmnt => {
				embed.addField(`${counter}. ${elmnt.title}`, elmnt.timestamp);
				counter++;
			});
			return embed;
		}

	},
};