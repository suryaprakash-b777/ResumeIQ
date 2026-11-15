/**
 * Auth Routes
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../utils/validators');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/register', authLimiter, validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.get('/me', protect, authController.getMe);
router.post('/logout', authController.logout);
router.put('/profile', protect, authController.updateProfile);
router.put('/profile/password', protect, authController.changePassword);

module.exports = router;

