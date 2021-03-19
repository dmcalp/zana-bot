const {commands} = require('../config.json');

module.exports = {
  name: 'commands',
  description: 'Returns a list of all available commands',
  execute(message, args, servers, Discord) {
    const embed = new Discord.MessageEmbed()
      .setTitle('Zana Commands')
      .setColor('#e60965')
      .setThumbnail('https://pngimage.net/wp-content/uploads/2018/06/lenny-png-7.png')
      .setDescription(commands)
      .setTimestamp();
    message.channel.send(embed);
  }
}
