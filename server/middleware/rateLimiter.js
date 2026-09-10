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

// Anti-bot rapid download burst limiter: blocks parallel downloads and scraping scripts (max 5 requests per 10s)
exports.downloadBurstLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 5,
  message: {
    success: false,
    message: 'Too many rapid download requests. Anti-bot protection enabled. Please slow down.',
    isBotBlocked: true,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Download rate limiter per IP: max 100 downloads per 24 hours
exports.downloadLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 100,
  message: {
    success: false,
    message: 'Daily download quota of 100 icons reached. Please try again tomorrow.',
    isLimitReached: true,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
