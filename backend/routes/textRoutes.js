/**
 * Text Analyzer Routes
 */
const express = require('express');
const router = express.Router();
const textController = require('../controllers/textController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { uploadTextDoc } = require('../middleware/uploadMiddleware');
const { analysisLimiter } = require('../middleware/rateLimitMiddleware');

router.post(
  '/analyze',
  optionalAuth,
  analysisLimiter,
  uploadTextDoc.single('file'),
  textController.analyzeText
);

module.exports = router;

