const express = require('express');
const { getPacks, getPackBySlug, downloadPack, createPack } = require('../controllers/packController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getPacks);
router.get('/:slug', getPackBySlug);
router.get('/:id/download', optionalAuth, downloadPack);
router.post('/', protect, authorize('contributor', 'editor', 'admin'), createPack);

module.exports = router;
