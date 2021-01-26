module.exports = {
	name: 'kick',
	description: 'Kick Request',
	guildOnly: true,
	execute(message) {
		if (!message.mentions.users.size) {
			return message.reply("You didn't provide any username");
		}
		const taggedUsers = message.mentions.users;
		taggedUsers.forEach((user) => {
			message.channel.send(`You wanted to kick: ${user.username}`);
		});
	},
};
