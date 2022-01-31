module.exports = {
    name: 'volume',
    description: 'Changes the volume of the current track',
    execute(message, args, servers) {
      const server = servers[message.guild.id];
      const desiredVol = args[0];
      
      if (!message.guild.voice.connection) {
        return message.reply('I must be in a voice channel for this command!');
      }
      
      if (desiredVol < 0 || desiredVol > 1) {
        return message.reply('Value must be in between 0 and 1.');
      } else {
        server.dispatcher.setVolume(desiredVol);
      }
    }
  }