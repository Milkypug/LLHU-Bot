const mongoose = require('mongoose');

const CurrencySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  coins: {
    type: Number,
    required: true,
    default: 0,
  },
  gems: {
    type: Number,
    required: true,
    default: 0,
  },
  eventCurrency: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model('Currency', CurrencySchema);