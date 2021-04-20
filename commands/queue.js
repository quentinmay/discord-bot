const Discord = require("discord.js");

module.exports = {
    name: "queue",
    aliases: ["checkqueue", "listqueue"],
    description: "Check the current song queue",
    cooldown: 5,
    guildOnly: true,
    usage: "just use the command",
    execute(message) {
        const queue = message.client.queue.get(message.guild.id);
        const messageChannel = message.channel;
        const songs = queue.songs;

        if (!queue || !songs) {
            return messageChannel.send("No songs in queue");
        } else {
            songs.forEach((song) => {
                if (songs.indexOf(song) == 0) {
                    const author = song.author;
                    const reply = new Discord.MessageEmbed()
                        .setTimestamp()
                        .setColor("#e67e22")
                        .setTitle(song.title);

                    if (song.url) reply.setURL(song.url);
                    if (song.duration)
                        reply.addField("Song Length:", song.duration);
                    if (author)
                        reply.setAuthor(
                            author.name,
                            song.author_thumbnail.url,
                            author.channel_url
                        );
                    if (song.thumbnail) {
                        reply.setImage(song.image.url);
                    }

                    messageChannel.send(reply);
                } else {
                    const position = songs.indexOf(song);
                    messageChannel.send(
                        `**${song.title}** current place in queue: **${position}**`
                    );
                }
            });
        }
    },
};
