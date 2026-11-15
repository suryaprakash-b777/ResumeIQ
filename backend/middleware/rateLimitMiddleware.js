/**
 * Rate Limiting Middleware
 */
const rateLimit = require('express-rate-limit');

// General API Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
    errors: ['Rate limit exceeded']
  }
});

// Stricter rate limiter for uploads and AI analysis endpoints
const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Limit each IP to 60 analysis calls per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Analysis quota reached for this window. Please wait a few moments before trying again.',
    errors: ['Analysis rate limit reached']
  }
});

// Auth endpoints limiter (prevents brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login or registration attempts. Please try again in 15 minutes.',
    errors: ['Auth rate limit reached']
  }
});

module.exports = {
  generalLimiter,
  analysisLimiter,
  authLimiter
};

