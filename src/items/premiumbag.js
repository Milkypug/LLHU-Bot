const { EmbedBuilder, Client, Interaction, Message} = require('discord.js');
const Currency = require('../models/Currency');
const Tile = require('../models/Tile');

module.exports = {
  /**
 * @param {Client} client
 * @param {Interaction} interaction
 * @param {Message} message
 */
  async callback(client, interaction, message) {

const rarities = [
  { rarity: 'Common', probability: 0.25 },
  { rarity: 'Uncommon', probability: 0.25 },
  { rarity: 'Rare', probability: 0.25 },
  { rarity: 'Legendary', probability: 0.15 },
  { rarity: 'Legacy', probability: 0.10 },
];

const counts = [
  { count: 10, probability: 0.2409 },
  { count: 15, probability: 0.25 },
  { count: 20, probability: 0.16 },
  { count: 50, probability: 0.15 },
  { count: 75, probability: 0.1 },
  { count: 100, probability: 0.05 },
  { count: 150, probability: 0.03 },
  { count: 200, probability: 0.01 },
  { count: 1000, probability: 0.0001 },
];

async function createPremiumBag(interaction) {
  const tiles = [];
  const count = getRandomCount(interaction);

  for (let i = 0; i < count; i++) {
    const rarity = getRandomRarity(interaction);
    const existingTile = await Tile.findOne({ userId: interaction.user.id, rarity });
    if (existingTile) {
      existingTile.count++;
      tiles.push(existingTile.save());
    } else {
      const tile = new Tile({ userId: interaction.user.id, rarity: rarity, count: 1 });
      tiles.push(tile.save());
    }
  }

  const newTiles = await Promise.all(tiles);
  return newTiles;
}

function getRandomCount(interaction) {
  const rand = Math.random();
  let cumulativeProb = 0;

  for (const count of counts) {
    cumulativeProb += count.probability;
    if (rand <= cumulativeProb) {
      return count.count;
    }
  }
}

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

    const currency = await Currency.findOne({ userId: interaction.user.id });

if (!currency) {
  throw new Error('User not found.');
}

const tiles = await createPremiumBag(interaction);

const tileCounts = {};

tiles.forEach((tile) => {
  if (!tileCounts[tile.rarity]) {
    tileCounts[tile.rarity] = 0;
  }
  tileCounts[tile.rarity]++;
});

const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Legendary', 'Legacy'];

const tileDescriptions = await Promise.all(Object.entries(tileCounts).map(async ([rarity, count]) => {
  const countString = count > 0 ? count.toString() : '0';
  const total = await Tile.aggregate([{ $match: { userId: interaction.user.id, rarity } }, { $group: { _id: null, count: { $sum: '$count' } } }]).exec();
  return `${rarityEmojis[rarity]} ${rarity} **${countString}** (Total: **${total[0]?.count || 0}**)`;
}));

tileDescriptions.sort((a, b) => {
  const aIndex = rarityOrder.indexOf(a.split(' ')[1]);
  const bIndex = rarityOrder.indexOf(b.split(' ')[1]);
  return aIndex - bIndex;
});

const premiumBagEmbed = new EmbedBuilder()
.setTitle(`You got ${tiles.length} tiles from a Premium Bag!`)
.setColor('Purple')
.setThumbnail(interaction.user.avatarURL())
.setDescription(tileDescriptions.join('\n'));

return interaction.channel.send({ embeds: [premiumBagEmbed] });
  }
}
