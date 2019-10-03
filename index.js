const Discord = require("discord.js");
const { prefix, token, commands } = require("./config.json");
const ytdl = require("ytdl-core");
const fetch = require("node-fetch");

const zana = new Discord.Client();
let dispatcher;

zana.once("ready", () => {
	console.log("Zana is ready!");
});

const queue = [];

zana.on("message", async message => {

	if (!message.guild) return;
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	if (command === "play") {
		if (!args.length) {
			return message.reply("\n" + commands[0]);
		}
		if (message.member.voiceChannel) {
			queue.push(args[0]);
			if (!message.guild.voiceConnection) {
				if (ytdl.validateURL(args[0])) {
					const connection = await message.member.voiceChannel.join();
					play(connection, message);
				}
				else {
					return message.reply("Not a valid URL! Please try again!");
				}
			}
			if (message.guild.voiceConnection.speaking) message.reply("Song added to the queue!");
		}
		else {
			return message.reply("You must be in a voice channel for me to join!");
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
		dispatcher.paused ? dispatcher.resume() : dispatcher.pause();
	}

	else if (command === "leave") {
		if (message.guild.voiceConnection) {
			message.guild.voiceConnection.disconnect();
		}
		else {
			message.reply("I must be in a voice channel in order to leave!");
		}
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

	else if (command === "ping") {
		message.channel.send(`Your ping is currently: ${message.client.ping}`);
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
	const url = queue.shift();
	dispatcher = connection.playStream(ytdl(
		url, {
			filter: "audioonly",
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

zana.login(token);