module.exports = {
  name: 'avatar',
  description: 'Returns the users avatar',
  execute(message) {
    message.channel.send(message.author.avatarURL());
  }
}
