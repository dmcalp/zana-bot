module.exports = {
  name: 'pause',
  description: 'just pauses the music, what did you expect?',
  execute(message, args, servers) {
    const server = servers[message.guild.id];
    if (!message.guild.voice.connection) {
      return message.reply('I must be in a voice channel for this command!');
    }
    if (!server.dispatcher.paused) {
      server.dispatcher.pause(true);
      message.reply('Track paused, use `!pause` again to resume.');
    } else {
      server.dispatcher.resume();
    }
  }
}