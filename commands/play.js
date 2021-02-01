const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const ytpl = require('ytpl');
const Discord = require('discord.js');

module.exports = {
	name: 'play',
	aliases: ['playsong', 'startsong'],
	guildOnly: true,
	cooldown: 2,
	async execute(message, args) {
		if (!args[0])
			return message.reply(
				'You need to include something to search for or a link'
			);
		const RegExp = /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[^&\s\?]+(?!\S))\/)|(?:\S*v=|v\/)))([^&\s\?]+)/gm;
		try {
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

			let songLink = args[0];
			if (!songLink.match(RegExp)) {
				const query = message.content.split(' ').slice(1).join(' ');
				message.channel.send(`Looking up:  **${query}**`);
				try {
					await ytsr(query, { limit: 1 }).then(
						(result) => {
							songLink = result.items[0].url;
						},
						(res) => console.log(res)
					);
				} catch (error) {
					console.error(error);
				}
			}
			// Check if search returns a playlist or a video
			let songInfo = '';
			let song = '';
			let playlistSongs = '';
			if (ytpl.validateID(songLink)) {
				const limit = 10;
				songInfo = await ytpl(songLink, { limit });
				message.channel.send(
					`Adding the first **${limit}** songs of  **${songInfo.title}** the queue`
				);
				playlistSongs = songInfo.items;
			} else {
				songInfo = await ytdl.getInfo(songLink);
				song = {
					title: songInfo.videoDetails.title,
					url: songInfo.videoDetails.video_url,
					duration: (songInfo.videoDetails.lengthSeconds / 60).toFixed(2),
					author: songInfo.videoDetails.author,
					author_thumbnail: songInfo.videoDetails.author.thumbnails.pop(),
					description: songInfo.videoDetails.description,
					thumbnail: songInfo.videoDetails.thumbnails.shift(),
					image: songInfo.videoDetails.thumbnails.pop(),
				};
			}
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
				if (playlistSongs) {
					playlistSongs.forEach((playlistSong) => {
						song = {
							title: playlistSong.title,
							url: playlistSong.url,
							duration: (playlistSong.durationSec / 60).toFixed(2),
							author: playlistSong.author,
							author_thumbnail: playlistSong.thumbnails.shift(),
							description: ' ',
							thumbnail: playlistSong.bestThumbnail,
							image: playlistSong.bestThumbnail,
						};
						message.channel.send(`Added **${song.title}**`);
						queueConstruct.songs.push(song);
					});
				} else {
					queueConstruct.songs.push(song);
				}

				try {
					let connection = await voiceChannel.join();
					queueConstruct.connection = connection;
					this.play(message, queueConstruct.songs[0]);
				} catch (error) {
					console.error(error);
					queue.delete(message.guild.id);
					return message.channel.send('Something went wrong, check console');
				}
			} else {
				if (playlistSongs) {
					playlistSongs.forEach((playlistSong) => {
						song = {
							title: playlistSong.title,
							url: playlistSong.url,
							duration: (playlistSong.durationSec / 60).toFixed(2),
							author: playlistSong.author,
							author_thumbnail: playlistSong.thumbnails.shift(),
							description: ' ',
							thumbnail: playlistSong.bestThumbnail,
							image: playlistSong.bestThumbnail,
						};
						message.channel
							.send(`**${song.title}** added to the queue`)
							.catch(console.error);
						if (serverQueue.songs.length > 20) {
							return message.channel.send('Music queue is full!');
						}
						serverQueue.songs.push(song);
					});
				} else {
					serverQueue.songs.push(song);
					return serverQueue.textChannel
						.send(`**${song.title}** added to the queue`)
						.catch(console.error);
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
		const nowPlaying = new Discord.MessageEmbed()
			.setTitle(song.title)
			.setURL(song.url)
			.setAuthor(
				song.author.name,
				song.author_thumbnail.url,
				song.author.channel_url
			)
			.addField('Song Length:', song.duration)
			.setThumbnail(song.thumbnail.url)
			.setImage(song.image.url)
			.setColor('#e67e22')
			.setTimestamp();

		serverQueue.textChannel.send(nowPlaying);
	},
};
