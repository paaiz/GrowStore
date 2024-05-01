const { Message, EmbedBuilder } = require("discord.js");

/**
 *
 * @param {Message} message
 */
module.exports = async (client, message) => {
  const webhookId = ["1038412665002930296"];

  // To detect an incoming embed, that contains a specific keywords.
  if (message.author.id === webhookId && message.embeds[0]) {
    const extract = extractEmbed(message.embeds[0]);

    const userSchema = require("../../db/models/userSchema");
    const getUser = await userSchema.find();

    for (let i = 0; i < getUser.length; i++) {
      if (getUser[i].userGrowId.toLowerCase() === extract.growid.toLowerCase()) {
        console.log(`Found user with name: ${extract.growid}`);

        let worldLock = 0;
        if (extract.itemName === "Diamond Lock") {
          worldLock = extract.amount * 100;
        } else if (extract.itemName === "World Lock") {
          worldLock = extract.amount;
        }

        await userSchema.findOneAndUpdate(
          {
            userGrowId: extract.growid.toLowerCase(),
          },
          {
            $inc: {
              userBalance: worldLock,
            },
          }
        );

        console.log(
          `[${new Date().toLocaleString()}] - Added ${worldLock} WL to ${extract.growid}`
        );
      }
    }
  }

  // Hardcoded to get the player name, item name, and the amount from an embed.
  function extractEmbed(embed) {
    // Get the data from the description of an embed
    const getData = embed.data.description.split(" | ");

    const getUser = getData[1].split("Player Name:")[1].split(" ")[1];
    const getItem =
      getData[2].split("Item Name:")[1].split(" ")[1] +
      " " +
      getData[2].split("Item Name:")[1].split(" ")[2];
    const getAmount = getData[3].split("Amount:")[1].split(" ")[1];

    return { growid: getUser, itemName: getItem, amount: getAmount };
  }
};
