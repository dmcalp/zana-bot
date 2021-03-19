module.exports = {
  name: 'mute',
  description: 'Mutes the current track',
  execute(message, args, servers) {
    const server = servers[message.guild.id];
    if (!message.guild.voice.connection) {
      return message.reply('I must be in a voice channel for this command!');
    }
    if (server.dispatcher.volume > 0) {
      server.dispatcher.setVolume(0);
    } else {
      server.dispatcher.setVolume(0.2);
    }
  }
}
