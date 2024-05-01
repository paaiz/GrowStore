const { Schema, model, models } = require('mongoose');

const storeSchema = new Schema({
  guildId: { type: String, required: true },
  store: { type: [Object], required: true },
});

const name = 'store-data';
module.exports = models[name] || model(name, storeSchema);
