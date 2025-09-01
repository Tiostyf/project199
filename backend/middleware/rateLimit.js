const rateLimit = require('express-rate-limit');

// General rate limiting for all requests
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_LIMIT_MAX_ATTEMPTS) || 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Slower rate limiting after initial auth attempts
const authSpeedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many authentication requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for appointment creation
const appointmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.APPOINTMENT_LIMIT_MAX_REQUESTS) || 3, // limit each IP to 3 appointment requests per hour
  message: 'Too many appointment requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for post creation
const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 post creations per hour
  message: 'Too many posts created, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  authSpeedLimiter,
  appointmentLimiter,
  postLimiter
};