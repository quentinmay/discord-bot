module.exports = {
	name: 'args-info',
	description: 'Information about the arguments provided.',
	execute(message, args, command) {
		if (args[0] === 'foo') {
			return message.channel.send('bar');
		}
		message.channel.send(
			`Command name: ${command}\nArguments: ${args}\nArguments Length: ${args.length}`
		);
	},
};
