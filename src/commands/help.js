const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  category: 'Information',
  categoryEmoji: '',
  description: 'Display help command',
  hidden: false,

  callback: (client, interaction) => {
    const getCategory = client.commands
      .filter((cmd) => cmd.hidden === false)
      .map((cmd) => `**/${cmd.name}** - ${cmd.description}`);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'Command List!',
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setColor('#DD77EB')
      .setDescription(getCategory.join('\n'))
      .setFooter({
        text: 'Created by Paiz#5599',
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    return interaction.reply({ embeds: [embed] });
  },
};
