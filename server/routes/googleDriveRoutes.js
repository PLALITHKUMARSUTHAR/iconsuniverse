const express = require('express');
const { triggerDriveSync, getDriveSyncStatus, previewDriveFolder } = require('../controllers/googleDriveController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.post('/sync', triggerDriveSync);
router.get('/status', getDriveSyncStatus);
router.get('/preview', previewDriveFolder);

module.exports = router;
