const fetch = require('node-fetch');
const Discord = require('discord.js');

module.exports = {
  name: 'p2d',
  description: 'Converts an amount of pounds to dollars',
  async execute(message, args) {
    if (!args[0]) { // no value
			return message.reply('Please enter an amount, e.g 300.50');
		}
		const url = 'https://api.exchangeratesapi.io/latest?base=GBP';
		const currencies = await fetch(url).then(response => response.json());
		const pounds = args[0].replace(/[^\d.?]/g, '') * 100 / 100;
		if (pounds) {
			const dollars = Math.round(pounds * currencies.rates.USD * 100) / 100;
			const embed = new Discord.MessageEmbed()
				.setTitle('GBP to USD')
				.setColor('#eee')
				.setDescription(`**£${pounds.toLocaleString()}** is approximately **$${dollars.toLocaleString()}**`)
				.setThumbnail('https://cdn.britannica.com/25/4825-050-12B3A28B/Flag-United-Kingdom.jpg')
				.setFooter(`Rate taken from ${currencies.date}`);
			message.reply(embed);
		} else {
			message.reply('No valid amount found.');
		}
  }
}
