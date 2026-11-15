/**
 * General AI Assistant Routes
 */
const express = require('express');
const router = express.Router();
const generalController = require('../controllers/generalController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { analysisLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/chat', optionalAuth, analysisLimiter, generalController.handleChat);

module.exports = router;

