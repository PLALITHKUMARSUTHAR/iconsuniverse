const axios = require('axios');
const { getGoogleDriveClient } = require('../config/googleDrive');
const { sanitizeSVG, extractColorsFromSVG, svgToDataUrl } = require('./svgSanitizer');
const Icon = require('../models/Icon');
const Category = require('../models/Category');
const DriveSyncLog = require('../models/DriveSyncLog');

/**
 * Scan a Google Drive folder and return file metadata.
 */
exports.scanDriveFolder = async (folderId) => {
  const drive = getGoogleDriveClient();

  if (!drive) {
    console.log('[Google Drive] No API client initialized. Returning mock drive structure.');
    return {
      success: true,
      mode: 'mock',
      files: [
        { id: 'mock_drive_file_1', name: 'shopping-cart-outline.svg', mimeType: 'image/svg+xml' },
        { id: 'mock_drive_file_2', name: 'credit-card-filled.svg', mimeType: 'image/svg+xml' },
        { id: 'mock_drive_file_3', name: 'cloud-sun-color.svg', mimeType: 'image/svg+xml' },
        { id: 'mock_drive_file_4', name: 'user-profile-gradient.svg', mimeType: 'image/svg+xml' },
      ],
    };
  }

  try {
    const query = `'${folderId}' in parents and trashed = false`;
    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, webContentLink, thumbnailLink, size, createdTime)',
      pageSize: 100,
    });

    return {
      success: true,
      mode: 'live',
      files: response.data.files || [],
    };
  } catch (error) {
    console.error('[Google Drive Scan Error]', error.message);
    throw new Error(`Failed to scan Google Drive folder: ${error.message}`);
  }
};

/**
 * Fetch the raw text content of an SVG file stored on Google Drive.
 */
exports.fetchDriveFileContent = async (fileId) => {
  const drive = getGoogleDriveClient();

  if (!drive) {
    // Generate a fallback SVG if no live Google Drive client
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg>`;
  }

  try {
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'text' }
    );
    return response.data;
  } catch (error) {
    console.error(`[Google Drive File Error] Failed to fetch file ${fileId}:`, error.message);
    return null;
  }
};

/**
 * Synchronize all SVG files in a designated Google Drive folder into the MongoDB database.
 */
exports.syncIconsFromGoogleDrive = async (folderId, adminUserId = null) => {
  const syncLog = new DriveSyncLog({
    folderId,
    status: 'running',
    totalFound: 0,
    iconsIngested: 0,
    iconsUpdated: 0,
    errors: [],
    triggeredBy: adminUserId,
  });
  await syncLog.save();

  try {
    const scanResult = await exports.scanDriveFolder(folderId);
    const files = scanResult.files.filter(f => f.mimeType === 'image/svg+xml' || f.name.toLowerCase().endsWith('.svg'));
    syncLog.totalFound = files.length;

    // Retrieve default category
    let defaultCategory = await Category.findOne({ slug: 'technology-devices' });
    if (!defaultCategory) {
      defaultCategory = await Category.findOne();
    }

    let ingestedCount = 0;
    let updatedCount = 0;

    for (const file of files) {
      try {
        const rawSvg = await exports.fetchDriveFileContent(file.id);
        if (!rawSvg) continue;

        const cleanSvg = sanitizeSVG(rawSvg);
        const colors = extractColorsFromSVG(cleanSvg);
        const dataUrl = svgToDataUrl(cleanSvg);

        // Derive title, slug, and style from filename
        const cleanName = file.name.replace(/\.svg$/i, '').replace(/[-_]+/g, ' ').trim();
        const baseTitle = cleanName
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        let detectedStyle = 'outline';
        if (/filled|solid/i.test(file.name)) detectedStyle = 'filled';
        else if (/color|lineal/i.test(file.name)) detectedStyle = 'color';
        else if (/flat/i.test(file.name)) detectedStyle = 'flat';
        else if (/gradient/i.test(file.name)) detectedStyle = 'gradient';
        else if (/hand|doodle/i.test(file.name)) detectedStyle = 'hand-drawn';
        else if (/3d|isometric/i.test(file.name)) detectedStyle = '3d';

        const baseSlug = file.name.replace(/\.svg$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const tags = cleanName.toLowerCase().split(' ').filter(t => t.length > 2);

        // Check if icon already synced by Google Drive File ID or Slug
        let existingIcon = await Icon.findOne({
          $or: [{ googleDriveFileId: file.id }, { slug: baseSlug }],
        });

        if (existingIcon) {
          existingIcon.svgContent = cleanSvg;
          existingIcon.svgUrl = dataUrl;
          existingIcon.pngPreviewUrl = dataUrl;
          existingIcon.colors = colors;
          existingIcon.googleDriveFileId = file.id;
          existingIcon.googleDriveFolderId = folderId;
          await existingIcon.save();
          updatedCount++;
        } else {
          await Icon.create({
            title: baseTitle,
            slug: `${baseSlug}-${Date.now().toString().slice(-4)}`,
            svgContent: cleanSvg,
            svgUrl: dataUrl,
            pngPreviewUrl: dataUrl,
            googleDriveFileId: file.id,
            googleDriveFolderId: folderId,
            tags,
            categoryId: defaultCategory ? defaultCategory._id : null,
            style: detectedStyle,
            colors,
            isPremium: false,
            contributorId: adminUserId || defaultCategory ? defaultCategory._id : null,
            status: 'approved',
          });
          ingestedCount++;
        }
      } catch (err) {
        syncLog.errors.push(`Error processing ${file.name}: ${err.message}`);
      }
    }

    syncLog.iconsIngested = ingestedCount;
    syncLog.iconsUpdated = updatedCount;
    syncLog.status = 'completed';
    await syncLog.save();

    return {
      success: true,
      syncLogId: syncLog._id,
      totalFound: files.length,
      ingested: ingestedCount,
      updated: updatedCount,
      errors: syncLog.errors,
    };
  } catch (error) {
    syncLog.status = 'failed';
    syncLog.errors.push(error.message);
    await syncLog.save();
    throw error;
  }
};
