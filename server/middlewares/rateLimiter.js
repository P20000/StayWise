const rateLimit = require('express-rate-limit');

// General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // limit each IP to 150 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '[RATE_LIMIT] Too many requests from this IP cluster. Please try again after 15 minutes.',
  },
});

// Auth Sensitive Endpoint Limiter (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '[AUTH_THROTTLE] Excessive authentication attempts detected. Access temporarily suspended.',
  },
});

module.exports = { apiLimiter, authLimiter };
