/**
 * User Profile Routes
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, authController.getMe);
router.put('/', protect, authController.updateProfile);
router.put('/password', protect, authController.changePassword);

module.exports = router;

