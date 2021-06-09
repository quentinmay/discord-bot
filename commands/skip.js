module.exports = {
  name: "skip",
  aliases: ["skipsong"],
  description: "Skip Request",
  guildOnly: true,
  usage: "just type !skip",
  execute(message) {
    const Queue = message.client.queue;
    const guild = message.guild.id;
    const musicQueue = Queue.get(guild);
    const channel = message.channel;

    if (!message.member.voice.channel)
      return channel.send(
        "You have to be in a voice channel to skip the music!"
      );
    if (!musicQueue) return channel.send("There is no song that I could skip!");
    try {
      if (musicQueue === null || musicQueue === undefined) {
        musicQueue.voiceChannel.leave();
        Queue.delete(guild);
      } else {
        channel.send(`Skipping: **${musicQueue.songs[0].title}**`);
        musicQueue.connection.dispatcher.end();
      }
    } catch (error) {
      console.error(error);
      return channel.send("Something went wrong, check console for error.");
    }
  },
};
