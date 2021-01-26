module.exports = {
	name: 'stop',
	description: 'Stop Request',
	execute(message, args, command) {
		if (args == '') return message.reply('You need to provide arguments');
		message.channel.send(
			`You typed the command: ${command}\nWith these arguments: ${args}`
		);
	},
};
