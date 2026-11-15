/**
 * Image Analyzer Routes
 */
const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware');
const { analysisLimiter } = require('../middleware/rateLimitMiddleware');

router.post(
  '/analyze',
  optionalAuth,
  analysisLimiter,
  uploadImage.single('image'),
  imageController.analyzeImage
);

module.exports = router;

