/**
 * Analysis Routes (Aliases and direct endpoints for ResumeIQ specifications)
 */
const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const historyController = require('../controllers/historyController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { analysisLimiter } = require('../middleware/rateLimitMiddleware');

// POST /api/analysis -> maps to analyzeResume
router.post('/', optionalAuth, analysisLimiter, resumeController.analyzeResume);

// GET /api/analysis/history -> maps to getHistory
router.get('/history', protect, historyController.getHistory);

// GET /api/analysis/:id -> maps to getHistoryItem
router.get('/:id', protect, historyController.getHistoryItem);

// GET /api/analysis/:id/report -> maps to getResumeReport
router.get('/:id/report', optionalAuth, resumeController.getResumeReport);

// DELETE /api/analysis/:id -> maps to deleteHistoryItem
router.delete('/:id', protect, historyController.deleteHistoryItem);

module.exports = router;

