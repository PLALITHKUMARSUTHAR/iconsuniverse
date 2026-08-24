const Collection = require('../models/Collection');
const Icon = require('../models/Icon');
const User = require('../models/User');
const { streamIconsZip } = require('../utils/zipBuilder');
const { generateWebFontBundle } = require('../utils/webfontGenerator');

// @desc    Get current user's collections
// @route   GET /api/collections
// @access  Private
exports.getCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find({ userId: req.user.id })
      .populate('iconIds', 'title slug svgContent pngPreviewUrl isPremium style')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: { collections } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single collection (public or owner)
// @route   GET /api/collections/:id
// @access  Public / Private
exports.getCollectionById = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('iconIds', 'title slug svgContent pngPreviewUrl isPremium style tags')
      .populate('userId', 'name avatarUrl');

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    if (!collection.isPublic && (!req.user || req.user.id !== collection.userId._id.toString())) {
      return res.status(403).json({ success: false, message: 'This collection is private' });
    }

    res.status(200).json({ success: true, data: { collection } });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new collection
// @route   POST /api/collections
// @access  Private
exports.createCollection = async (req, res, next) => {
  try {
    const { name, isPublic = false } = req.body;
    const collection = await Collection.create({
      name: name || 'My Collection',
      userId: req.user.id,
      isPublic,
      iconIds: [],
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { collections: collection._id },
    });

    res.status(201).json({ success: true, data: collection });
  } catch (err) {
    next(err);
  }
};

// @desc    Add / Remove icon in collection
// @route   POST /api/collections/:id/icons
// @access  Private
exports.toggleIconInCollection = async (req, res, next) => {
  try {
    const { iconId, action = 'add' } = req.body;
    const collection = await Collection.findOne({ _id: req.params.id, userId: req.user.id });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    if (action === 'add') {
      if (!collection.iconIds.includes(iconId)) {
        collection.iconIds.push(iconId);
      }
    } else {
      collection.iconIds = collection.iconIds.filter(id => id.toString() !== iconId);
    }

    await collection.save();
    const updated = await Collection.findById(collection._id).populate('iconIds', 'title slug svgContent pngPreviewUrl');

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk download collection as ZIP
// @route   POST /api/collections/:id/bulk-download
// @access  Private
exports.bulkDownloadCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id).populate('iconIds');
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    if (!collection.iconIds.length) {
      return res.status(400).json({ success: false, message: 'Collection is empty' });
    }

    streamIconsZip(collection.iconIds, collection.name, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Generate Custom WebFont & SVG Sprite for collection
// @route   POST /api/collections/:id/webfont
// @access  Private
exports.generateWebFont = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id).populate('iconIds');
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    if (!collection.iconIds.length) {
      return res.status(400).json({ success: false, message: 'Collection is empty' });
    }

    generateWebFontBundle(collection.name, collection.iconIds, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Update collection custom bulk recolor palette
// @route   PUT /api/collections/:id/recolor
// @access  Private
exports.updateCollectionRecolor = async (req, res, next) => {
  try {
    const { customPalette } = req.body;
    const collection = await Collection.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { customPalette },
      { new: true }
    );
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });
    res.status(200).json({ success: true, data: collection });
  } catch (err) {
    next(err);
  }
};
