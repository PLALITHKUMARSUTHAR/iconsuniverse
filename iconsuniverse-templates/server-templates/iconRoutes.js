const express = require('express');
const router = express.Router();
const {
  getIcons,
  getIconBySlug,
  createIcon,
  updateIcon,
  deleteIcon,
} = require('../controllers/iconController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getIcons)
  .post(protect, authorize('contributor', 'editor', 'admin'), createIcon);

router.route('/:slug')
  .get(getIconBySlug);

router.route('/:id')
  .put(protect, authorize('contributor', 'editor', 'admin'), updateIcon)
  .delete(protect, authorize('contributor', 'editor', 'admin'), deleteIcon);

module.exports = router;
