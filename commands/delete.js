module.exports = {
  name: 'delete',
  description: 'Removes in bulk an amount of messages excluding the users !delete message',
  execute(message, args) {
    if (args.length > 0) {
			if (args[0] > 1 && args[0] <= 10) {
				const amount = parseInt(args[0]) + 1;
				message.channel.bulkDelete(amount).catch((err) => {
					console.error(err);
					message.reply('Error deleting messages!');
				});
			} else {
				message.reply('The second argument must be 2-10 inclusive');
			}
		} else {
			message.reply(
				'This method requires an additional argument (2-10 inclusive)'
			);
		}
  }
}
