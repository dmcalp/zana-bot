const fetch = require('node-fetch');

module.exports = {
  name: 'urban',
  description: 'Returns the most popular definition for the given term',
  async execute(message, args, servers, Discord) {
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
  }
}
