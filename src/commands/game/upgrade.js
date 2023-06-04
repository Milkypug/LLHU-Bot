const { EmbedBuilder, Client, Interaction } = require('discord.js');
const Character = require('../../models/Character');
const Tile = require('../../models/Tile');
const charactersObject = require('../../../characters.json');
const characters = Object.values(charactersObject);

const choices = characters.map(char => ({
  name: `${char.name} (${char.rarity})`,
  value: char.name,
}));

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const { user } = interaction;

    // Get selected character
    const characterName = interaction.options.getString('character');
    const selectedCharacter = characters.find(char => char.name === characterName);

    if (!selectedCharacter) {
      return interaction.reply(`No character found with the name ${characterName}.`);
    }

    // Get the user's existing character
    const existingCharacter = await Character.findOne({ userId: user.id, name: selectedCharacter.name });
    if (!existingCharacter) {
      return interaction.reply(`You haven't unlocked ${selectedCharacter.name} yet!`);
    }

    // Get the user's existing tile count for the selected character's rarity
    const userTiles = await Tile.findOne({ userId: user.id, rarity: selectedCharacter.rarity });
    if (!userTiles) {
      return interaction.reply(`You don't have any ${selectedCharacter.rarity} tiles!`);
    }

    const tileCounts = [ 20, 35, 50, 75, 100, 150];

    if (existingCharacter.starLevel >= 7) {
      return interaction.reply(`You have already reached the maximum star level for ${selectedCharacter.name} (${selectedCharacter.rarity}).`);
    }
    
    // Check if the user has enough tiles for the next star level
    const requiredTiles = [ 20, 35, 50, 75, 100, 150];
    const nextStarLevel = existingCharacter.starLevel + 1;
    const requiredTileCount = requiredTiles[nextStarLevel - 2];
    if (!userTiles || userTiles.count < requiredTileCount) {
      return interaction.reply(`You need ${requiredTileCount} ${selectedCharacter.rarity} tiles to upgrade ${selectedCharacter.name} to star level ${nextStarLevel}.`);
    }
    
    // If the user has enough tiles, consume them and upgrade the character
    await Tile.findOneAndUpdate(
      { userId: user.id, rarity: selectedCharacter.rarity },
      { $inc: { count: -requiredTileCount } },
      { upsert: true }
    );
    
    existingCharacter.starLevel = nextStarLevel;
    await existingCharacter.save();
    
    let embedColor;
    switch (existingCharacter.rarity) {
      case 'Common':
        embedColor = '#807e79';
        break;
      case 'Uncommon':
        embedColor = '#0279b5';
        break;
      case 'Rare':
        embedColor = '#4ab502';
        break;
      case 'Legendary':
        embedColor = '#810da1';
        break;
      case 'Legacy':
        embedColor = '#a16f0d';
        break;
      default:
        embedColor = '#424242';
        break;
    }

    const emptyStarEmoji = client.emojis.cache.find(
      (emoji) => emoji.name === 'llhuemptystar' && emoji.guild.id === '978919454807310387'
    );
    const filledStarEmojis = [
      client.emojis.cache.find(
        (emoji) => emoji.name === 'llhu1star' && emoji.guild.id === '978919454807310387'
      ),
      client.emojis.cache.find(
        (emoji) => emoji.name === 'llhu2star' && emoji.guild.id === '978919454807310387'
      ),
      client.emojis.cache.find(
        (emoji) => emoji.name === 'llhu3star' && emoji.guild.id === '978919454807310387'
      ),
      client.emojis.cache.find(
        (emoji) => emoji.name === 'llhu4star' && emoji.guild.id === '978919454807310387'
      ),
      client.emojis.cache.find(
        (emoji) => emoji.name === 'llhu5star' && emoji.guild.id === '978919454807310387'
      ),
      client.emojis.cache.find(
        (emoji) => emoji.name === 'llhu6star' && emoji.guild.id === '978919454807310387'
      ),
      client.emojis.cache.find(
        (emoji) => emoji.name === 'llhu7star' && emoji.guild.id === '978919454807310387'
      )
    ];

    let prevStars = '';
    for (let i = 1; i < existingCharacter.starLevel; i++) {
      prevStars += `${filledStarEmojis[i - 1]} `;
    }

    let newStars = '';
    for (let i = 1; i <= existingCharacter.starLevel; i++) {
      newStars += `${filledStarEmojis[i - 1]} `;
    }
    for (let i = existingCharacter.starLevel; i < 7; i++) {
      newStars += `${emptyStarEmoji} `;
    }

    const upgradeEmbed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(`You upgraded ${selectedCharacter.name} (${selectedCharacter.rarity}) to star level ${existingCharacter.starLevel}!`)
      .setDescription(`${prevStars} -> ${newStars}`)
      .setImage(selectedCharacter.image)
      .setThumbnail('https://cdn.discordapp.com/attachments/978919455495192628/1100053658986627242/IMG_7288.png')

      return interaction.reply({ embeds: [upgradeEmbed] });    
  },

  name: 'upgrade',
  description: 'Upgrade a character to a higher star level using required tiles.',
  options: [
    {
      name: 'character',
      description: 'Select a character to upgrade.',
      required: true,
      type: 3,
      choices,
    },
  ],
}