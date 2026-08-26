const mongoose = require('mongoose');

const CDN_BASE = process.env.R2_PUBLIC_URL || 'https://pub-2b1851a9e65c42c095e04c8a758bca43.r2.dev';

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
  path: {
    type: String,
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  },
  packId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pack',
    default: null,
  },
  style: {
    type: String,
    default: 'outline',
  },
  isFilled: {
    type: Boolean,
    default: false,
    index: true,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: 'approved',
  },
}, { 
  timestamps: false, 
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Dynamic Virtual Getters: Produces svgUrl and pngPreviewUrl in all API responses with 0 database storage!
iconSchema.virtual('svgUrl').get(function() {
  return `${process.env.R2_PUBLIC_URL || CDN_BASE}/icons/${this.path}`;
});

iconSchema.virtual('pngPreviewUrl').get(function() {
  return `${process.env.R2_PUBLIC_URL || CDN_BASE}/icons/${this.path}`;
});

module.exports = mongoose.model('Icon', iconSchema);
