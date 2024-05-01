const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const { getAllFiles } = require("../utils/handler");
const { buttonMenu } = require("../utils/buttonMenu");

module.exports = {
  name: "owner",
  category: "Utility",
  description: "Add, delete, update, check stock!",
  hidden: true,
  options: [
    {
      name: "add",
      description: "Add stock to database (OWNER ONLY)",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "product-name",
          description: "Product name",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "product-code",
          description: "Product code (PID1)",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "product-stock",
          description: "Product stock",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
        {
          name: "product-price",
          description: "Product price",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
      ],
    },
    {
      name: "update",
      description: "Updates stock data (OWNER ONLY)",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "product-code",
          description: "Insert the product code you want to update!",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "update-name",
          description: "Update the product name!",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "update-code",
          description: "Update the product code!",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "update-stock",
          description: "Add more stock to your product! (stock cannot be 0)",
          type: ApplicationCommandOptionType.Integer,
          required: false,
        },
        {
          name: "update-price",
          description: "Update your stock price! (price cannot be 0)",
          type: ApplicationCommandOptionType.Integer,
          required: false,
        },
      ],
    },
    {
      name: "delete",
      description: "Delete stock (OWNER ONLY)",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "product-code",
          description: "Product code to delete",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "add-data",
      description: "Add data to the stock folder. (OWNER ONLY)",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "file",
          description: "The stock file",
          type: ApplicationCommandOptionType.Attachment,
          required: true,
        },
        {
          name: "file-name",
          description: "Use format: (CODE)_(STOCK). ex: UID_3 if there are 3 stock!",
          type: ApplicationCommandOptionType.String,
          minLength: 4,
          required: true,
        },
      ],
    },
    {
      name: "check",
      description: 'Check stock from the "stock" folder. (OWNER ONLY)',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],

  callback: async (client, interaction) => {
    try {
      const storeSchema = require("../db/models/storeSchema");
      const storeData = await storeSchema.findOne({
        guildId: interaction.guild.id,
      });

      // ! Set your own discord id
      let owners = ["937876388554375188"];

      switch (interaction.options._subcommand) {
        case "add":
          if (!owners.includes(interaction.user.id)) {
            return interaction.reply({ content: "No.", ephemeral: true });
          }

          const productName = interaction.options.getString("product-name");
          const productCode = interaction.options.getString("product-code");
          const productStock = interaction.options.getInteger("product-stock");
          const productPrice = interaction.options.getInteger("product-price");

          const payload = {
            productName,
            productCode,
            productStock,
            productPrice,
          };

          await storeSchema.findOneAndUpdate(
            {
              guildId: interaction.guild.id,
            },
            {
              guildId: interaction.guild.id,
              $push: {
                store: payload,
              },
            },
            {
              upsert: true,
            }
          );

          interaction.reply({ content: "Stock added!", ephemeral: true });

          break;

        case "update":
          if (!owners.includes(interaction.user.id)) {
            return interaction.reply({ content: "No.", ephemeral: true });
          }

          if (!storeData || storeData.store.length === 0) {
            return interaction.reply({
              content: "There are no stock added to the database yet.",
              ephemeral: true,
            });
          }

          const codeProduct = interaction.options.getString("product-code");

          const nameProduct = interaction.options.getString("update-name");
          const codeUpdate = interaction.options.getString("update-code");
          const stockProduct = interaction.options.getInteger("update-stock");
          const priceProduct = interaction.options.getInteger("update-price");

          const beforeUpdate = await storeSchema.findOne({
            guildId: interaction.guild.id,
            "store.productCode": codeProduct,
          });

          if (!beforeUpdate) {
            return interaction.reply({
              content: "Cannot find product with that id.",
              ephemeral: true,
            });
          }

          for (let i = 0; i < beforeUpdate.store.length; i++) {
            if (beforeUpdate.store[i].productCode === codeProduct) {
              const updatedStoreData = await storeSchema.findOneAndUpdate(
                {
                  "store.productCode": codeProduct,
                },
                {
                  $set: {
                    "store.$.productCode": codeUpdate || beforeUpdate.store[i].productCode,
                    "store.$.productName": nameProduct || beforeUpdate.store[i].productName,

                    "store.$.productStock":
                      stockProduct?.toString() || beforeUpdate.store[i].productStock,
                    "store.$.productPrice": priceProduct || beforeUpdate.store[i].productPrice,
                  },
                },
                {
                  returnOriginal: false,
                }
              );

              let updateProductEmbed = new EmbedBuilder()
                .setColor("#DD77EB")
                .setTitle("! PREVIEW !")
                .setAuthor({
                  name: "Stock List!",
                  iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(
                  [
                    "List of the current available stock!",
                    "To buy, please do `/stock buy <code>`. ",
                  ].join("\n")
                )
                .setFooter({
                  text: "Created by Paiz#5599",
                  iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                });

              let updateString = "";
              for (const updatedProduct of updatedStoreData.store) {
                updateString += updateProductEmbed.addFields({
                  name: `${updatedProduct.productName}`,
                  value: `• Code: ${updatedProduct.productCode}\n• Stock: ${updatedProduct.productStock}\n• Price: ${updatedProduct.productPrice} WL`,
                  inline: true,
                });
              }

              return interaction.reply({
                content: "Data updated!",
                embeds: [updateProductEmbed],
                ephemeral: true,
              });
            }
          }

          break;

        case "delete":
          const getRemoveCode = interaction.options.getString("product-code");

          if (!owners.includes(interaction.user.id)) {
            return interaction.reply({ content: "No.", ephemeral: true });
          }

          const deleteStore = await storeSchema.findOne({
            guildId: interaction.guild.id,
            "store.productCode": getRemoveCode,
          });

          if (!deleteStore) {
            return interaction.reply({
              content: "Cannot find product with that id.",
              ephemeral: true,
            });
          }

          for (let i = 0; i < storeData.store.length; i++) {
            if (storeData.store[i].productCode === getRemoveCode) {
              await storeSchema.findOneAndUpdate(
                {
                  "store.productCode": getRemoveCode,
                },
                {
                  $pull: {
                    store: storeData.store[i],
                  },
                }
              );

              return interaction.reply({
                content: `Sucessfully deleted product: **${storeData.store[i].productName}** with Code: **${storeData.store[i].productCode}**.`,
                ephemeral: true,
              });
            }
          }

          break;

        case "add-data":
          await interaction.deferReply({ ephemeral: true });

          const getFileName = interaction.options.getString("file-name");
          const cidFile = interaction.options.getAttachment("file");
          const fileType = cidFile.name.split(".").pop().toLowerCase();

          if (!owners.includes(interaction.user.id)) {
            return interaction.followUp({ content: "No.", ephemeral: true });
          }

          if (!/_/g.test(getFileName)) {
            return interaction.followUp({
              content: `You need to write the stock file name like this: **CODE_STOCK**.\nExample: If the code are **UID1** and u have **3** stock, you need to write it like this: **UID1_3**, **UID1_2** and so on!`,
            });
          }

          if (fileType !== "txt") {
            return interaction.followUp({
              content: "Make sure the file type you sent are txt!",
            });
          }

          // * Check if the "stock" folder are exist.
          const isFolderExist = fs.existsSync(path.join(__dirname, "../stock"));
          if (!isFolderExist) {
            return interaction.followUp({
              content: 'Cannot find "stock" folder.',
            });
          }

          const stockDataPath = path.join(__dirname, "../stock");
          const stockFiles = getAllFiles(stockDataPath);

          let stockFileNameArr = [];
          for (let stockFile of stockFiles) {
            let stockFileName = stockFile.split(/[/\\]/);
            stockFileName = stockFileName.pop().split(".")[0];

            stockFileNameArr.push(stockFileName);
          }

          for (let i = 0; i < stockFileNameArr.length; i++) {
            if (stockFileNameArr[i] === getFileName) {
              console.log(
                `[${new Date().toLocaleString()}] - User inserted a document name that already exist: ${
                  stockFileNameArr[i]
                }`
              );

              return interaction.followUp({
                content: `The stock file name you put is already exist. Please try another!`,
              });
            }
          }

          // * Fetch the txt file sent from discord.
          const res = await fetch(cidFile.url);
          // * Get the text
          const resText = await res.text();

          const stockFolderPath = path.join(__dirname, `../stock/${getFileName}.txt`);
          fs.writeFile(
            stockFolderPath,
            resText,
            {
              encoding: "utf-8",
            },
            (err) => {
              if (err) throw err;
              console.log(
                `[${new Date().toLocaleString()}] - Saved new stock with name ${getFileName}.txt`
              );
            }
          );

          const stockFile = extractStockFile(getFileName);

          interaction.followUp({
            content: `New stock file has been added to the stock folder!\n\nCode: **${stockFile.code}**\nStock: **${stockFile.stock}**\nOriginal Name: **${getFileName}.txt**\n\nMake sure that there is a stock with code: **${stockFile.code}** and a total stock of: **${stockFile.stock}**!`,
          });

          function extractStockFile(fileName) {
            const productFile = fileName.split("_");

            const productCode = productFile[0];
            const productStock = productFile[1];

            return { code: productCode, stock: productStock };
          }
          break;

        case "check":
          if (!owners.includes(interaction.user.id)) {
            return interaction.reply({ content: "No.", ephemeral: true });
          }

          const stockPath = path.join(__dirname, "../stock");
          const files = getAllFiles(stockPath);

          let stockNameArr = [];
          for (let file of files) {
            let stockName = file.split(/[/\\]/);
            stockName = stockName.pop();

            stockNameArr.push(stockName);
          }

          try {
            buttonMenu(interaction, stockNameArr, true);
          } catch (err) {
            console.log(`[ERROR] in OWNER command`, err);
          }
          break;
      }
    } catch (err) {
      console.log(err);
      return interaction.reply({
        content: "Something went wrong in **STOCK** command. Please contact **Paiz#5599**",
        ephemeral: true,
      });
    }
  },
};
