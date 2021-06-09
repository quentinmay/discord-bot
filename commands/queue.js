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
    const currentSong = musicQueue.songs[0];
    if (!musicQueue || !songs) {
      return messageChannel.send("No songs in queue");
    } else {
      const Author = currentSong.author;
      console.log(Author);
      const author = currentSong.author;
      const reply = new Discord.MessageEmbed()
        .setTitle(`NOW PLAYING: ${currentSong.title}`)
        .setImage(currentSong.image.url)
        .setColor("#e67e22")
        .setTimestamp();
      if (currentSong.url) reply.setURL(currentSong.url);
      if (currentSong.duration)
        reply.addField("Song Length:", currentSong.duration);
      if (author)
        reply.setAuthor(
          author.name,
          currentSong.author_thumbnail.url,
          author.channel_url
        );
      if (currentSong.image.url) {
        reply.setImage(currentSong.image.url);
      }
      for (let i = 1; i < songs.length; i++) {
        const song = songs[i];
        reply.addField(`**${song.title}** \nPosition:`, i, true);
      }
      return messageChannel.send(reply);
    }
  },
};
