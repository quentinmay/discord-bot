module.exports = {
	name: 'check',
	aliases: ['checkperm', 'perm', 'role', 'checkrole'],
	description: 'Check the permission/role of the user/s mentioned',
	usage: '<user/s>',
	execute(message, args) {
		const usersMentioned = message.mentions.members;
		if (!usersMentioned.size) return message.reply('You need to include user/s');
		usersMentioned.forEach((user) => {
			const perms = [];
			const roles = message.guild.roles.cache;
			roles.forEach((role) => {
				if (user.roles.cache.has(role.id)) perms.push(role.name);
			});
			message.channel.send(`${user} has these roles: ${perms} `);
		});
	},
};
