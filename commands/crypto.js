const CoinGecko = require('coingecko-api');
module.exports = {
  name: 'crypto',
  description: 'Returns current BTC, ETH & XLM prices.',
  async execute(message, args, servers, Discord) {
    const CG = new CoinGecko();
    
    let data = await CG.coins.markets({
      localization: false,
      ids: ['bitcoin', 'ethereum', 'stellar'],
      vs_currency: 'gbp',
    });
    
    let emojiBIT = (data.data[0].price_change_percentage_24h > 0) ? '✅' : "❌";
    let emojiETH = (data.data[1].price_change_percentage_24h > 0) ? '✅' : "❌";
    let emojiXLM = (data.data[2].price_change_percentage_24h > 0) ? '✅' : "❌";
    let opBIT = (data.data[0].price_change_percentage_24h > 0) ? '+' : "";
    let opETH = (data.data[1].price_change_percentage_24h > 0) ? '+' : "";
    let opXLM = (data.data[2].price_change_percentage_24h > 0) ? '+' : "";

    const bitcoinembed = new Discord.MessageEmbed()
      .setTitle(`${data.data[0].name} (${data.data[0].symbol.toUpperCase()})`)
      .setColor('#f5a00f')
      .addField('Current Price:', `£${data.data[0].current_price.toLocaleString()}`, true)
      .addField('24hr Change (%)', `${opBIT}${Math.round(data.data[0].price_change_percentage_24h * 100) / 100}% ${emojiBIT}`)
      .addField('24hr Low', `£${data.data[0].low_24h.toLocaleString()}`, true)
      .addField('24hr High', `£${data.data[0].high_24h.toLocaleString()}`, true)
      .setThumbnail(data.data[0].image);

    const ethereumembed = new Discord.MessageEmbed()
      .setTitle(`${data.data[1].name} (${data.data[1].symbol.toUpperCase()})`)
      .setColor('#596687')
      .addField('Current Price:', `£${Math.round(data.data[1].current_price).toLocaleString()}`)
      .addField('24hr Change (%)', `${opETH}${Math.round(data.data[1].price_change_percentage_24h * 100) / 100}%  ${emojiETH}`)
      .addField('24hr Low', `£${Math.round(data.data[1].low_24h).toLocaleString()}`, true)
      .addField('24hr High', `£${Math.round(data.data[1].high_24h).toLocaleString()}`, true)
      .setThumbnail(data.data[1].image);

    const stellarembed = new Discord.MessageEmbed()
      .setTitle(`${data.data[2].name} (${data.data[2].symbol.toUpperCase()})`)
      .setColor('#000000')
      .addField('Current Price:', `£${data.data[2].current_price.toLocaleString()}`)
      .addField('24hr Change (%)', `${opXLM}${Math.round(data.data[2].price_change_percentage_24h * 100) / 100}%  ${emojiXLM}`)
      .addField('24hr Low', `£${data.data[2].low_24h.toLocaleString()}`, true)
      .addField('24hr High', `£${data.data[2].high_24h.toLocaleString()}`, true)    
      .setThumbnail(data.data[2].image);
    
    message.reply(bitcoinembed);
    message.reply(ethereumembed);
    message.reply(stellarembed);
  }
}