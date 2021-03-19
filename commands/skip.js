module.exports = {
  name: 'skip',
  description: 'Skips the song',
  execute(message, args, servers) {
    const server = servers[message.guild.id];
    if (message.guild.voice.connection) {
      server.dispatcher.end();
      message.channel.send('Skipping song..');
    } else {
      message.reply('I must be in a voice channel in order to skip!');
    }
  }
}
