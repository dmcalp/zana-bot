const { prefix } = require('../config.json');
module.exports = {
  name: 'choose',
  description: 'Chooses an item from a list of choices',
  execute(message, args) {
		const options = message.content.slice(prefix.length + 6).split(',');
		const trimmedOptions = options.map((s) => s.trim());
		const choice = trimmedOptions[Math.floor(Math.random() * trimmedOptions.length)];
		message.channel.send(`I choose: ${choice}.`);
  }
}
