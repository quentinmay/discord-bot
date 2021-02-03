module.exports = {
	name: 'avatar',
	aliases: ['icon', 'pfp'],
	description: 'Link to the user/users avatar',
	execute(message) {
		const mentioned = message.mentions;
		const channel = message.channel;
		if (!mentioned.users.size) {
			return channel.send(
				`Your avatar: <${message.author.displayAvatarURL({
					format: 'png',
					dynamic: true,
				})}>`
			);
		}
		const avatarList = mentioned.users.map((user) => {
			return `${user.username}'s avatar: <${user.displayAvatarURL({
				format: 'png',
				dynamic: true,
			})}>`;
		});
		channel.send(avatarList);
	},
};
