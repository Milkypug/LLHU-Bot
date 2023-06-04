const { Client, EmbedBuilder, Message, IntentsBitField } = require('discord.js');
const Level = require('../../models/Level');
const Tile = require('../../models/Tile');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const cooldowns = new Set();

function getRandomXp(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const client = new Client({
  intents: [
    IntentsBitField.Flags.GuildEmojisAndStickers,
    IntentsBitField.Flags.GuildMessages
  ],
});

/**
 *
 * @param {Message} message
 */
module.exports = async (client, message) => {
  const ignoredServerId = process.env.IGNORED_SERVER_ID
  if (!message.guild || message.author.bot || cooldowns.has(message.author.id) || message.guild.id === ignoredServerId) return;

  const xpToGive = getRandomXp(10, 15);
  const query = {
    userId: message.author.id,
    guildId: message.guild.id,
  };

  try {
    const level = await Level.findOne(query);

    if (level) {
      level.xp += xpToGive;

      if (level.xp > calculateLevelXp(level.level)) {
        level.xp = 0;
        level.level += 1;
      
        const rarities = [
          { rarity: 'Common', probability: 0.25 },
          { rarity: 'Uncommon', probability: 0.25 },
          { rarity: 'Rare', probability: 0.25 },
          { rarity: 'Legendary', probability: 0.15 },
          { rarity: 'Legacy', probability: 0.10 },
        ];
        
        const totalProbability = rarities.reduce((sum, { probability }) => sum + probability, 0);
        
        const normalizedProbabilities = rarities.map(({ rarity, probability }) => ({
          rarity,
          probability: probability / totalProbability,
        }));
        
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
        
        const existingTiles = await Tile.find({ userId: message.author.id });
        const tilesToGive = 20;
        const tiles = {
          Common: 0,
          Uncommon: 0,
          Rare: 0,
          Legendary: 0,
          Legacy: 0,
        };
        const newTiles = [];
        
        if (existingTiles.length > 0) {
          // update existing tiles
          for (let i = 0; i < tilesToGive; i++) {
            let rarityRoll = Math.random();
            let rarity;
            let cumulativeProbability = 0;
            for (const { rarity: currentRarity, probability } of normalizedProbabilities) {
              cumulativeProbability += probability;
              if (rarityRoll <= cumulativeProbability) {
                rarity = currentRarity;
                break;
              }
            }
        
            tiles[rarity] += 1;
            const existingTile = existingTiles.find((tile) => tile.rarity === rarity);
            if (existingTile) {
              // update the existing document
              existingTile.count += 1;
              await existingTile.save();
            } else {
              // create new tile with the given rarity
              const newTile = new Tile({
                userId: message.author.id,
                rarity,
                count: 1,
              });
              newTiles.push(newTile);
            }
          }
        
          if (newTiles.length > 0) {
            await Tile.insertMany(newTiles);
            message.channel.send(`Congratulations! You have leveled up and received ${newTiles.length} new tiles.`);
          } else {
            message.channel.send(`Congratulations! You have leveled up, but you did not receive any new tiles.`);
          }
        }        
        
        const newTile = await Promise.all(
          Object.keys(rarityEmojis).map(async (rarity) => {
            const count = (await Tile.findOne({ userId: message.author.id, rarity }))?.count || 0;
            return `${rarityEmojis[rarity]} ${rarity}: **${count}**`;
          })
        );
        
        const newTilesMessage = newTiles.length ? newTile.join('\n') : 'You did not receive any new tiles.'        
        
        const levelupEmbed = new EmbedBuilder()
          .setTitle(`Congratulations, ${message.author.username}!`)
          .setColor('Yellow')
          .setDescription(`You've leveled up to **Level ${level.level}** and received **${tilesToGive}** tiles!`)
          .setThumbnail('https://cdn.discordapp.com/attachments/978919455495192628/1097461076523749416/IMG_7215.gif')
          .addFields({name: 'New Tiles', value: newTilesMessage});
        
        await message.channel.send({ embeds: [levelupEmbed] });              
      }

  await level.save().catch((e) => {
    console.log(`Error saving updated level ${e}`);
    return;
  });
  cooldowns.add(message.author.id);
  setTimeout(() => {
    cooldowns.delete(message.author.id);
  }, 3000);
} else {
  const newLevel = new Level({
    userId: message.author.id,
    guildId: message.guild.id,
    xp: xpToGive,
    level: 1,
  });
  await newLevel.save();
  cooldowns.add(message.author.id);
      setTimeout(() => {
        cooldowns.delete(message.author.id);
      }, 3000);
}
} catch (error) {
console.error(error.stack);
}
};