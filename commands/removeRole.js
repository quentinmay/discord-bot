module.exports = {
  name: "removerole",
  aliases: ["roleremove"],
  description: "Remove the mentioned user from the role in the command",
  guildOnly: true,
  usage: "<role> <user/s>",
  permissions: "MANAGE_ROLES",
  execute(message, args) {
    const selectedRole = message.guild.roles.cache.find(
      (role) => role.name === args[0]
    );
    const selectedUsers = message.mentions.members;
    const channel = message.channel;
    if (!selectedRole && !selectedUsers.size) {
      return message.reply("You need to include a role and a user");
    }
    if (!selectedRole) return message.reply("couldn't find the selected role");
    if (!selectedUsers.size) return message.reply("You need to include a user");
    selectedUsers.forEach((user) => {
      const userRoles = user.roles;
      if (!userRoles.cache.find((r) => r.name === selectedRole.name)) {
        return channel.send(`${user} doesn't have ${selectedRole}`);
      }
      channel.send(`Removing ${user} from ${selectedRole}`);
      userRoles.remove(selectedRole).catch((err) => {
        channel.send(`Failed at Removing ${user} from ${selectedRole}`) &&
          console.error(err);
      });
    });
  },
};
