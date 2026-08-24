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
    enum: ['outline', 'filled', 'color', 'flat', 'gradient', 'hand-drawn', '3d'],
    default: 'outline',
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
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
  },
}, { timestamps: false, versionKey: false });

module.exports = mongoose.model('Icon', iconSchema);
