module.exports = {
  name: "addrole",
  aliases: ["giverole", "role"],
  description:
    "Give/Add the mentioned user to the role specified in the command",
  guildOnly: true,
  usage: "<role> <user/s>",
  permissions: "MANAGE_ROLES",
  execute(message, args) {
    const selectedRole = message.guild.roles.cache.find(
      (role) => role.name === args[0]
    );
    const selectedUsers = message.mentions.members;

    if (!selectedRole) return message.reply("couldn't find the selected role");
    if (!selectedUsers.size) return message.reply("You need to include a user");

    selectedUsers.forEach((user) => {
      const messageChannel = message.channel;
      const userRole = user.roles;

      if (userRole.cache.find((r) => r.name === selectedRole.name)) {
        return messageChannel.send(`${user} already has ${selectedRole}`);
      }

      messageChannel.send(`Giving ${user} ${selectedRole}`);
      userRole.add(selectedRole).catch((err) => {
        messageChannel.send(`Failed at adding ${user} to ${selectedRole}`) &&
          console.error(err);
      });
    });
  },
};
