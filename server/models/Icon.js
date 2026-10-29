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
    default: '',
  },
  svgContent: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  colors: [{
    type: String,
  }],
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
  contributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  isAnimated: {
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
  timestamps: true, 
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// High performance compound indexes for instantaneous style filtering, sorting & animated tabs
iconSchema.index({ style: 1, downloadCount: -1, _id: 1 });
iconSchema.index({ isAnimated: 1, downloadCount: -1, _id: 1 });
iconSchema.index({ categoryId: 1, isAnimated: 1, style: 1, downloadCount: -1, _id: 1 });
iconSchema.index({ categoryId: 1, downloadCount: -1, _id: 1 });
iconSchema.index({ downloadCount: -1, _id: 1 });

// Dynamic Virtual Getters: Produces svgUrl and pngPreviewUrl in all API responses
iconSchema.virtual('svgUrl').get(function() {
  if (this.path) {
    const safePath = this.path.split('/').map(encodeURIComponent).join('/');
    return `${process.env.R2_PUBLIC_URL || CDN_BASE}/icons/${safePath}`;
  }
  return `/api/icons/svg/${this._id}`;
});

iconSchema.virtual('pngPreviewUrl').get(function() {
  if (this.path) {
    const safePath = this.path.split('/').map(encodeURIComponent).join('/');
    return `${process.env.R2_PUBLIC_URL || CDN_BASE}/icons/${safePath}`;
  }
  return `/api/icons/svg/${this._id}`;
});

module.exports = mongoose.model('Icon', iconSchema);
