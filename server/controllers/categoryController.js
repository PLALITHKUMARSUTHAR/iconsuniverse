const Category = require('../models/Category');
const Icon = require('../models/Icon');

// @desc    Get all categories with icon counts
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: { categories } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get category by slug with preview icons
// @route   GET /api/categories/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const icons = await Icon.find({ categoryId: category._id, status: { $ne: 'rejected' } })
      .limit(20)
      .select('title slug path isPremium style');

    res.status(200).json({ success: true, data: { category, icons } });
  } catch (err) {
    next(err);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, parentCategoryId, iconThumbnailUrl } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const category = await Category.create({
      name,
      slug,
      parentCategoryId: parentCategoryId || null,
      iconThumbnailUrl: iconThumbnailUrl || null,
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};
