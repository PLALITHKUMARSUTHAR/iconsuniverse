const Icon = require('../models/Icon');
const Pack = require('../models/Pack');
const User = require('../models/User');
const Download = require('../models/Download');
const Subscription = require('../models/Subscription');

// @desc    Get moderation queue of pending icons and packs
// @route   GET /api/admin/moderation/queue
// @access  Private (Admin / Editor)
exports.getModerationQueue = async (req, res, next) => {
  try {
    const [pendingIcons, pendingPacks] = await Promise.all([
      Icon.find({ status: 'pending' })
        .populate('categoryId', 'name')
        .populate('contributorId', 'name email avatarUrl')
        .sort({ createdAt: -1 }),
      Pack.find({ status: 'pending' })
        .populate('categoryId', 'name')
        .populate('contributorId', 'name email avatarUrl')
        .sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        icons: pendingIcons,
        packs: pendingPacks,
        totalPending: pendingIcons.length + pendingPacks.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or reject a submission
// @route   PUT /api/admin/moderation/:type/:id
// @access  Private (Admin / Editor)
exports.moderateItem = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { status, feedback } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'approved' or 'rejected'" });
    }

    let updatedItem;
    if (type === 'icon') {
      updatedItem = await Icon.findByIdAndUpdate(id, { status }, { new: true });
    } else if (type === 'pack') {
      updatedItem = await Pack.findByIdAndUpdate(id, { status }, { new: true });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid item type' });
    }

    if (!updatedItem) return res.status(404).json({ success: false, message: 'Item not found' });

    res.status(200).json({ success: true, data: updatedItem });
  } catch (err) {
    next(err);
  }
};

// @desc    Get overall admin analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, totalIcons, totalPacks, totalDownloads, activeSubscriptions, topIcons] = await Promise.all([
      User.countDocuments(),
      Icon.countDocuments({ status: { $ne: 'rejected' } }),
      Pack.countDocuments({ status: 'approved' }),
      Download.countDocuments(),
      Subscription.countDocuments({ status: 'active' }),
      Icon.find({ status: { $ne: 'rejected' } }).sort({ downloadCount: -1 }).limit(8).select('title slug path downloadCount isPremium'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalIcons,
        totalPacks,
        totalDownloads,
        activeSubscriptions,
        estimatedRevenueINR: activeSubscriptions * 99,
        topIcons,
      },
    });
  } catch (err) {
    next(err);
  }
};
