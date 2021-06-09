const { Client, Collection } = require("discord.js");

module.exports = class extends Client {
  constructor(config) {
    super({
      disableEveryone: true,
      disabledEvents: ["TYPING_START"],
      restTimeOffset: 0,
    });
    this.commands = new Collection();
    this.queue = new Map();
    this.config = config;
    this.cooldowns = new Collection();
  }
};
