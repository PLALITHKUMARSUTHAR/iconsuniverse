const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  razorpaySubscriptionId: {
    type: String,
    required: true,
  },
  plan: {
    type: String,
    enum: ['pro_monthly', 'pro_annual'],
    required: true,
  },
  status: {
    type: String,
    enum: ['created', 'active', 'halted', 'cancelled', 'expired'],
    default: 'created',
  },
  currentPeriodEnd: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
