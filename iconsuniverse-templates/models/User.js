const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: false, // absent for Google OAuth-only accounts
    select: false,
  },
  googleId: {
    type: String,
    default: null,
  },
  avatarUrl: {
    type: String,
    default: '/assets/default-avatar.png',
  },
  role: {
    type: String,
    enum: ['user', 'contributor', 'editor', 'admin'],
    default: 'user',
  },
  plan: {
    type: String,
    enum: ['free', 'pro_monthly', 'pro_annual'],
    default: 'free',
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null,
  },
  downloadCountToday: {
    type: Number,
    default: 0,
  },
  lastDownloadResetAt: {
    type: Date,
    default: Date.now,
  },
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
  }],
  isVerified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
