/**
 * Code Analyzer Routes
 */
const express = require('express');
const router = express.Router();
const codeController = require('../controllers/codeController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { uploadCode } = require('../middleware/uploadMiddleware');
const { analysisLimiter } = require('../middleware/rateLimitMiddleware');

router.post(
  '/analyze',
  optionalAuth,
  analysisLimiter,
  uploadCode.single('file'),
  codeController.analyzeCode
);

module.exports = router;

