const Discord = require("discord.js");
const { prefix, token, commands, d2APIkey } = require("./config.json");
const ytdl = require("ytdl-core");
const fetch = require("node-fetch");
const yts = require("yt-search");

const zana = new Discord.Client();
let dispatcher;

zana.once("ready", () => {
	console.log("Zana is ready!");
});

let queue = [];
const titles = [];


zana.on("message", async message => {

	if (!message.guild) return;
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	if (command === "play") {
		if (!args.length) return message.reply("\n" + commands[0]);
		if (message.member.voiceChannel) {
			if (ytdl.validateURL(args[0])) {
				queue.push(args[0]);
				message.reply("Song added!");
			}
			else {
				const results = await yts(args.join(" "));
				if (results.videos[0]) {
					const video = results.videos[0];
					titles.push(`${video.title} **[${video.timestamp}]**`);
					queue.push(video.url);
					const resp = (message.guild.voiceConnection)
						? `${video.title} **${video.timestamp}** added to the queue.`
						: `${video.title} **${video.timestamp}** is now playing`;
					message.reply(resp);
					if (queue.length > 1) message.channel.send("\n **Current queue:** \n" + titles.join("\n"));
				}
				else {
					console.log("Returning");
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
			return message.reply("You must be in a voice channel to use this!");
		}
	}

	else if (command === "skip") {
		if (message.guild.voiceConnection) {
			dispatcher.end();
		}
		else {
			message.reply("I must be in a voice channel in order to skip!");
		}

	}

	else if (command === "volume") {
		if (!message.guild.voiceConnection) return message.reply("I must be in a voice channel for this command!");
		const vol = args[0];
		vol >= 0.1 && vol <= 1 ? dispatcher.setVolume(vol) : message.reply("Volume must be 0.1 - 1");
	}

	else if (command === "pause") {
		if (!message.guild.voiceConnection) return message.reply("I must be in a voice channel for this command!");
		if (!dispatcher.paused) {
			dispatcher.pause();
			message.reply("Track paused, use !pause again to resume.");
		}
		else {
			dispatcher.resume();
		}
	}

	else if (command === "leave") {
		if (message.guild.voiceConnection) {
			message.guild.voiceConnection.disconnect();
			queue = [];
		}
		else {
			message.reply("I must be in a voice channel in order to leave!");
		}
	}

	else if (command === "d2time") {
		const data = await fetch("https://www.bungie.net/Platform/Destiny2/3/Profile/4611686018467716166/Character/2305843009404638901/?components=200", {
			headers: {
				"X-API-Key": d2APIkey,
			},
		}).then(response => response.json());

		const msg = "Account 'D4NDK' has " + Math.floor(data.Response.character.data.minutesPlayedTotal / 60) + " hours played across all platforms.";
		message.channel.send(msg);
	}

	else if (command === "urban") {
		if (!args.length) {
			return message.channel.send("Usage: !urban word");
		}
		const query = args.join("%20");
		const { list } = await fetch(`https://api.urbandictionary.com/v0/define?term=${query}`).then(response => response.json());
		const definition = list[0].definition;
		const example = list[0].example;
		const thumbsup = list[0].thumbs_up;
		const thumbsdown = list[0].thumbs_down;
		message.channel.send(`**Definition:**\n${definition}\n\n**Example:**\n${example}\n\n**Thumbs Up:** ${thumbsup}  **Thumbs Down:** ${thumbsdown}`);
	}

	else if (command === "server") {
		message.channel.send(`The server '${message.guild.name}' was created on ${message.guild.createdAt}`);
	}

	else if (command === "avatar") {
		message.channel.send(message.author.displayAvatarURL);
	}

	else if (command === "queue") {
		const response = (queue.length) ? queue : "The queue is currently empty.";
		message.reply(response);
	}

	else if (command === "ping") {
		message.channel.send(`Zana's ping is currently: ${message.client.ping}`);
	}

	else if (command === "delete") {
		if (args.length > 0) {
			if (args[0] > 1 && args[0] <= 10) {
				const amount = parseInt(args[0]) + 1;
				message.channel.bulkDelete(amount).catch(err => {
					console.error(err);
					message.reply("Error deleting messages!");
				});
			}
			else {
				message.reply("The second argument must be 2-10 inclusive");
			}
		}
		else {
			message.reply("This method requires an additional argument (2-10 inclusive)");
		}
	}

	else if (command === "commands") {
		const embed = new Discord.RichEmbed()
			.addBlankField()
			.setColor("#e60965")
			.setThumbnail("https://pngimage.net/wp-content/uploads/2018/06/lenny-png-7.png")
			.setDescription(commands)
			.setTimestamp();
		message.channel.send(embed);
	}
});

function play(connection, message) {
	if (queue[0]) {
		titles.shift();
		dispatcher = connection.playStream(ytdl(
			queue.shift(), {
				filter: "audioonly",
				bitrate: 64000,
			}));
		dispatcher.setVolume(0.2);
		dispatcher.on("end", () => {
			if (queue[0]) {
				play(connection, message);
			}
			else {
				connection.disconnect();
			}
		});
	}
}

zana.login(token);