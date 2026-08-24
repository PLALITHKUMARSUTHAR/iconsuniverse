const rateLimit = require('express-rate-limit');

// General API limiter: 300 requests per 15 minutes
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints limiter (login/signup): 20 requests per 15 minutes
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many login/signup attempts. Please wait 15 minutes before retrying.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Download rate limiter for free/anonymous users: 20 downloads per day per IP
exports.downloadLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 50,
  message: {
    success: false,
    message: 'Daily free download limit reached. Upgrade to Pro for unlimited downloads!',
    isLimitReached: true,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
