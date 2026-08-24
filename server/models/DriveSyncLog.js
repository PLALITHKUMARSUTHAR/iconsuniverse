const mongoose = require('mongoose');

const driveSyncLogSchema = new mongoose.Schema({
  folderId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['running', 'completed', 'failed'],
    default: 'completed',
  },
  totalFound: {
    type: Number,
    default: 0,
  },
  iconsIngested: {
    type: Number,
    default: 0,
  },
  iconsUpdated: {
    type: Number,
    default: 0,
  },
  errors: [{
    type: String,
  }],
  triggeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('DriveSyncLog', driveSyncLogSchema);
