const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
  identifier: { type: String, required: true, unique: true }, // IP address or Username
  reason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blacklist', blacklistSchema);
