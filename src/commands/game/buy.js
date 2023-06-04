const { Client, Interaction } = require('discord.js');
const premiumbag = require('../../items/premiumbag');
const Currency = require('../../models/Currency');

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   * @param {String} userId
   */
  async callback(client, interaction) {
    const item = interaction.options.getString('item');
    const user = await Currency.findOne({ userId: interaction.user.id });

    if (!user) {
      throw new Error('User not found.');
    }

    let quantity;
    if (item === 'premium-bag') {
      quantity = 1;
    } else if (item === 'premium-bag-x5') {
      quantity = 5;
    } else if (item === 'premium-bag-x10') {
      quantity = 10;
    } else {
      throw new Error('Invalid item.');
    }

    for (let i = 0; i < quantity; i++) {
      await premiumbag.callback(client, interaction);
    }
  },

  name: 'buy',
  description: "The item you want to buy.",
  options: [
    {
      name: 'item',
      description: 'The item to buy.',
      required: true,
      type: 3,
      choices: [
        {
          name: `Premium Bag (400 gems)`, value: 'premium-bag',
        },
        {
          name: `Premium Bag x5 (1600 gems)`, value: 'premium-bag-x5',
        },
        {
          name: `Premium Bag x10 (3000 gems)`, value: 'premium-bag-x10',
        },
      ],
    },
  ],
};
