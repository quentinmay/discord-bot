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
		if (!queue) return message.channel.send('No songs in queue');
		return queue.songs.forEach((song) => {
			if (queue.songs.indexOf(song) == 0) {
				const reply = new Discord.MessageEmbed().setTimestamp().setColor('#e67e22');

				reply.setTitle(song.title);
				if (song.url) reply.setURL(song.url);
				if (song.duration) reply.addField('Song Length:', song.duration);
				if (song.author)
					reply.setAuthor(
						song.author.name,
						song.author_thumbnail.url,
						song.author.channel_url
					);
				if (song.thumbnail) {
					reply.setThumbnail(song.thumbnail.url);
					reply.setImage(song.image.url);
				}

				return message.channel.send(reply);
			} else {
				const reply = new Discord.Message();
				const position = queue.songs.indexOf(song);
				reply.url = song.url;
				reply.content = `Song: **${song.title}** Position: **${position}**`;
				return message.channel.send(reply);
			}
		});
	},
};
