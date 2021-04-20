const Discord = require("discord.js");

module.exports = {
    name: "current",
    aliases: ["checksong", "currentsong", "playing"],
    description: "Check the currently playing song",
    usage: "Just try it",
    guildonly: true,
    execute(message, args) {
        const Queue = message.client.queue;
        const guild = message.guild.id;
        const messageChannel = message.channel;
        const musicQueue = Queue.get(guild);
        const currentSong = musicQueue.songs[0];

        try {
            const author = currentSong.author;
            const reply = new Discord.MessageEmbed()
                .setTimestamp()
                .setColor("#e67e22")
                .setTitle(currentSong.title);

            if (currentSong.url) reply.setURL(currentSong.url);
            if (currentSong.duration)
                reply.addField("Song Length:", currentSong.duration);
            if (author)
                reply.setAuthor(
                    author.name,
                    currentSong.author_thumbnail.url,
                    author.channel_url
                );
            if (currentSong.thumbnail) {
                reply.setImage(currentSong.image.url);
            }

            messageChannel.send(reply);
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
        }
    },
};
