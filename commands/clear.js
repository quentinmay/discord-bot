module.exports = {
  name: "clear",
  aliases: ["clearsongs"],
  description: "Clears queue",
  guildOnly: true,
  usage: "just type !clear",
  execute(message) {
    const Queue = message.client.queue;
    const guild = message.guild.id;
    const musicQueue = Queue.get(guild);
    const channel = message.channel;
    if (!message.member.voice.channel)
      return channel.send(
        "You have to be in a voice channel to clear the queue!"
      );
    if (!musicQueue) return channel.send("Music queue is already empty!");
    try {
      if (musicQueue === null || musicQueue === undefined) {
        musicQueue.voiceChannel.leave();
        Queue.delete(guild);
      } else {
        console.log(musicQueue);
        channel.send(`Clearing queue`);
        musicQueue.songs = [];
        musicQueue.connection.dispatcher.end();
      }
    } catch (error) {
      console.error(error);
      return channel.send("Something went wrong, check console for error.");
    }
  },
};
