const fetch = require('node-fetch');
const Discord = require('discord.js');

module.exports = {
  name: 'd2p',
  description: 'Converts an amount of dollars to pounds',
  async execute(message, args) {
    if (!args[0]) { // no value
      return message.reply('Please enter an amount after the command, e.g !d2p 300.50');
    }
    const url = 'https://api.exchangeratesapi.io/latest?base=USD';
    const currencies = await fetch(url).then(response => response.json());
    const dollars = args[0].replace(/[^\d.]/g, '');
    if (dollars) { // if regex found an integer
      const pounds = Math.round(dollars * currencies.rates.GBP * 100) / 100;
      const embed = new Discord.MessageEmbed()
        .setTitle('USD to GBP')
        .setColor('#d61313')
        .setDescription(`**$${dollars.toLocaleString()}** is approximately **£${pounds.toLocaleString()}**`)
        .setThumbnail('https://cdn.britannica.com/33/4833-004-297297B9/Flag-United-States-of-America.jpg')
        .setFooter(`Rate taken from ${currencies.date}`);
      message.reply(embed);
    } else {
      message.reply('No valid amount found.');
    }
  }
}
