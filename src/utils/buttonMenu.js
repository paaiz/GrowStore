const {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
} = require('discord.js');

const buttonMenu = async (interaction, array = [], ephemeral = false) => {
  const buttonNext = new ButtonBuilder()
    .setCustomId('next-page')
    .setEmoji('1010216829916033134')
    .setStyle(ButtonStyle.Primary);
  const buttonPrevious = new ButtonBuilder()
    .setCustomId('previous-page')
    .setEmoji('1010216904457211944')
    .setStyle(ButtonStyle.Primary);

  const groupedArr = chunkArrayToGroups(array);
  const fitOnOnePage = array.length <= 10;

  let currentPage = 0;

  const embed = new EmbedBuilder()
    .setAuthor({
      name: 'Stock file list from "stock" folder',
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
    .setDescription(groupedArr[0].join('\n'))
    .setColor('#DD77EB')
    .setFooter({
      text: `Page ${currentPage + 1}/${groupedArr.length}`,
      iconURL: interaction.guild.iconURL({ dynamic: true }),
    });

  const row = new ActionRowBuilder().addComponents([
    buttonPrevious.setDisabled(true),
    buttonNext,
  ]);

  const inte = await interaction.reply({
    embeds: [embed],
    components: fitOnOnePage ? [] : [row],
    ephemeral,
  });

  if (fitOnOnePage) return;

  const collector = inte.createMessageComponentCollector();

  collector.on('collect', async (intera) => {
    intera.customId === 'previous-page'
      ? (currentPage -= 1)
      : (currentPage += 1);

    const boolRow = new ActionRowBuilder().addComponents(
      ...(currentPage
        ? [buttonPrevious.setDisabled(false)]
        : [buttonPrevious.setDisabled(true)]),
      ...(groupedArr[currentPage + 1]
        ? [buttonNext.setDisabled(false)]
        : [buttonNext.setDisabled(true)])
    );

    intera.update({
      embeds: [
        embed.setDescription(groupedArr[currentPage].join('\n')).setFooter({
          text: `Page ${currentPage + 1}/${groupedArr.length}`,
        }),
      ],
      components: [boolRow],
      ephemeral,
    });
  });

  collector.on('end', () => {
    const disabled = new MessageActionRow().addComponents(
      buttonPrevious.setDisabled(true),
      buttonNext.setDisabled(true)
    );

    inte.edit({ embeds: [embed], components: [disabled] });
  });
};

const chunkArrayToGroups = (array = [], size = 10) => {
  let result = [];
  let position = 0;

  while (position < array.length) {
    result.push(array.slice(position, position + size));
    position += size;
  }

  return result;
};

module.exports = { buttonMenu };
