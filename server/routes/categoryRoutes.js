const express = require('express');
const { getCategories, getCategoryBySlug, createCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', protect, authorize('admin', 'editor'), createCategory);

module.exports = router;
