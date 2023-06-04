require('dotenv').config();
const { Client, IntentsBitField, ActivityType} = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandlers');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildEmojisAndStickers,
  ],
});

client.on('ready', (c) => {

  client.user.setActivity ({
      name: 'Lego legacy: Heroes Reboxed',
      type: ActivityType.Playing,
      url: 'https://www.youtube.com/watch?v=xvFZjo5PgG0'
  });
});

(async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    eventHandler(client);

    client.login(process.env.TOKEN);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();