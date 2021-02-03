const Discord = require('discord.js');

module.exports = {
	name: 'queue',
	aliases: ['checkqueue', 'listqueue'],
	description: 'Check the current song queue',
	cooldown: 5,
	guildOnly: true,
	usage: '<url> or <search query>',
	execute(message) {
		const queue = message.client.queue.get(message.guild.id);
		const channel = message.channel;

		if (!queue) return channel.send('No songs in queue');

		return songs.forEach((song) => {
			const songs = queue.songs;
			if (songs.indexOf(song) == 0) {
				const author = song.author;
				const reply = new Discord.MessageEmbed()
					.setTimestamp()
					.setColor('#e67e22')
					.setTitle(song.title);

				if (song.url) reply.setURL(song.url);
				if (song.duration) reply.addField('Song Length:', song.duration);
				if (author)
					reply.setAuthor(
						author.name,
						song.author_thumbnail.url,
						author.channel_url
					);
				if (song.thumbnail) {
					reply.setThumbnail(song.thumbnail.url);
					reply.setImage(song.image.url);
				}

				return channel.send(reply);
			} else {
				const position = songs.indexOf(song);
				const reply = new Discord.Message()
					.url(song.url)
					.content(`Song: **${song.title}** Position: **${position}**`);
				return channel.send(reply);
			}
		});
	},
};
