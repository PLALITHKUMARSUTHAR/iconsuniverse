const express = require('express');
const {
  getCollections,
  getCollectionById,
  createCollection,
  toggleIconInCollection,
  bulkDownloadCollection,
  generateWebFont,
  updateCollectionRecolor,
} = require('../controllers/collectionController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getCollections);
router.post('/', protect, createCollection);
router.get('/:id', optionalAuth, getCollectionById);
router.post('/:id/icons', protect, toggleIconInCollection);
router.post('/:id/bulk-download', protect, bulkDownloadCollection);
router.post('/:id/webfont', protect, generateWebFont);
router.put('/:id/recolor', protect, updateCollectionRecolor);

module.exports = router;
