const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  userId: {type: String, required: true},
  guildId: { type: String, required: true},
  xp: { type: Number, defult: 0},
  level: { type: Number, default: 1 }, // add the "level" field with a default value of 1
});

module.exports = mongoose.model('Level', levelSchema);
