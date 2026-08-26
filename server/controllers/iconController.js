const Icon = require('../models/Icon');
const Category = require('../models/Category');
const Pack = require('../models/Pack');
const Download = require('../models/Download');
const User = require('../models/User');
const { sanitizeSVG, extractColorsFromSVG, svgToDataUrl } = require('../utils/svgSanitizer');

// @desc    List/search icons with multi-facet filters
// @route   GET /api/icons
// @access  Public
exports.getIcons = async (req, res, next) => {
  try {
    const { q, category, style, colorType, color, isPremium, sort = 'trending', page = 1, limit = 40 } = req.query;
    const filter = { status: { $ne: 'rejected' } };

    // Text search (title, slug, tags)
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { title: searchRegex },
        { slug: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    // Category filter
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.categoryId = category;
      } else {
        const cleanCatSlug = category.toLowerCase().trim();
        const cat = await Category.findOne({
          $or: [
            { slug: cleanCatSlug },
            { name: new RegExp(`^${cleanCatSlug.replace(/-/g, ' ')}$`, 'i') },
          ]
        });
        if (cat) {
          filter.categoryId = cat._id;
        } else {
          return res.status(200).json({
            success: true,
            data: {
              icons: [],
              total: 0,
              page: parseInt(page, 10) || 1,
              totalPages: 0,
            },
          });
        }
      }
    }

    // Shape / Style filter
    const isStrict = req.query.strict === 'true';
    if (style && style !== 'all') {
      if (isStrict) {
        if (style === 'filled') {
          filter.$or = [{ style: 'filled' }, { isFilled: true }];
        } else if (style === 'outline') {
          filter.style = 'outline';
        } else if (style === 'color' || style === 'flat') {
          filter.style = { $in: ['color', 'flat', '3d', 'gradient'] };
        } else if (style === 'gradient') {
          filter.style = 'gradient';
        } else if (style === '3d') {
          filter.style = '3d';
        } else {
          filter.style = style;
        }
      }
    }

    // Color Type filter (all | black | gradient | colors)
    if (colorType && colorType !== 'all') {
      if (colorType === 'black') {
        filter.style = { $in: ['outline', 'filled'] };
      } else if (colorType === 'gradient') {
        filter.style = 'gradient';
      } else if (colorType === 'colors') {
        filter.style = { $in: ['color', 'flat', '3d'] };
      }
    }

    // Premium filter
    if (isPremium !== undefined && isPremium !== '') {
      filter.isPremium = isPremium === 'true' || isPremium === true;
    }

    // Color filter
    if (color) {
      filter.colors = { $in: [color.toLowerCase()] };
    }

    // Sorting: prioritize selected style first, then downloadCount, then deterministic _id
    let sortQuery = { isFilled: -1, downloadCount: -1, _id: 1 };
    if (style === 'outline') {
      sortQuery = { isFilled: 1, downloadCount: -1, _id: 1 };
    } else if (style === 'color') {
      sortQuery = { style: 1, isFilled: 1, downloadCount: -1, _id: 1 };
    } else if (style === 'filled') {
      sortQuery = { isFilled: -1, downloadCount: -1, _id: 1 };
    } else if (sort === 'recent') {
      sortQuery = { isFilled: -1, _id: -1 };
    } else if (sort === 'downloads') {
      sortQuery = { downloadCount: -1, isFilled: -1, _id: 1 };
    } else if (sort === 'title') {
      sortQuery = { title: 1, _id: 1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 40, 100);
    const skip = (pageNum - 1) * limitNum;

    const [icons, total] = await Promise.all([
      Icon.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .populate('categoryId', 'name slug')
        .populate('packId', 'title slug')
        .select('title slug path isFilled isPremium style tags downloadCount colors categoryId packId'),
      Icon.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        icons,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single icon by slug
// @route   GET /api/icons/:slug
// @access  Public
exports.getIconBySlug = async (req, res, next) => {
  try {
    const icon = await Icon.findOne({ slug: req.params.slug, status: { $ne: 'rejected' } })
      .populate('categoryId', 'name slug iconThumbnailUrl')
      .populate('packId', 'title slug description coverImageUrl iconCount isPremium')
      .populate('contributorId', 'name avatarUrl');

    if (!icon) {
      return res.status(404).json({ success: false, message: 'Icon not found' });
    }

    // Related icons in same category
    const related = await Icon.find({
      categoryId: icon.categoryId,
      _id: { $ne: icon._id },
      status: { $ne: 'rejected' },
    })
      .limit(12)
      .select('title slug path isPremium style');

    res.status(200).json({
      success: true,
      data: { icon, related },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Download an icon in SVG / PNG / EPS / Base64 format
// @route   GET /api/icons/:id/download
// @access  Public (rate-limited for free users)
exports.downloadIcon = async (req, res, next) => {
  try {
    const { format = 'svg', size = 512 } = req.query;
    const icon = await Icon.findById(req.params.id);

    if (!icon) {
      return res.status(404).json({ success: false, message: 'Icon not found' });
    }

    const user = req.user;
    const isPro = user && (user.plan === 'pro_monthly' || user.plan === 'pro_annual');

    // Premium asset check
    if (icon.isPremium && !isPro) {
      return res.status(403).json({
        success: false,
        message: 'This is a Pro asset. Upgrade your subscription to unlock unlimited access.',
        isPremiumLocked: true,
      });
    }

    // Daily limit check for non-Pro users
    if (user && !isPro) {
      if (user.downloadCountToday >= 20) {
        return res.status(403).json({
          success: false,
          message: 'Daily download quota of 20 icons reached. Upgrade to Pro for unlimited downloads!',
          isLimitReached: true,
        });
      }
      user.downloadCountToday += 1;
      await user.save();
    }

    // Increment denormalized counter & create download log
    icon.downloadCount += 1;
    await icon.save();

    await Download.create({
      userId: user ? user._id : null,
      iconId: icon._id,
      format,
      resolution: format === 'png' ? parseInt(size, 10) : null,
      ipAddress: req.ip,
    });

    const filename = `${icon.slug || 'icon'}.${format === 'base64' ? 'json' : format}`;

    let svgData = icon.svgContent;
    if (!svgData && icon.svgUrl) {
      try {
        const fetchRes = await fetch(icon.svgUrl);
        if (fetchRes.ok) {
          svgData = await fetchRes.text();
        }
      } catch (e) {}
    }

    if (format === 'base64') {
      const dataUri = svgData ? svgToDataUrl(svgData) : '';
      return res.status(200).json({
        success: true,
        data: {
          title: icon.title,
          format: 'base64',
          dataUri,
          svgContent: svgData,
        },
      });
    }

    if (format === 'svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(svgData || '');
    }

    // Fallback: return SVG
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(svgData || '');
  } catch (err) {
    next(err);
  }
};

// @desc    Upload / create a new icon
// @route   POST /api/icons
// @access  Private (Contributor / Admin)
exports.createIcon = async (req, res, next) => {
  try {
    const { title, categoryId, style, tags, packId, isPremium, svgContent } = req.body;

    let cleanSvg = svgContent;
    if (req.file) {
      cleanSvg = req.file.buffer.toString('utf8');
    }

    if (!cleanSvg || !title || !categoryId) {
      return res.status(400).json({ success: false, message: 'Please provide SVG file/content, title, and category' });
    }

    const sanitized = sanitizeSVG(cleanSvg);
    const colors = extractColorsFromSVG(sanitized);
    const dataUrl = svgToDataUrl(sanitized);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

    const parsedTags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim().toLowerCase()) : []);

    const icon = await Icon.create({
      title,
      slug,
      svgContent: sanitized,
      svgUrl: dataUrl,
      pngPreviewUrl: dataUrl,
      tags: parsedTags,
      categoryId,
      packId: packId || null,
      style: style || 'outline',
      colors,
      isPremium: isPremium === true || isPremium === 'true',
      contributorId: req.user.id,
      status: req.user.role === 'admin' ? 'approved' : 'pending',
    });

    res.status(201).json({ success: true, data: icon });
  } catch (err) {
    next(err);
  }
};

// @desc    Update icon
// @route   PUT /api/icons/:id
// @access  Private (Owner / Admin)
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

// @desc    Delete icon
// @route   DELETE /api/icons/:id
// @access  Private (Owner / Admin)
exports.deleteIcon = async (req, res, next) => {
  try {
    const icon = await Icon.findByIdAndDelete(req.params.id);
    if (!icon) return res.status(404).json({ success: false, message: 'Icon not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
