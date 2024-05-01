const { Schema, model, models } = require('mongoose');

const userSchema = new Schema({
  userId: { type: String, required: true },
  userGrowId: { type: String, required: true },

  userBalance: { type: Number, required: true, default: 0 },
});

const name = 'user-data';
module.exports = models[name] || model(name, userSchema);
