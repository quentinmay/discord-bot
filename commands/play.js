const ytdl = require("ytdl-core");
const ytsr = require("ytsr");
const ytpl = require("ytpl");
const Discord = require("discord.js");

module.exports = {
    name: "play",
    aliases: ["playsong", "startsong"],
    guildOnly: true,
    cooldown: 2,
    limit: 10,
    async execute(message, args) {
        if (!args[0])
            return message.reply(
                "You need to include something to search for or a link"
            );
        const queue = message.client.queue;
        const guildID = message.guild.id;
        const serverQueue = message.client.queue.get(guildID);
        const voiceChannel = message.member.voice.channel;
        const messageChannel = message.channel;
        try {
            if (!voiceChannel) {
                return message.reply(
                    "You need to be in a voice channel to play music!"
                );
            }

            const permissions = voiceChannel.permissionsFor(
                message.client.user
            );
            if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
                return message.reply(
                    "I need permissions to join and speak in your voice channel!"
                );
            }

            const query = message.content.split(" ").slice(1).join(" ");
            const RegExp = /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[^&\s\?]+(?!\S))\/)|(?:\S*v=|v\/)))([^&\s\?]+)/gm;
            let songLink = args[0];

            if (!songLink.match(RegExp)) {
                messageChannel.send(`Looking up:  **${query}**`);
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
            let playlistSongs;
            let song;
            if (ytpl.validateID(songLink)) {
                const songInfo = await ytpl(songLink, { limit: this.limit });
                messageChannel.send(
                    `Adding the first **${this.limit}** songs of  **${songInfo.title}** the queue`
                );
                playlistSongs = songInfo.items;
            } else {
                const songInfo = await ytdl.getInfo(songLink);
                const songDetails = songInfo.videoDetails;
                const songThumbNails = songDetails.thumbnails;
                song = {
                    title: songDetails.title,
                    url: songDetails.video_url,
                    duration: (songDetails.lengthSeconds / 60).toFixed(2),
                    author: songDetails.author,
                    author_thumbnail: songDetails.author.thumbnails.pop(),
                    description: songDetails.description,
                    thumbnail: songThumbNails.shift(),
                    image: songThumbNails.pop(),
                };
            }
            if (!serverQueue) {
                const queueConstruct = {
                    textChannel: messageChannel,
                    voiceChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    volume: 5,
                    playing: true,
                };

                queue.set(guildID, queueConstruct);
                // Put the songs in the queue
                if (playlistSongs) {
                    playlistSongs.forEach((playlistSong) => {
                        song = {
                            title: playlistSong.title,
                            url: playlistSong.url,
                            duration: (playlistSong.durationSec / 60).toFixed(
                                2
                            ),
                            author: playlistSong.author,
                            author_thumbnail: playlistSong.thumbnails.shift(),
                            description: " ",
                            thumbnail: playlistSong.bestThumbnail,
                            image: playlistSong.bestThumbnail,
                        };
                        messageChannel.send(`Added **${song.title}**`);
                        queueConstruct.songs.push(song);
                    });
                } else {
                    queueConstruct.songs.push(song);
                }

                try {
                    const connection = await voiceChannel.join();
                    queueConstruct.connection = connection;
                    this.play(message, queueConstruct.songs[0]);
                } catch (error) {
                    console.error(error);
                    queue.delete(guildID);
                    return messageChannel.send(
                        "Something went wrong, check console"
                    );
                }
            } else {
                const queueSongs = serverQueue.songs;

                if (playlistSongs) {
                    playlistSongs.forEach((playlistSong) => {
                        song = {
                            title: playlistSong.title,
                            url: playlistSong.url,
                            duration: (playlistSong.durationSec / 60).toFixed(
                                2
                            ),
                            author: playlistSong.author,
                            author_thumbnail: playlistSong.thumbnails.shift(),
                            description: " ",
                            thumbnail: playlistSong.bestThumbnail,
                            image: playlistSong.bestThumbnail,
                        };
                        messageChannel
                            .send(`**${song.title}** added to the queue`)
                            .catch(console.error);
                        if (queueSongs.length > 20) {
                            return messageChannel.send("Music queue is full!");
                        }
                        queueSongs.push(song);
                    });
                } else {
                    queueSongs.push(song);
                    return serverQueue.textChannel
                        .send(`**${song.title}** added to the queue`)
                        .catch(console.error);
                }
            }
        } catch (error) {
            console.error(error);
            messageChannel.send("Something went wrong, check console");
        }
    },

    async play(message, song) {
        const queue = message.client.queue;
        const guild = message.guild.id;
        const serverQueue = queue.get(guild);

        try {
            if (!song) {
                serverQueue.voiceChannel.leave();
                queue.delete(guild);
                return;
            }

            const dispatcher = serverQueue.connection
                .play(ytdl(song.url))
                .on("finish", () => {
                    serverQueue.songs.shift();
                    this.play(message, serverQueue.songs[0]);
                })
                .on("error", (error) => console.error(error));

            dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
            // Create the message embed
            const Author = song.author;
            const AuthorThumbnail = song.author_thumbnail;
            const nowPlaying = new Discord.MessageEmbed()
                .setTitle(song.title)
                .setURL(song.url)
                .setAuthor(Author.name, AuthorThumbnail.url, Author.channel_url)
                .addField("Song Length: ", song.duration)
                .setImage(song.image.url)
                .setColor("#e67e22")
                .setTimestamp();
            // If song is a Livestream then change the text a little
            if (song.duration <= 0) {
                const receivedEmbed = message.embeds[0];
                const liveEmbed = new Discord.MessageEmbed(receivedEmbed)
                    .setTitle(song.title)
                    .setURL(song.url)
                    .setAuthor(
                        Author.name,
                        AuthorThumbnail.url,
                        Author.channel_url
                    )
                    .setDescription("**LIVE**")
                    .setImage(song.image.url)
                    .setColor("#e67e22")
                    .setTimestamp();
                return message.channel.send(liveEmbed);
            }
            return serverQueue.textChannel.send(nowPlaying);
        } catch (error) {
            console.error(error);
            message.client.queue.delete(message.guild.id);
            await serverQueue.voiceChannel.leave();
            return message.channel
                .send("Something went wrong, terminating music player")
                .catch(console.error);
        }
    },
};
