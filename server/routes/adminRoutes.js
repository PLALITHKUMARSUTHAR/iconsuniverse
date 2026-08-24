const express = require('express');
const { getModerationQueue, moderateItem, getAnalytics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'editor'));

router.get('/moderation/queue', getModerationQueue);
router.put('/moderation/:type/:id', moderateItem);
router.get('/analytics', authorize('admin'), getAnalytics);

module.exports = router;
