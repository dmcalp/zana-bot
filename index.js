/* eslint-disable brace-style */
const Discord = require('discord.js');
const { prefix, token, mwemail, mwpass } = require('./config.json');
const api = require('call-of-duty-api')();
const fs = require('fs');

const zana = new Discord.Client();
zana.commands = new Discord.Collection();

zana.once('ready', () => {
	console.log('Zana is ready!');
});

api.login(mwemail, mwpass).catch(error => console.log.apply(error));

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	zana.commands.set(command.name, command);
}

const servers = {};

zana.on('message', async (message) => {
	if (!message.guild) return; // prevents use in direct messages
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	if (!zana.commands.has(command)) return;

	try {
		zana.commands.get(command).execute(message, args, servers, Discord);
	}	catch (error) {
		console.error(error);
		message.channel.send('Something went wrong!');
	}

	/*
		if (command === 'mw') {
		const tag = args[0];
		const platform = args[1];
		api.MWwz(tag, platform).then(output => {
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

			const mpembed = new Discord.MessageEmbed()
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

			const wzembed = new Discord.MessageEmbed()
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
	}
	*/
});

zana.login(token);
