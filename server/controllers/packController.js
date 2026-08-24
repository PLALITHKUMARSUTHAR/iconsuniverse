const Pack = require('../models/Pack');
const Icon = require('../models/Icon');
const { streamIconsZip } = require('../utils/zipBuilder');

// @desc    List packs
// @route   GET /api/packs
// @access  Public
exports.getPacks = async (req, res, next) => {
  try {
    const { q, category, page = 1, limit = 20 } = req.query;
    const filter = { status: 'approved' };

    if (category) filter.categoryId = category;
    if (q) filter.title = { $regex: q, $options: 'i' };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    const [packs, total] = await Promise.all([
      Pack.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('categoryId', 'name slug')
        .populate('contributorId', 'name avatarUrl'),
      Pack.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: { packs, total, page: pageNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get pack by slug with all its icons
// @route   GET /api/packs/:slug
// @access  Public
exports.getPackBySlug = async (req, res, next) => {
  try {
    const pack = await Pack.findOne({ slug: req.params.slug, status: 'approved' })
      .populate('categoryId', 'name slug')
      .populate('contributorId', 'name avatarUrl');

    if (!pack) {
      return res.status(404).json({ success: false, message: 'Icon pack not found' });
    }

    const icons = await Icon.find({ packId: pack._id, status: 'approved' })
      .select('title slug svgContent pngPreviewUrl isPremium style tags');

    res.status(200).json({
      success: true,
      data: { pack, icons },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Download full pack as a ZIP archive
// @route   GET /api/packs/:id/download
// @access  Public / Pro Protected
exports.downloadPack = async (req, res, next) => {
  try {
    const pack = await Pack.findById(req.params.id);
    if (!pack) {
      return res.status(404).json({ success: false, message: 'Pack not found' });
    }

    const isPro = req.user && (req.user.plan === 'pro_monthly' || req.user.plan === 'pro_annual');
    if (pack.isPremium && !isPro) {
      return res.status(403).json({
        success: false,
        message: 'This pack requires an active Pro subscription to download.',
        isPremiumLocked: true,
      });
    }

    const icons = await Icon.find({ packId: pack._id, status: 'approved' });
    if (!icons.length) {
      return res.status(400).json({ success: false, message: 'This pack contains no icons yet' });
    }

    streamIconsZip(icons, pack.slug, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Create new pack
// @route   POST /api/packs
// @access  Private (Contributor / Admin)
exports.createPack = async (req, res, next) => {
  try {
    const { title, description, categoryId, coverImageUrl, isPremium } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

    const pack = await Pack.create({
      title,
      slug,
      description,
      categoryId,
      coverImageUrl: coverImageUrl || 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=600&q=80',
      isPremium: isPremium === true || isPremium === 'true',
      contributorId: req.user.id,
      status: req.user.role === 'admin' ? 'approved' : 'pending',
    });

    res.status(201).json({ success: true, data: pack });
  } catch (err) {
    next(err);
  }
};
