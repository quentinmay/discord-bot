const ytdl = require("ytdl-core");
const ytsr = require("ytsr");
const ytpl = require("ytpl");
const MusicPlayer = require("../utility/musicPlayer");

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
        const serverQueue = queue.get(guildID);
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
            let song;
            let playlistSongs;

            if (!songLink.match(RegExp)) {
                messageChannel.send(`Looking up:  **${query}**`);
                try {
                    await ytsr(query, { limit: 1 }).then((result) => {
                        songLink = result.items[0].url;
                    });
                } catch (error) {
                    console.error(error);
                    queue.delete(guild);
                    await serverQueue.voiceChannel.leave();
                    return messageChannel
                        .send("Something went wrong, terminating music player")
                        .catch(console.error);
                }
            }
            // Check if search returns a playlist or a video
            if (ytpl.validateID(songLink)) {
                await ytpl(songLink, { limit: this.limit }).then((result) => {
                    messageChannel.send(
                        `Adding the first **${this.limit}** songs of  **${result.title}** to the queue`
                    );
                    playlistSongs = result.items;
                });
            } else {
                await ytdl.getInfo(songLink).then((result) => {
                    const songDetails = result.videoDetails;
                    // const songThumbNails = songDetails.thumbnails;
                    song = {
                        title: songDetails.title,
                        url: songDetails.video_url,
                        duration: (songDetails.lengthSeconds / 60).toFixed(2),
                        author: songDetails.author,
                        author_thumbnail: songDetails.author.thumbnails.pop(),
                        description: songDetails.description,
                        // thumbnail: songThumbNails.shift(),
                        image: songDetails.thumbnails.pop(),
                    };
                });
            }

            // Setup the Queue
            if (!serverQueue) {
                const queueConstruct = {
                    textChannel: messageChannel,
                    voiceChannel: voiceChannel,
                    connection: undefined,
                    songs: [],
                    volume: 1,
                    playing: true,
                };

                queue.set(guildID, queueConstruct);
                // Put the songs in the queue
                if (playlistSongs) {
                    playlistSongs.forEach((playlistSong) => {
                        const songTemplate = {
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
                        messageChannel.send(`Added **${songTemplate.title}**`);
                        queueConstruct.songs.push(songTemplate);
                    });
                } else {
                    queueConstruct.songs.push(song);
                }

                try {
                    await voiceChannel.join().then((con) => {
                        queueConstruct.connection = con;
                        MusicPlayer.play(message, queueConstruct.songs[0]);
                    });
                } catch (error) {
                    console.error(error);
                    queue.delete(guild);
                    await serverQueue.voiceChannel.leave();
                    return messageChannel
                        .send("Something went wrong, terminating music player")
                        .catch(console.error);
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
                        if (queueSongs.length > this.limit) {
                            return messageChannel.send("Music queue is full!");
                        } else {
                            messageChannel.send(
                                `**${song.title}** added to the queue`
                            );
                            queueSongs.push(song);
                        }
                    });
                } else {
                    queueSongs.push(song);
                    return messageChannel.send(
                        `**${song.title}** added to the queue`
                    );
                }
            }
        } catch (error) {
            console.error(error);
            try {
                queue.delete(guild);
                await serverQueue.voiceChannel.leave();
            } catch (error) {}
            return messageChannel
                .send("Something went wrong, terminating music player")
                .catch(console.error);
        }
    },
};
