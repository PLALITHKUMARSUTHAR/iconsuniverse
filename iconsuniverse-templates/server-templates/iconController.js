const Icon = require('../models/Icon');

// @desc    List/search icons with filters
// @route   GET /api/icons
// @access  Public
exports.getIcons = async (req, res, next) => {
  try {
    const { q, category, style, page = 1, limit = 40 } = req.query;
    const filter = { status: 'approved' };
    if (category) filter.categoryId = category;
    if (style) filter.style = style;
    if (q) filter.$text = { $search: q };

    const icons = await Icon.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('title slug pngPreviewUrl isPremium style');

    const total = await Icon.countDocuments(filter);

    res.status(200).json({ success: true, data: { icons, total, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single icon by slug, with related icons
// @route   GET /api/icons/:slug
// @access  Public
exports.getIconBySlug = async (req, res, next) => {
  try {
    const icon = await Icon.findOne({ slug: req.params.slug, status: 'approved' })
      .populate('categoryId', 'name slug')
      .populate('packId', 'title slug');
    if (!icon) return res.status(404).json({ success: false, message: 'Icon not found' });

    const related = await Icon.find({
      categoryId: icon.categoryId,
      _id: { $ne: icon._id },
      status: 'approved',
    }).limit(12).select('title slug pngPreviewUrl isPremium');

    res.status(200).json({ success: true, data: { icon, related } });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload a new icon (pending review)
// @route   POST /api/icons
// @access  Private (contributor, editor, admin)
exports.createIcon = async (req, res, next) => {
  try {
    const icon = await Icon.create({
      ...req.body,
      contributorId: req.user.id,
      status: 'pending',
    });
    res.status(201).json({ success: true, data: icon });
  } catch (err) {
    next(err);
  }
};

// @desc    Update an icon's metadata
// @route   PUT /api/icons/:id
// @access  Private (owner contributor, editor, admin)
exports.updateIcon = async (req, res, next) => {
  try {
    const icon = await Icon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!icon) return res.status(404).json({ success: false, message: 'Icon not found' });
    res.status(200).json({ success: true, data: icon });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an icon
// @route   DELETE /api/icons/:id
// @access  Private (owner contributor, editor, admin)
exports.deleteIcon = async (req, res, next) => {
  try {
    const icon = await Icon.findByIdAndDelete(req.params.id);
    if (!icon) return res.status(404).json({ success: false, message: 'Icon not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
