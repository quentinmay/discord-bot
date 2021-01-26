module.exports = {
	name: 'kick',
	description: 'Kick Request',
	guildOnly: true,
	permissions: 'KICK_MEMBERS',
	execute(message) {
		if (!message.mentions.users.size) {
			return message.reply("You didn't provide any username");
		}
		const taggedUsers = message.mentions.users;
		taggedUsers.forEach((user) => {
			try {
				message.channel.send(`You wanted to kick: ${user.username}`);
				const member = message.mentions.members.first();
				console.log(member);
				member
					.kick()
					.catch(
						(err) => console.error(err),
						message.channel.send(`Failed to kick user: ${user.username}`)
					);
			} catch (error) {
				console.error(error);
				message.channel.send(`Failed to kick user: ${user.username}`);
			}
		});
	},
};
