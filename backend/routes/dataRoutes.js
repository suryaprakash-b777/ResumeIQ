/**
 * Data Analyzer Routes
 */
const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { uploadData } = require('../middleware/uploadMiddleware');
const { analysisLimiter } = require('../middleware/rateLimitMiddleware');

router.post(
  '/analyze',
  optionalAuth,
  analysisLimiter,
  uploadData.single('file'),
  dataController.analyzeData
);

module.exports = router;

