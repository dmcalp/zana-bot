module.exports = {
	name: 'ping',
	description: 'Ping!',
	execute(message) {
		message.channel.send(`Zana's ping is currently: ${message.client.ws.ping}`);
	},
};