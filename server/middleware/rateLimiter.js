const rateLimit = require('express-rate-limit');

/**
 * Standard authentication rate limiter (register, login, password changes)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts from this device. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Strict 4-digit PIN verification rate limiter.
 * Low-entropy credentials require strict request throttling to defend against brute force.
 * Max 5 attempts per 60 seconds per IP.
 */
const pinLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: {
    success: false,
    message: 'Too many PIN verification attempts. Please wait 1 minute before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { authLimiter, pinLimiter };
