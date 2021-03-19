module.exports = {
  name: 'server',
  description: 'Returns some info about the current server',
  execute(message) {
    message.channel.send(
			`The server '${message.guild.name}' was created on ${message.guild.createdAt}`
		);
  }
}
