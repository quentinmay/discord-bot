const ytdl = require('ytdl-core');

module.exports = {
	name: 'play',
	aliases: ['playsong', 'startsong'],
	guildOnly: true,
	async execute(message, args) {
		if (!args[0]) return message.reply('You need to provide a link');
		try {
			const RegExp = /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[^&\s\?]+(?!\S))\/)|(?:\S*v=|v\/)))([^&\s\?]+)/gm;
			const queue = message.client.queue;
			const serverQueue = message.client.queue.get(message.guild.id);

			const voiceChannel = message.member.voice.channel;
			if (!voiceChannel) {
				return message.reply('You need to be in a voice channel to play music!');
			}
			const permissions = voiceChannel.permissionsFor(message.client.user);
			if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
				return message.reply(
					'I need permissions to join and speak in your voice channel!'
				);
			}
			const songLink = args[0];
			if (!songLink.match(RegExp)) return message.reply('Invalid Link');
			const songInfo = await ytdl.getInfo(args[0]);
			const song = {
				title: songInfo.videoDetails.title,
				url: songInfo.videoDetails.video_url,
			};
			if (!serverQueue) {
				const queueConstruct = {
					textChannel: message.channel,
					voiceChannel: voiceChannel,
					connection: null,
					songs: [],
					volume: 5,
					playing: true,
				};

				queue.set(message.guild.id, queueConstruct);
				queueConstruct.songs.push(song);
				try {
					let connection = await voiceChannel.join();
					queueConstruct.connection = connection;
					this.play(message, queueConstruct.songs[0]);
				} catch (error) {
					console.error(error);
					queue.delete(message.guild.id);
					return message.channel.send('Something went wrong, check console');
				}
			}
		} catch (error) {
			console.error(error);
			message.channel.send('Something went wrong, check console');
		}
	},

	play(message, song) {
		const queue = message.client.queue;
		const guild = message.guild;
		const serverQueue = queue.get(guild.id);

		if (!song) {
			serverQueue.voiceChannel.leave();
			queue.delete(guild.id);
			return;
		}

		const dispatcher = serverQueue.connection
			.play(ytdl(song.url))
			.on('finish', () => {
				serverQueue.songs.shift();
				this.play(message, serverQueue.songs[0]);
			})
			.on('error', (error) => console.error(error));

		dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
		serverQueue.textChannel.send(`Start playing: **${song.title}**`);
	},
};
