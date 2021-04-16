module.exports = {
    name: "stop",
    aliases: ["stopsong"],
    description: "Stop Request",
    guildOnly: true,
    usage: "just type !stop",
    execute(message) {
        try {
            // const Queue = message.client.queue.get(message.guild.id);
            const Queue = message.client.queue;
            const guild = message.guild.id;
            const serverQueue = Queue.get(guild);
            if (!message.member.voice.channel) {
                return message.channel.send(
                    "You have to be in a voice channel to stop the music!"
                );
            } else if (
                message.member.voice.channel !== serverQueue.voiceChannel
            ) {
                return message.channel.send(
                    "You have to be in the right voice channel to stop the music bot."
                );
            }
            serverQueue.voiceChannel.leave();
            Queue.delete(guild);
            return;
            // Queue.songs = [];
            // return Queue.connection.dispatcher.end();
        } catch (error) {
            console.error(error);
            return message.channel.send("Something went wrong, check console");
        }
    },
};
