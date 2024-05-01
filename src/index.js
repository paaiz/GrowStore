require("dotenv/config");

const { Client, Collection } = require("discord.js");
const client = new Client({
  intents: ["Guilds", "DirectMessages", "GuildMessages", "MessageContent", "GuildMembers"],
});

const { eventListener } = require("../src/utils/handler");
eventListener(client);

client.commands = new Collection();

client.login(process.env.BOT_TOKEN);
