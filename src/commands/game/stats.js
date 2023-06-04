const { ApplicationCommandOptionType, EmbedBuilder, Client, Interaction } = require('discord.js');
const Level = require('../../models/Level');
const Tile = require('../../models/Tile');
const Character = require('../../models/Character');
const Currency = require('../../models/Currency');

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const { user } = interaction;
    const { id: guildId } = interaction.guild;

    const mentionedUserId = interaction.options.get('target-user')?.value;
    const targetUserId = mentionedUserId || user.id;
    let targetUser = await interaction.guild.members.fetch(targetUserId);

    if (!targetUser) {
      return interaction.reply({
        content: 'Invalid user specified.',
        ephemeral: true,
      });
    }

    const { id: userId } = targetUser;
    const level = await Level.findOne({ userId, guildId });
    const tiles = await Tile.find({ userId });
    const characters = await Character.find({ userId });
    const currency = await Currency.findOne({ userId });

    let allLevels = await Level.find({ guildId }).select('-_id userId level xp');

    allLevels.sort((a, b) => {
      if (a.level === b.level) {
        return b.xp - a.xp;
      } else {
        return b.level - a.level;
      }
    });
    let currentRank = allLevels.findIndex((lvl) => lvl.userId === userId) + 1;

    const rarityEmojis = {
      Common: client.emojis.cache.find(
        (emoji) =>
          emoji.name === 'commontile' && emoji.guild.id === '978919454807310387'
      ),
      Uncommon: client.emojis.cache.find(
        (emoji) =>
          emoji.name === 'uncommontile' && emoji.guild.id === '978919454807310387'
      ),
      Rare: client.emojis.cache.find(
        (emoji) => emoji.name === 'raretile' && emoji.guild.id === '978919454807310387'
      ),
      Legendary: client.emojis.cache.find(
        (emoji) =>
          emoji.name === 'legendarytile' && emoji.guild.id === '978919454807310387'
      ),
      Legacy: client.emojis.cache.find(
        (emoji) => emoji.name === 'legacytile' && emoji.guild.id === '978919454807310387'
      ),
    };

    if (!level) {
      return interaction.reply({
        content: 'This user has no stats yet.',
        ephemeral: true,
      });
    }

    const coinsValue = currency && currency.coins ? currency.coins.toLocaleString() : '0';
    const gemsValue = currency && currency.gems ? currency.gems.toLocaleString() : '0';

    const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Legendary', 'Legacy'];
    const collectedTiles = rarityOrder.map((rarity) => {
      const tilesOfRarity = tiles.filter((tile) => tile.rarity === rarity);
      if (tilesOfRarity.length > 0) {
        const emoji = rarityEmojis[rarity] || '';
        return `${emoji} ${rarity}: ${tilesOfRarity[0].count}`;
      }
      const emoji = rarityEmojis[rarity] || '';
      return `${emoji} ${rarity}: 0`; // display 0 instead of "None" for the rarity with no tiles collected
    });    
    
    let collectedTilesValue;
    if (collectedTiles.length === 0) {
      collectedTilesValue = 'This user has not collected any tiles yet.';
    } else {
      collectedTilesValue = collectedTiles.join('\n');
    }    
    
    const charactersValue = characters.length > 0 ?
    characters.reduce((rarityMap, character) => {
      rarityMap[character.rarity] = (rarityMap[character.rarity] || 0) + 1;
      return rarityMap;
    }, {}) :
    'This user has not collected any characters yet.';
  
  const charactersValueString = typeof charactersValue === 'object' ? 
    Object.entries(charactersValue).map(([rarity, count]) => `${rarity}: ${count}`).join('\n') :
    charactersValue;
  
  if (!mentionedUserId) {
    targetUser = interaction.member;
  }
  
  const bannerColor = targetUser.displayHexColor ?? '#0099ff';
  
  const fields = [
    {
      name: '<:leaderboard:1097103991642525696> Rank <:leaderboard:1097103991642525696>',
      value: `Level: **${level.level.toString()}** | Rank: **${currentRank.toString()}** `,
    },
    { name: '<:coins:1100662402112049152> Currencies <:gems:1100662599571488872>', 
    value: `<:coins:1100662402112049152> ${coinsValue} Coins
<:gems:1100662599571488872> ${gemsValue} Gems`},
    { name: 'Tiles Collected', value: collectedTilesValue },
    { name: 'Characters Unlocked <:unlocked:1100662265046384721>', value: charactersValueString },
  ];
  
  const statembed = new EmbedBuilder()
    .setColor(bannerColor)
    .setTitle(`${targetUser.user.username}'s stats`)
    .setThumbnail(targetUser.user.avatarURL())
    .addFields(fields);
  
  await interaction.reply({ embeds: [statembed] });       
},
    name: 'stats',
    description: `Check a user's stats.`,
    options: [
        {
        name: 'target-user',
        description: 'Select a user to view.',
        type: ApplicationCommandOptionType.User
        },
    ],
}