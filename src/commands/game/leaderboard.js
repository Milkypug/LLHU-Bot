const { Client, Interaction, EmbedBuilder } = require('discord.js');
const Level = require('../../models/Level');
const Currency = require('../../models/Currency');

module.exports = {
  name: 'leaderboard',
  description: 'Displays the top 10 users of the server.',

  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async callback(client, interaction) {
    try {

      const emojis = [
        client.emojis.cache.get('1097103454524154027'),
        client.emojis.cache.get('1097103503995969556'),
        client.emojis.cache.get('1097103589253582868'),
        client.emojis.cache.get('1097103647676059648'),
        client.emojis.cache.get('1097103647676059648'),
        client.emojis.cache.get('1097103647676059648'),
        client.emojis.cache.get('1097103683667361812'),
        client.emojis.cache.get('1097103683667361812'),
        client.emojis.cache.get('1097103723098026014'),
        '🤷‍♂️'
      ];

      const users = await Level.find({ level: { $gte: 1 } }).populate('userId').sort({ level: -1 }).limit(10).exec();
      console.log(users);
      const userIds = users.map((user) => user.userId);
      const currencies = await Currency.find({ userId: { $in: userIds } });


      const leaderboard = users.map((user, index) => `${emojis[index]} ${index + 1}. <@${user.userId}> | Level ${user.level} | <:coins:1100662402112049152> ${currencies.find((c) => c.userId == user.userId)?.coins || 0} Coins | <:gems:1100662599571488872> ${currencies.find((c) => c.userId == user.userId)?.gems || 0} Gems |`);
      const leaderboardString = leaderboard.join('\n');

      if (!leaderboardString.length) {
        return await interaction.reply({ content: 'There is no data to show.', ephemeral: true });
      }

      const leaderboardEmbed = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle('<:leaderboard:1097103991642525696> Server Leaderboard <:leaderboard:1097103991642525696>')
        .setDescription(leaderboardString);

      await interaction.reply({ embeds: [leaderboardEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'An error occurred while retrieving the leaderboard.', ephemeral: true });
    }
  }
};
