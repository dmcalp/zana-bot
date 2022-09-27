const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const CoinGecko = require('coingecko-api');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('crypto')
        .setDescription('Returns current Bitcoin, Ethereum and Polygon prices.'),

    async execute(interaction) {
        const CG = new CoinGecko();

        const coins = await CG.coins.markets({
            localization: false,
            ids: ['bitcoin', 'ethereum', 'matic-network'],
            vs_currency: 'gbp',
        });

        const coinEmbeds = [];

        for (let i = 0; i < coins.data.length; i++) {
            const emoji = (coins.data[i].price_change_percentage_24h > 0) ? '✅' : '❌';
            const sign = (coins.data[i].price_change_percentage_24h > 0) ? '+' : '';

            const embed = new EmbedBuilder()
                .setTitle(`${coins.data[i].name} (${coins.data[i].symbol.toUpperCase()})`)
                .setColor('#e60965')
                .addFields(
                    { name: 'Current Price', value: `£${coins.data[i].current_price.toLocaleString()}` },
                    { name: '24hr Change (%)', value: `${sign}${Math.round(coins.data[i].price_change_percentage_24h * 100) / 100}% ${emoji}` },
                    { name: '24hr Low', value: `£${coins.data[i].low_24h.toLocaleString()}`, inline: true },
                    { name: '24hr High', value: `£${coins.data[i].high_24h.toLocaleString()}`, inline: true },
                )
                .setThumbnail(coins.data[i].image);

            coinEmbeds.push(embed);
        }

        interaction.reply({ embeds: [...coinEmbeds] });
    },
};
