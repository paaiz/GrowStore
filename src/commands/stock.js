const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  AttachmentBuilder,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'stock',
  category: 'Utility',
  categoryEmoji: '',
  description: 'Buy and see stock list!',
  hidden: false,
  options: [
    {
      name: 'buy',
      description: 'Buy product from the stock list!',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'code',
          description: 'Insert the code. (Do /stock list to see!)',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: 'list',
      description: 'List of stock that you can buy!',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],

  callback: async (client, interaction) => {
    try {
      const storeSchema = require('../db/models/storeSchema');
      const storeData = await storeSchema.findOne({
        guildId: interaction.guild.id,
      });

      switch (interaction.options._subcommand) {
        case 'list':
          let embed = new EmbedBuilder()
            .setColor('#DD77EB')
            .setAuthor({
              name: 'Stock List!',
              iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(
              [
                'List of the current available stock!',
                'To buy, please do `/stock buy <code>`. ',
              ].join('\n')
            )
            .setFooter({
              text: 'Created by Paiz#5599',
              iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            });

          if (!storeData || storeData.store.length === 0) {
            return interaction.reply({
              embeds: [
                embed.setDescription(
                  [
                    'List of the current available stock!',
                    'To buy, please do `/stock buy <code>`.\n',
                    '**There are no stock available!**',
                  ].join('\n')
                ),
              ],
              ephemeral: true,
            });
          }

          let string = '';
          for (const store of storeData.store) {
            string += embed.addFields({
              name: `${store.productName}`,
              value: `• Code: ${store.productCode}\n• Stock: ${store.productStock}\n• Price: ${store.productPrice} WL`,
              inline: true,
            });
          }

          interaction.reply({ embeds: [embed] });

          break;

        case 'buy':
          const userSchema = require('../db/models/userSchema');
          const userData = await userSchema.findOne({
            userId: interaction.user.id,
          });

          if (!userData)
            return interaction.reply({
              content: 'Set your GrowID first. To set, `/user set <growid>`',
              ephemeral: true,
            });

          const getCode = interaction.options.getString('code');

          const storeDataExist = await storeSchema.findOne({
            guildId: interaction.guild.id,
            'store.productCode': getCode,
          });

          if (!storeDataExist) {
            return interaction.reply({
              content: 'Cannot find product with that code!',
              ephemeral: true,
            });
          }

          for (let i = 0; i < storeData.store.length; i++) {
            if (storeData.store[i].productCode === getCode) {
              await interaction.deferReply({ ephemeral: true });

              const balance = userData.userBalance;
              const balanceNeeded =
                storeData.store[i].productPrice - userData.userBalance;

              if (balance < storeData.store[i].productPrice) {
                return interaction.followUp({
                  content: `You need **${balanceNeeded}** WL left to buy this item!`,
                });
              }

              if (storeData.store[i].productStock <= 0) {
                return interaction.followUp({
                  content: 'This product are sold out!',
                });
              } else;

              // Make sure if the file exist
              if (
                !fs.existsSync(
                  path.join(
                    __dirname,
                    `../stock/${getCode}_${storeData.store[i].productStock}.txt`
                  )
                )
              ) {
                return interaction.followUp({
                  content: `The stock file for: **${storeData.store[i].productName}** with Code: **${storeData.store[i].productCode}** didn't exist.\nPlease contact **Paiz#5599** with a screenshot of this message!`,
                });
              }

              await storeSchema.updateOne(
                {
                  guildId: interaction.guild.id,
                  'store.productCode': getCode,
                },
                {
                  $set: {
                    'store.$.productStock': storeData.store[i].productStock - 1,
                  },
                }
              );

              const userBalanceUpd = await userSchema.findOneAndUpdate(
                {
                  userId: interaction.user.id,
                },
                {
                  $inc: {
                    userBalance: -storeData.store[i].productPrice,
                  },
                }
              );

              interaction
                .followUp({
                  content: `Thank you for purchasing: **${
                    storeData.store[i].productName
                  }**. Your balance is now: **${
                    userBalanceUpd.userBalance - storeData.store[i].productPrice
                  }** WL`,
                })
                .then(() => {
                  try {
                    const file = path.join(
                      __dirname,
                      `../stock/${getCode}_${storeData.store[i].productStock}.txt`
                    );

                    const attachment = new AttachmentBuilder().setFile(file);

                    const user = interaction.guild.members.cache.get(
                      interaction.user.id
                    );

                    user.send({ content: 'Thank you :D', files: [attachment] });
                  } catch (err) {
                    console.log(err);
                  }
                });
            }
          }

          break;
      }
    } catch (err) {
      console.log(err);
      return interaction.reply({
        content:
          'Something went wrong in **STOCK** command. Please contact **Paiz#5599**',
        ephemeral: true,
      });
    }
  },
};
