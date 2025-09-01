const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// General rate limiter for all requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Auth-specific rate limiter (stricter limits)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts, please try again after 15 minutes'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Speed limiter for auth routes (slows down responses after first request)
const authSpeedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 2, // allow 2 requests at full speed
  delayMs: 500, // begin adding 500ms of delay per request above delayAfter
  maxDelayMs: 20000, // maximum delay of 20 seconds
});

// Rate limiter for appointment submissions
const appointmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 appointment requests per hour
  message: {
    error: 'Too many appointment requests, please try again after an hour'
  },
});

// Rate limiter for post creation
const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 post creations per hour
  message: {
    error: 'Too many posts created, please try again after an hour'
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  authSpeedLimiter,
  appointmentLimiter,
  postLimiter
};