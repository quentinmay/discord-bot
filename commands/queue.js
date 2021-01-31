module.exports = {
	name: 'queue',
	aliases: ['checkqueue', 'listqueue'],
	description: 'Check the current song queue',
	cooldown: 5,
	guildOnly: true,
	usage: '<url> or <search query>',
	execute(message) {
		const queue = message.client.queue.get(message.guild.id);
		if (!queue) return message.channel.send('No songs in queue');
		const song = queue.songs[0];
		console.log(song);
		console.log(queue.songs);

		return queue.songs.forEach((song) => {
			message.channel.send(song.title);
		});
	},
};
