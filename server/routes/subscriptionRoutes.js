const express = require('express');
const { createOrder, verifyPayment, cancelSubscription } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/cancel', protect, cancelSubscription);

module.exports = router;
