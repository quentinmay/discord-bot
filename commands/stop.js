module.exports = {
  name: 'stop',
  aliases: ['stopsong'],
  description: 'Stop Request',
  guildOnly: true,
  usage: 'just type !stop',
  execute(message) {
    try {
      const Queue = message.client.queue.get(message.guild.id);
      if (!message.member.voice.channel)
        return message.channel.send(
          'You have to be in a voice channel to stop the music!'
        );
      Queue.songs = [];
      return Queue.connection.dispatcher.end();
    } catch (error) {
      console.error(error);
      return message.channel.send('Something went wrong, check console');
    }
  },
};
