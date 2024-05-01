const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const userSchema = require("../db/models/userSchema");

module.exports = {
  name: "user",
  category: "Utility",
  categoryEmoji: "",
  description: "Set user, check user account!",
  hidden: false,
  options: [
    {
      name: "set",
      description: "Set your GrowID",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "growid",
          description: "Type your GrowID",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "balance",
      description: "Check your current account balance!",
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],

  callback: async (client, interaction) => {
    try {
      const userData = await userSchema.findOne({
        userId: interaction.user.id,
      });

      switch (interaction.options._subcommand) {
        case "set":
          const getGrowid = interaction.options.getString("growid").toLowerCase();
          const getAllUser = await userSchema.find();

          const embedGrowid = new EmbedBuilder().setColor("Green").setFooter({
            text: "Created by Paiz#5599",
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          });

          if (/ /g.test(getGrowid)) {
            return interaction.reply({
              embeds: [embedGrowid.setDescription("Invalid name!").setColor("Red")],
              ephemeral: true,
            });
          }

          // * if growid exist.
          // for (let i = 0; i < getAllUser.length; i++) {
          //   if (
          //     getAllUser[i].userGrowId.toLowerCase() !== getGrowid.toLowerCase()
          //   ) {
          //     continue;
          //   } else {
          //     return interaction.reply({
          //       embeds: [
          //         embedGrowid
          //           .setDescription(
          //             'Nice try buddy, but you cannot set user with that GrowID!'
          //           )
          //           .setColor('Red'),
          //       ],
          //       ephemeral: true,
          //     });
          //   }
          // }

          if (!userData) {
            await userSchema.create({
              userId: interaction.user.id,
              userGrowId: getGrowid,
            });

            return interaction.reply({
              embeds: [embedGrowid.setDescription(`GrowID has been set to **${getGrowid}**`)],
              ephemeral: true,
            });
          } else {
            await userSchema.findOneAndUpdate(
              {
                userId: interaction.user.id,
              },
              {
                userGrowId: getGrowid,
              }
            );

            return interaction.reply({
              embeds: [
                embedGrowid
                  .setDescription(`Your Growid has been changed to **${getGrowid}**`)
                  .setColor("Green"),
              ],
              ephemeral: true,
            });
          }

        case "balance":
          const embedBalance = new EmbedBuilder()
            .setColor("Green")
            .setFooter({ text: "Created by Paiz#5599" });

          if (!userData) {
            return interaction.reply({
              embeds: [embedBalance.setDescription("Set your GrowID first!").setColor("Red")],
            });
          }

          const balance = userData.userBalance;

          interaction.reply({
            embeds: [
              embedBalance
                .setAuthor({
                  name: `Account balance for: ${userData.userGrowId}`,
                })
                .setDescription(`You currently have **${balance}** WL`),
            ],
            ephemeral: true,
          });

          break;
      }
    } catch (err) {
      console.log(err);
      return interaction.reply({
        content: "Something went wrong in **USER** command. Please contact **Paiz#5599*",
        ephemeral: true,
      });
    }
  },
};
