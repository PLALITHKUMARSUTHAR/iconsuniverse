const express = require('express');
const {
  getIcons,
  getIconBySlug,
  downloadIcon,
  createIcon,
  updateIcon,
  deleteIcon,
} = require('../controllers/iconController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getIcons);
router.get('/:slug', getIconBySlug);
router.get('/:id/download', optionalAuth, downloadIcon);
router.post('/', protect, authorize('contributor', 'editor', 'admin'), upload.single('svgFile'), createIcon);
router.put('/:id', protect, authorize('contributor', 'editor', 'admin'), updateIcon);
router.delete('/:id', protect, authorize('contributor', 'editor', 'admin'), deleteIcon);

module.exports = router;
