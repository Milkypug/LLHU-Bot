const mongoose = require('mongoose');

const TileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  tiles: {
    Common: {
      type: Number,
      default: 0,
      validate: {
        validator: function(v) {
          return Number.isInteger(v) && v >= 0;
        },
        message: 'Count must be a positive integer.',
      },
    },
    Uncommon: {
      type: Number,
      default: 0,
      validate: {
        validator: function(v) {
          return Number.isInteger(v) && v >= 0;
        },
        message: 'Count must be a positive integer.',
      },
    },
    Rare: {
      type: Number,
      default: 0,
      validate: {
        validator: function(v) {
          return Number.isInteger(v) && v >= 0;
        },
        message: 'Count must be a positive integer.',
      },
    },
    Legendary: {
      type: Number,
      default: 0,
      validate: {
        validator: function(v) {
          return Number.isInteger(v) && v >= 0;
        },
        message: 'Count must be a positive integer.',
      },
    },
    Legacy: {
      type: Number,
      default: 0,
      validate: {
        validator: function(v) {
          return Number.isInteger(v) && v >= 0;
        },
        message: 'Count must be a positive integer.',
      },
    },
  },
});

module.exports = mongoose.model('Tile', TileSchema);