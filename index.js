/* eslint-disable brace-style */
const Discord = require('discord.js');
const { prefix, token, commands, mwemail, mwpass } = require('./config.json');
const ytdl = require('ytdl-core');
const fetch = require('node-fetch');
const yts = require('yt-search');
const api = require('call-of-duty-api')();

const zana = new Discord.Client();

zana.once('ready', () => {
	console.log('Zana is ready!');
});

api.login(mwemail, mwpass).catch(error => console.log.apply(error));

const servers = {};

zana.on('message', async (message) => {
	if (!message.guild) return;
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	if (command === 'play') {
		if (!servers[message.guild.id]) {
			servers[message.guild.id] = { queue: [] };
		}
		const server = servers[message.guild.id];
		if (!args.length) return message.reply('\n' + commands[0]);
		if (message.member.voiceChannel) {
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
					if (message.guild.voiceConnection) {
						const response = await message.channel.send(getQueue(message));
						response.react('🔥');
					} else {
						const response = await message.channel.send(`${video.title} **[${video.timestamp}]** is now playing.`);

						response.react('⏸️')
							.then(() => response.react('⏭️'))
							.then(() => response.react('⏹️'))
							.then(() => response.react('🔇'));

						const filter = (reaction, user) => {
							return ['⏸️', '⏭️', '⏹️', '🔇'].includes(reaction.emoji.name) && user.id === message.author.id;
						};
						const collector = response.createReactionCollector(filter);

						collector.on('collect', reaction => {
							console.log(`Collected ${reaction.emoji.name} from ${reaction.users.last().tag}`);
							if (reaction.emoji.name === '⏸️') {
								pause(message);
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
			if (!message.guild.voiceConnection) {
				message.member.voiceChannel.join().then((connection) => {
					play(connection, message);
				});
			}
		}
		else {
			return message.reply('You must be in a voice channel to use this!');
		}

	} else if (command === 'skip') {
		const server = servers[message.guild.id];
		if (message.guild.voiceConnection) {
			server.dispatcher.end();
			message.channel.send('Skipping to next song..');
		} else {
			message.reply('I must be in a voice channel in order to skip!');
		}

	} else if (command === 'leave') {
		const server = servers[message.guild.id];
		if (message.guild.voiceConnection) {
			message.guild.voiceConnection.disconnect();
			server.queue = [];
		} else {
			message.reply('I must be in a voice channel in order to leave!');
		}

	} else if (command === 'volume') {
		const server = servers[message.guild.id];
		if (!message.guild.voiceConnection) {
			return message.reply('I must be in a voice channel for this command!');
		}
		const vol = args[0];
		if (vol >= 0.1 && vol <= 1) {
			server.dispatcher.setVolume(vol);
			message.channel.send(`Volume set to ${vol * 100}%`);
		} else {
			message.reply('Volume must be 0.1 - 1');
		}

	} else if (command === 'pause') {
		const server = servers[message.guild.id];
		if (!message.guild.voiceConnection) {
			return message.reply('I must be in a voice channel for this command!');
		}
		if (!server.dispatcher.paused) {
			server.dispatcher.pause();
			message.reply('Track paused, use `!pause` again to resume.');
		} else {
			server.dispatcher.resume();
		}

	} else if (command === 'queue') {
		getQueue(message);

	}	else if (command === 'mw') {
		const tag = args[0];
		const platform = args[1];
		api.MWstats(tag, platform).then(output => {
			const data = output.lifetime.all.properties;
			const mpgamesPlayed = data.gamesPlayed;
			const mpkd = Math.round(data.kdRatio * 100) / 100;
			const mpkills = data.kills;
			const mpdeaths = data.deaths;
			const mpwinloss = Math.round(data.winLossRatio * 100) / 100;
			const mpscorePerGame = Math.round(data.scorePerGame * 100) / 100;
			const mpscorePerMinute = Math.round(data.scorePerMinute * 100) / 100;
			const mpkillstreak = data.recordKillStreak;
			const mptime = Math.round((data.timePlayedTotal / 60 / 60) * 100) / 100;
			const mpassists = data.assists;
			const mpheadshots = data.headshots;
			const mpsuicides = data.suicides;

			const mpembed = new Discord.RichEmbed()
				.setTitle(`${tag.toUpperCase()}'s MP Stats`)
				.setThumbnail('https://hb.imgix.net/d9ffbcf4aa5df29167b21484b9aac12507a9deb9.jpg?auto=compress,format&fit=crop&h=353&w=616&s=523a92154bf15e96dc83c5c113f93bcf')
				.setColor('#0191FF')
				.setDescription('Stats that\'ll immediately ruin your fun.')
				.addField('K/D', mpkd, true)
				.addField('Kills', mpkills, true)
				.addField('Deaths', mpdeaths, true)
				.addField('W/L', mpwinloss, true)
				.addField('Score /min', mpscorePerMinute, true)
				.addField('Score /game', mpscorePerGame, true)
				.addField('Headshots', mpheadshots, true)
				.addField('Assists', mpassists, true)
				.addField('Streak', mpkillstreak, true)
				.addField('Suicides', mpsuicides, true)
				.addField('Games', mpgamesPlayed, true)
				.addField('Time', `${mptime} hrs`, true);

			const wz = output.lifetime.mode.br.properties;
			const wzplayed = wz.gamesPlayed;
			const wzkills = wz.kills;
			const wzdeaths = wz.deaths;
			const wzkd = Math.round(wz.kdRatio * 100) / 100;
			const wztopfive = wz.topFive;
			const wztopten = wz.topTen;
			const wztime = Math.round((wz.timePlayed / 60 / 60) * 100) / 100;
			const wzwins = wz.wins;
			const wzrevives = wz.revives;
			const wzdowns = wz.downs;
			const wztoptwentyfives = wz.topTwentyFive;
			const wzcontracts = wz.contracts;

			const wzembed = new Discord.RichEmbed()
				.setTitle(`${tag.toUpperCase()}'s WZ Stats`)
				.setThumbnail('https://www.gannett-cdn.com/presto/2020/03/09/USAT/cf6dc438-b658-41ac-a2ba-1063e0404d61-Warzone_Keyart_Horiz_Helicopter.jpg')
				.setColor('#a300ff')
				.setDescription('More stats you wish you\'d never seen.')
				.addField('K/D', wzkd, true)
				.addField('Kills', wzkills, true)
				.addField('Deaths', wzdeaths, true)
				.addField('Wins', wzwins, true)
				.addField('Downs', wzdowns, true)
				.addField('Contracts', wzcontracts, true)
				.addField('Top 5\'s', wztopfive, true)
				.addField('Top 10\'s', wztopten, true)
				.addField('Top 25\'s', wztoptwentyfives, true)
				.addField('Revives', wzrevives, true)
				.addField('Games', wzplayed, true)
				.addField('Time', `${wztime} hrs`, true);

			message.channel.send(mpembed);
			message.channel.send(wzembed);
		}).catch(err => {
			message.reply(err);
		});

	}	else if (command === 'choose') {
		const options = message.content
			.slice(prefix.length + command.length)
			.split(',');
		const trimmedOptions = options.map((s) => s.trim());
		const choice =
			trimmedOptions[Math.floor(Math.random() * trimmedOptions.length)];
		message.channel.send(`I choose: ${choice}.`);

	} else if (command === 'urban') {
		if (!args.length) {
			return message.channel.send('Usage: !urban word');
		}
		const query = args.join('%20');
		const { list } = await fetch(
			`https://api.urbandictionary.com/v0/define?term=${query}`
		).then((response) => response.json());
		const definition = list[0].definition;
		const example = list[0].example;
		const thumbsup = list[0].thumbs_up;
		const thumbsdown = list[0].thumbs_down;
		message.channel.send(
			`**Definition:**\n${definition}\n\n**Example:**\n${example}\n\n**Thumbs Up:** ${thumbsup}  **Thumbs Down:** ${thumbsdown}`
		);

	} else if (command === 'server') {
		message.channel.send(
			`The server '${message.guild.name}' was created on ${message.guild.createdAt}`
		);

	} else if (command === 'avatar') {
		message.channel.send(message.author.displayAvatarURL);

	} else if (command === 'ping') {
		message.channel.send(`Zana's ping is currently: ${message.client.ping}`);

	} else if (command === 'delete') {
		if (args.length > 0) {
			if (args[0] > 1 && args[0] <= 10) {
				const amount = parseInt(args[0]) + 1;
				message.channel.bulkDelete(amount).catch((err) => {
					console.error(err);
					message.reply('Error deleting messages!');
				});
			} else {
				message.reply('The second argument must be 2-10 inclusive');
			}
		} else {
			message.reply(
				'This method requires an additional argument (2-10 inclusive)'
			);
		}
	}	else if (command === 'd2p') {
		if (!args[0]) { // no value
			return message.reply('Please enter an amount after the command, e.g !d2p 300.50');
		}
		const url = 'https://api.exchangeratesapi.io/latest?base=USD';
		const currencies = await fetch(url).then(response => response.json());
		const dollars = args[0].replace(/[^\d.]/g, '');
		if (dollars) { // if regex found an integer
			const pounds = Math.round(dollars * currencies.rates.GBP * 100) / 100;
			const embed = new Discord.RichEmbed()
				.setTitle('USD to GBP')
				.setColor('#d61313')
				.setDescription(`**$${dollars.toLocaleString()}** is approximately **£${pounds.toLocaleString()}**`)
				.setThumbnail('https://cdn.britannica.com/33/4833-004-297297B9/Flag-United-States-of-America.jpg')
				.setFooter(`Rate taken from ${currencies.date}`);
			message.reply(embed);
		} else {
			message.reply('No valid amount found.');
		}

	}	else if (command === 'p2d') {
		if (!args[0]) { // no value
			return message.reply('Please enter an amount, e.g 300.50');
		}
		const url = 'https://api.exchangeratesapi.io/latest?base=GBP';
		const currencies = await fetch(url).then(response => response.json());
		const pounds = args[0].replace(/[^\d.?]/g, '') * 100 / 100;
		if (pounds) {
			const dollars = Math.round(pounds * currencies.rates.USD * 100) / 100;
			const embed = new Discord.RichEmbed()
				.setTitle('GBP to USD')
				.setColor('#eee')
				.setDescription(`**£${pounds.toLocaleString()}** is approximately **$${dollars.toLocaleString()}**`)
				.setThumbnail('https://cdn.britannica.com/25/4825-050-12B3A28B/Flag-United-Kingdom.jpg')
				.setFooter(`Rate taken from ${currencies.date}`);
			message.reply(embed);
		} else {
			message.reply('No valid amount found.');
		}

	}	else if (command === 'commands') {
		const embed = new Discord.RichEmbed()
			.setTitle('Zana Commands')
			.setColor('#e60965')
			.setThumbnail(
				'https://pngimage.net/wp-content/uploads/2018/06/lenny-png-7.png'
			)
			.setDescription(commands)
			.setTimestamp();
		message.channel.send(embed);
	}
});

function play(connection, message) {
	const server = servers[message.guild.id];
	const song = server.queue.shift();
	server.dispatcher = connection.playStream(
		ytdl(song.url, {
			filter: 'audioonly',
			bitrate: 64000,
			highWaterMark: 1 << 25,
		})
	);
	server.dispatcher.setVolume(0.2);
	server.dispatcher.on('end', () => {
		if (server.queue[0]) {
			play(connection, message);
		} else {
			connection.disconnect();
		}
	});
}

function getQueue(message) {
	const server = servers[message.guild.id];
	let counter = 1;
	const embed = new Discord.RichEmbed()
		.setTitle('Upcoming:')
		.setColor('#e60965');
	server.queue.forEach(elmnt => {
		embed.addField(`${counter}. ${elmnt.title}`, elmnt.timestamp);
		counter++;
	});
	return embed;
}

function pause(message) {
	const server = servers[message.guild.id];
	if (!message.guild.voiceConnection) {
		return message.reply('I must be in a voice channel for this command!');
	}
	if (!server.dispatcher.paused) {
		server.dispatcher.pause();
		return message.channel.send('Track paused, press `⏸️` or use `!pause` again to resume.');
	} else {
		server.dispatcher.resume();
	}
}

function skip(message) {
	const server = servers[message.guild.id];
	if (message.guild.voiceConnection) {
		server.dispatcher.end();
		message.channel.send('Skipping to next song..');
	} else {
		message.reply('I must be in a voice channel in order to skip!');
	}
}

function leave(message) {
	const server = servers[message.guild.id];
	if (message.guild.voiceConnection) {
		message.guild.voiceConnection.disconnect();
		server.queue = [];
	} else {
		message.reply('I must be in a voice channel in order to leave!');
	}
}

function mute(message) {
	const server = servers[message.guild.id];
	if (!message.guild.voiceConnection) {
		return message.reply('I must be in a voice channel for this command!');
	}
	server.dispatcher.setVolume(0);
}

zana.login(token);
