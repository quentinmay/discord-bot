const fs = require("fs");
const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const Client = require("./client/Client");
// Initialize a new bot client with the necessary collections/maps/queues
const client = new Client();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once("ready", () => {
  console.log("Bot Client is ready!");
});

client.on("message", async (message) => {
  // Destructure the message that was ran in the chat
  const messageContent = message.content;
  const args = messageContent.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  const author = message.author;
  const channel = message.channel;

  //Initial Check to see if command can be ran or not.
  if (!messageContent.startsWith(prefix) || author.bot) return;
  if (!command) return message.reply(`Invalid Command: ${commandName}`);
  if (command.guildOnly && channel.type === "dm") {
    return message.reply("I can't execute that command inside DMs!");
  }
  if (command.permissions) {
    const authorPerms = channel.permissionsFor(author);
    if (!authorPerms || !authorPerms.has(command.permissions)) {
      return message.reply("You can not do this!");
    }
  }
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${author}`;
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }
    return channel.send(reply);
  }
  if (!client.cooldowns.has(command.name)) {
    client.cooldowns.set(command.name, new Discord.Collection());
  }
  // Check if command is on cooldown for that user
  const now = Date.now();
  const timestamps = client.cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 10) * 1000;
  if (timestamps.has(author.id)) {
    const expirationTime = timestamps.get(author.id) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \`${command.name}\` command.`
      );
    }
  }

  // Put a cooldown on the user that used the command
  timestamps.set(author.id, now);
  setTimeout(() => timestamps.delete(author.id), cooldownAmount);

  // Try to run the command
  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("there was an error trying to execute that command!");
  }
});

client.login(token);
