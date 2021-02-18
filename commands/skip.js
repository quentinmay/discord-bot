module.exports = {
  name: 'skip',
  aliases: ['skipsong'],
  description: 'Skip Request',
  guildOnly: true,
  usage: 'just type !skip',
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    const channel = message.channel;
    if (!message.member.voice.channel)
      return channel.send(
        'You have to be in a voice channel to stop the music!'
      );
    if (!queue) return channel.send('There is no song that I could skip!');
    channel.send(`Skipping: **${queue.songs[0].title}**`);
    queue.connection.dispatcher.end();

    return channel.send('There is no queue or song to skip');
  },
};
