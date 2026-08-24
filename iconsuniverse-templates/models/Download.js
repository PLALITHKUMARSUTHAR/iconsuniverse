const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  iconId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Icon',
    default: null,
  },
  packId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pack',
    default: null,
  },
  format: {
    type: String,
    enum: ['svg', 'png', 'eps', 'zip'],
    required: true,
  },
  ipAddress: {
    type: String,
    default: null,
  },
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Download', downloadSchema);
