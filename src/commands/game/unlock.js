const { EmbedBuilder } = require('discord.js');
const Tile = require('../../models/Tile');
const Character = require('../../models/Character');
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

    // Check if the user has already unlocked the selected character
    const existingCharacter = await Character.findOne({ userId: user.id, name: selectedCharacter.name });
    if (existingCharacter) {
      return interaction.reply(`You have already unlocked (${selectedCharacter.rarity}) ${selectedCharacter.name}!`);
    }

    // Check if the user has enough tiles for the selected character
    const userTiles = await Tile.find({ userId: user.id, rarity: selectedCharacter.rarity });
    const totalTiles = userTiles.reduce((acc, tile) => acc + tile.count, 0);

    if (totalTiles < selectedCharacter.tilesRequired) {
      return interaction.reply(`You need ${selectedCharacter.tilesRequired} ${selectedCharacter.rarity} tiles to unlock ${selectedCharacter.name}.`);
    }

    // If the user has enough tiles and has not unlocked the character before, unlock the character
    await Tile.findOneAndUpdate(
      { userId: user.id, rarity: selectedCharacter.rarity },
      { $inc: { count: -selectedCharacter.tilesRequired } },
      { upsert: true }
    );

    await Character.create({ userId: user.id, name: selectedCharacter.name, rarity: selectedCharacter.rarity });

    let embedColor;
    switch (selectedCharacter.rarity) {
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

    const unlockEmbed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(`You unlocked ${selectedCharacter.name} (${selectedCharacter.rarity})!`)
      .setThumbnail('https://cdn.discordapp.com/attachments/1014294187568529438/1014339666910130216/icon_unlock_gold.png')
      .setDescription(`Description: ${selectedCharacter.description}`)
      .setImage(selectedCharacter.image);

    return interaction.reply({ embeds: [unlockEmbed] });
  },

  name: 'unlock',
  description: 'Unlock a character using required tiles.',
  options: [
    {
      name: 'character',
      description: 'Select a character to unlock.',
      required: true,
      type: 3,
      choices,
    },
  ],
};
