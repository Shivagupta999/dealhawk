const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, 
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.'
  }
});

const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5,
  message: {
    success: false,
    error: 'Too many OTP requests, please try again later.'
  }
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 30, 
  message: {
    success: false,
    error: 'Too many search requests, please slow down.'
  }
});


const dataLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    error: 'Too many requests, please try again.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  otpLimiter,
  searchLimiter,
  dataLimiter
};