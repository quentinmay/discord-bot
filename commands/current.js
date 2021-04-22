const Discord = require("discord.js");

module.exports = {
    name: "current",
    aliases: ["checksong", "currentsong", "playing"],
    description: "Check the currently playing song",
    usage: "Just try it",
    guildonly: true,
    execute(message) {
        const Queue = message.client.queue;
        const guild = message.guild.id;
        const messageChannel = message.channel;
        const musicQueue = Queue.get(guild);
        const currentSong = musicQueue.songs[0];

        try {
            const author = currentSong.author;
            const nowPlaying = new Discord.MessageEmbed()
                .setTitle(`NOW PLAYING: ${currentSong.title}`)
                .setImage(currentSong.image.url)
                .setColor("#e67e22")
                .setTimestamp();

            if (currentSong.url) nowPlaying.setURL(currentSong.url);
            if (currentSong.duration)
                nowPlaying.addField("Song Length:", currentSong.duration);
            if (author)
                nowPlaying.setAuthor(
                    author.name,
                    currentSong.author_thumbnail.url,
                    author.channel_url
                );
            if (currentSong.image.url) {
                nowPlaying.setImage(currentSong.image.url);
            }

            return messageChannel.send(nowPlaying);
        } catch (error) {
            if (!musicQueue) {
                return messageChannel.send(
                    "There is no song that is currently playing"
                );
            } else {
                messageChannel.send(
                    `Currently playing: **${musicQueue.songs[0].title}**`
                );
            }
        } finally {
            return;
        }
    },
};
