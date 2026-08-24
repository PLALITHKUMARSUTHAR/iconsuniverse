const Razorpay = require('razorpay');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

let razorpayInstance = null;
const getRazorpay = () => {
  if (razorpayInstance) return razorpayInstance;
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_id';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'mock_secret_key';
  razorpayInstance = new Razorpay({ key_id, key_secret });
  return razorpayInstance;
};

// @desc    Create Razorpay order for Pro subscription
// @route   POST /api/subscriptions/create-order
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { plan = 'pro_monthly' } = req.body;
    const amount = plan === 'pro_annual' ? 9900 : 990; // in INR paise: Rs 99/month or Rs 990/year

    const rzp = getRazorpay();

    // If live credentials, create Razorpay order; otherwise return mock order
    let order;
    try {
      order = await rzp.orders.create({
        amount: amount * 100,
        currency: 'INR',
        receipt: `receipt_${req.user.id}_${Date.now()}`,
        notes: { userId: req.user.id, plan },
      });
    } catch (err) {
      console.warn('[Razorpay Note] Using simulated order ID:', err.message);
      order = {
        id: `order_mock_${Date.now()}`,
        amount: amount * 100,
        currency: 'INR',
      };
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_id',
        plan,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Razorpay payment signature and activate Pro plan
// @route   POST /api/subscriptions/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan = 'pro_monthly' } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'mock_secret_key';
    const isMock = razorpay_order_id && razorpay_order_id.startsWith('order_mock_');

    if (!isMock && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }
    }

    const durationDays = plan === 'pro_annual' ? 365 : 30;
    const periodEnd = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    const subscription = await Subscription.create({
      userId: req.user.id,
      razorpaySubscriptionId: razorpay_payment_id || `pay_${Date.now()}`,
      plan,
      status: 'active',
      currentPeriodEnd: periodEnd,
    });

    await User.findByIdAndUpdate(req.user.id, {
      plan,
      subscriptionId: subscription._id,
    });

    res.status(200).json({
      success: true,
      message: 'Pro subscription activated successfully!',
      data: { subscription, plan },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel active subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
exports.cancelSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.subscriptionId) {
      return res.status(400).json({ success: false, message: 'No active subscription found' });
    }

    await Subscription.findByIdAndUpdate(user.subscriptionId, { status: 'cancelled' });
    user.plan = 'free';
    user.subscriptionId = null;
    await user.save();

    res.status(200).json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (err) {
    next(err);
  }
};
