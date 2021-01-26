module.exports = {
	name: 'role',
	description: 'Assign role to users',
	args: true,
	usage: '<user> <role>',
	execute(message, args) {
		return message.channel.send(
			`You sent this message: ${message}\nwith these arguments: ${args}`
		);
	},
};
