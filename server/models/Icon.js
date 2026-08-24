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
  svgContent: {
    type: String,
    default: '',
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
  googleDriveFileId: {
    type: String,
    default: null,
    index: true,
  },
  googleDriveFolderId: {
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
    index: true,
  },
  packId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pack',
    default: null,
    index: true,
  },
  style: {
    type: String,
    enum: ['outline', 'filled', 'color', 'flat', 'gradient', 'hand-drawn', '3d'],
    default: 'outline',
    index: true,
  },
  colors: [{
    type: String,
  }],
  isPremium: {
    type: Boolean,
    default: false,
    index: true,
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
    default: 'approved',
    index: true,
  },
}, { timestamps: true });

iconSchema.index({ title: 'text', tags: 'text' });

module.exports = mongoose.model('Icon', iconSchema);
