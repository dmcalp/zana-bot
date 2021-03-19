const skip = require('./skip.js') ;

module.exports = {
  name: 'mute',
  description: 'Leaves the channel',
  execute(message, args, servers) {
    const server = servers[message.guild.id];
    if (message.guild.voice.connection) {
      // message.guild.voice.connection.disconnect();
      server.queue = [];
      skip.execute(message, args, servers);
    } else {
      message.reply('I must be in a voice channel in order to leave!');
    }
  }
}
