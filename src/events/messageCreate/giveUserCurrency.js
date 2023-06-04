const { Message } = require('discord.js');
const Currency = require('../../models/Currency');
const cooldowns = new Set();

/**
 *
 * @param {Message} message
 */
module.exports = async (client, message) => {
    const ignoredServerId = process.env.IGNORED_SERVER_ID
    if (!message.guild || message.author.bot || cooldowns.has(message.author.id) || message.guild.id === ignoredServerId) return;

    const GEM_CHANCE = 0.75;
  
    const MIN_COINS_PER_MESSAGE = 2500;
    const MAX_COINS_PER_MESSAGE = 7500;
  
    const MIN_GEMS_PER_MESSAGE = 2;
    const MAX_GEMS_PER_MESSAGE = 6;
  
    // A helper function to generate a random number between min and max (inclusive)
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  
    // Give coins and possibly gems
    const coins = getRandomInt(MIN_COINS_PER_MESSAGE, MAX_COINS_PER_MESSAGE);
    const gems = Math.random() < GEM_CHANCE ? getRandomInt(MIN_GEMS_PER_MESSAGE, MAX_GEMS_PER_MESSAGE) : 0;
    const user = message.author.id;

      // Find the user's currency data
  let currency = await Currency.findOne({ userId: user });

  // If the user does not have currency data, create a new document
  if (!currency) {
    currency = new Currency({ userId: user, coins: 0, gems: 0 });
  }

  // Add the coins and gems to the user's data
  currency.coins += coins;
  currency.gems += gems;

  // Save the updated currency data
  await currency.save();

    // Save updated currency data to the user object
    message.author.currency = currency;
  
    console.log(`Gave ${coins} coins and ${gems} gems to user ${user}`);

    // Add user to cooldowns set
    cooldowns.add(message.author.id);
  
    // Remove user from cooldowns set after 3 seconds
    setTimeout(() => {
        cooldowns.delete(message.author.id);
    }, 3000);
}
