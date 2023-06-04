const mongoose = require('mongoose');
const { Schema } = mongoose;

const characterSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  rarity: {
    type: String,
    enum: ['Common', 'Uncommon', 'Rare', 'Legendary', 'Legacy'],
    required: true,
  },
  tilesRequired: {
    type: [Number],
    default: [30, 35, 50, 75, 100, 150, 200],
  },
starLevel: {
  type: Number,
  default: 1,
  min: 1,
  max: 7,
},
  userId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Character', characterSchema);
