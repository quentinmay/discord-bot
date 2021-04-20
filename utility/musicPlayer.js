const ytdl = require("ytdl-core");
const Discord = require("discord.js");

module.exports = {
    async play(message, song) {
        const queue = message.client.queue;
        const guild = message.guild.id;
        const serverQueue = queue.get(guild);
        const messageChannel = message.channel;

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
                return messageChannel.send(liveEmbed);
            }
            return serverQueue.textChannel.send(nowPlaying);
        } catch (error) {
            console.error(error);
            queue.delete(guild);
            await serverQueue.voiceChannel.leave();
            return messageChannel
                .send("Something went wrong, terminating music player")
                .catch(console.error);
        }
    },
};
