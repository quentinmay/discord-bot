module.exports = {
	name: 'stop',
	aliases: ['stopsong'],
	description: 'Stop Request',
	guildOnly: true,
	usage: 'just type !stop',
	execute(message) {
		const Queue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel)
			return message.channel.send(
				'You have to be in a voice channel to stop the music!'
			);
		Queue.songs = [];
		Queue.connection.dispatcher.end();
	},
};
