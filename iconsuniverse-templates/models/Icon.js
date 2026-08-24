const mongoose = require('mongoose');

const iconSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  svgUrl: {
    type: String,
    required: true,
  },
  pngPreviewUrl: {
    type: String,
    required: true,
  },
  epsUrl: {
    type: String,
    default: null,
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
    index: true,
  }],
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  packId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pack',
    default: null,
  },
  style: {
    type: String,
    enum: ['outline', 'filled', 'color', 'flat', 'hand-drawn'],
    required: true,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  contributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

iconSchema.index({ title: 'text', tags: 'text' });

module.exports = mongoose.model('Icon', iconSchema);
