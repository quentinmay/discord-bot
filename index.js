const { prefix, token } = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
	console.log('Bot Client is ready!');
});

client.on('message', (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	switch (command) {
		case 'stop':
			message.channel.send(
				`You typed the command: ${command}\nWith these arguments: ${args}`
			);
			break;
		case 'args-info':
			if (!args.length) {
				return message.channel.send(
					`You didn't provide any arguments, ${message.author}`
				);
			} else if (args[0] === 'foo') {
				return message.channel.send('bar');
			}
			message.channel.send(
				`Command name: ${command}\nArguments: ${args}\nArguments Length: ${args.length}`
			);
			break;
		case 'kick': {
			if (!message.mentions.users.size) {
				return message.reply("You didn't provide any username");
			}
			const taggedUsers = message.mentions.users;
			taggedUsers.forEach((user) => {
				message.channel.send(`You wanted to kick: ${user.username}`);
			});
			break;
		}
		default:
			message.channel.send(`Invalid Command: ${command}`);
			break;
	}
});

client.login(token);
