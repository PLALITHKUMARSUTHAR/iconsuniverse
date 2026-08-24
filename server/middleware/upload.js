const multer = require('multer');

// Memory storage to process SVG content directly in memory
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/svg+xml' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'application/zip' ||
    file.originalname.endsWith('.svg') ||
    file.originalname.endsWith('.png') ||
    file.originalname.endsWith('.zip')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only SVG, PNG, or ZIP files are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum file size
  },
  fileFilter,
});

module.exports = upload;
