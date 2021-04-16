module.exports = {
    name: "kick",
    description: "Kick Request",
    guildOnly: true,
    permissions: "KICK_MEMBERS",
    execute(message) {
        const taggedUsers = message.mentions.users;
        const channel = message.channel;
        const mentions = message.mentions;
        if (!taggedUsers.size) {
            return message.reply("You didn't provide any username");
        }
        taggedUsers.forEach((user) => {
            try {
                channel.send(`You wanted to kick: ${user.username}`);
                const member = mentions.members.first();
                console.log(member);
                member
                    .kick()
                    .catch(
                        (err) => console.error(err),
                        channel.send(`Failed to kick user: ${user.username}`)
                    );
            } catch (error) {
                console.error(error);
                channel.send(`Failed to kick user: ${user.username}`);
            }
        });
    },
};
