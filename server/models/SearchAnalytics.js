const mongoose = require('mongoose');

const searchAnalyticsSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  count: {
    type: Number,
    default: 1,
    index: true,
  },
  lastSearchedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SearchAnalytics', searchAnalyticsSchema);
