const yts = require('yt-search');
const ytdl = require('ytdl-core');
const pause = require('./pause.js');
const skip = require('./skip.js');
const mute = require('./mute.js');
const leave = require('./leave.js');

module.exports = {
	name: 'play',
	description: 'Plays audio from a youtube search or link',
	async execute(message, args, servers, Discord) {
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
						if (server.queue[1]) {
							const response = await message.channel.send(getQueue(message));
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
								skip.execute(message, args, servers);
							}
							if (reaction.emoji.name === '⏹️') {
								leave.execute(message, args, servers);
							}
							if (reaction.emoji.name === '🔇') {
								mute.execute(message, args, servers);
							}
						});
					}
				}
				else {
					message.reply('Nothing was found, try again.');
					return;
				}
			}
			if (server.queue.length == 1) {
				message.member.voice.channel.join().then((connection) => {
					play(connection, message);
				});
			}
		}
		
		function play(connection, message) {
			const server = servers[message.guild.id];
			// const song = server.queue.shift();
			const song = server.queue[0];
			server.dispatcher = connection.play(
				ytdl(song.url || song, {
					filter: 'audioonly',
					bitrate: 64000,
					highWaterMark: 1 << 25,
				}));
			server.dispatcher.setVolume(0.2);
			server.dispatcher.on('finish', () => {
				if (server.queue[1]) {
					server.queue.shift();
					if (server.queue[0].title != undefined) message.channel.send(`Now playing: **${ server.queue[0].title } [${ server.queue[0].timestamp }]**`);
					play(connection, message);
				} else {
					connection.disconnect();
					server.queue = [];
				}
			});
		}
		
		function getQueue(message) {
			const server = servers[message.guild.id];
			let counter = 1;
			const tracks = server.queue.slice(1);
			const embed = new Discord.MessageEmbed()
				.setTitle('Upcoming:')
				.setColor('#e60965');
			tracks.forEach(track => {
				embed.addField(`${counter}. ${track.title}`, track.timestamp);
				counter++;
			});
			return embed;
		}

	},
};
