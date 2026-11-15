/**
 * Request validation utilities using express-validator
 */
const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters'),
  body('email').trim().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }
    next();
  }
];

const validateLogin = [
  body('email').trim().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }
    next();
  }
];

module.exports = {
  validateRegister,
  validateLogin
};

