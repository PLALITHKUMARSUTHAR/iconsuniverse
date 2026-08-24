const { syncIconsFromGoogleDrive, scanDriveFolder } = require('../utils/googleDriveService');
const DriveSyncLog = require('../models/DriveSyncLog');

// @desc    Trigger Google Drive synchronization
// @route   POST /api/drive/sync
// @access  Private (Admin)
exports.triggerDriveSync = async (req, res, next) => {
  try {
    const folderId = req.body.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID || 'default_icons_folder';

    console.log(`[Google Drive Sync] Starting ingestion for folder: ${folderId}`);
    const result = await syncIconsFromGoogleDrive(folderId, req.user ? req.user.id : null);

    res.status(200).json({
      success: true,
      message: `Google Drive sync completed successfully. Ingested: ${result.ingested}, Updated: ${result.updated}`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Google Drive sync status & logs
// @route   GET /api/drive/status
// @access  Private (Admin)
exports.getDriveSyncStatus = async (req, res, next) => {
  try {
    const logs = await DriveSyncLog.find()
      .populate('triggeredBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const latest = logs[0] || null;

    res.status(200).json({
      success: true,
      data: {
        configuredFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || null,
        hasServiceAccount: !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY),
        lastSync: latest ? latest.createdAt : null,
        logs,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Preview Google Drive folder items without importing
// @route   GET /api/drive/preview
// @access  Private (Admin)
exports.previewDriveFolder = async (req, res, next) => {
  try {
    const folderId = req.query.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID || 'default_icons_folder';
    const result = await scanDriveFolder(folderId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
