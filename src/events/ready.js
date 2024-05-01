const Database = require('../db/connection');
const { connectToMongo } = new Database();

const { ActivityType } = require('discord.js');

const { loadSlashCommands } = require('../utils/handler');

module.exports = async (client) => {
  console.log(`${client.user.username} is ready!`);

  await loadSlashCommands(client);
  connectToMongo(process.env.MONGODB_URI);

  let number = 0;
  const updateActivity = () => {
    const getGuildUsers = client.guilds.cache.reduce(
      (a, g) => a + g.memberCount,
      0
    );

    const statusString = [
      {
        name: '/help - To see my commands!',
        type: ActivityType.Playing,
      },
      {
        name: `${getGuildUsers} Users`,
        type: ActivityType.Watching,
      },
    ];

    client.user.setPresence({
      status: 'dnd',
      activities: [statusString[number]],
    });

    if (++number >= statusString.length) {
      number = 0;
    }

    setTimeout(updateActivity, 1000 * 60 * 5);
  };
  updateActivity();

  const getSlashCommands = client.commands.map((x) => x);

  try {
    await client.application.commands.set(getSlashCommands);
    console.log(`Slash Commands Deployed Globally!`);
  } catch (err) {
    console.error(err);
  }
};
