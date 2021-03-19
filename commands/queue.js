module.exports = {
  name: 'queue',
  description: 'Returns the upcoming songs, if any.',
  execute(message, args, servers, Discord) {
    const server = servers[message.guild.id];
    let counter = 1;
    const tracks = server.queue.slice(1);
    const embed = new Discord.MessageEmbed()
      .setTitle('Upcoming:')
      .setColor('#e60965');
    tracks.forEach(track => {
      embed.addField(`${counter}. ${track.title}`, track.timestamp);
      counter++;
    });
    message.channel.send(embed);
  }
}
