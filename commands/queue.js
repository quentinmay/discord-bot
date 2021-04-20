const Discord = require("discord.js");

module.exports = {
    name: "queue",
    aliases: ["checkqueue", "listqueue"],
    description: "Check the current song queue",
    cooldown: 5,
    guildOnly: true,
    usage: "just use the command",
    execute(message) {
        const Queue = message.client.queue;
        const guild = message.guild.id;
        const musicQueue = Queue.get(guild);
        const messageChannel = message.channel;
        const songs = musicQueue.songs;

        if (!musicQueue || !songs) {
            return messageChannel.send("No songs in queue");
        } else {
            const reply = new Discord.MessageEmbed()
                .setTimestamp()
                .setColor("#e67e22")
                .setTitle(`Currently Playing: **${songs[0].title}**`);

            for (let i = 1; i < songs.length; i++) {
                const song = songs[i];
                reply.addField(`**${song.title}** \nPosition:`, i, true);
            }

            return messageChannel.send(reply);
        }
    },
};
