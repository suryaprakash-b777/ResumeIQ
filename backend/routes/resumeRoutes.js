/**
 * Resume Routes
 */
const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { uploadResume } = require('../middleware/uploadMiddleware');
const { analysisLimiter } = require('../middleware/rateLimitMiddleware');

// Upload resume: authenticated or guest preview
router.post('/upload', optionalAuth, analysisLimiter, uploadResume.single('resume'), resumeController.uploadResume);

// Full analysis
router.post('/analyze', optionalAuth, analysisLimiter, resumeController.analyzeResume);

// List user resumes
router.get('/', protect, resumeController.getUserResumes);

// Get specific resume & analyses
router.get('/:id', optionalAuth, resumeController.getResumeById);

// Get structured report data for PDF export
router.get('/:id/report', optionalAuth, resumeController.getResumeReport);

// Delete resume
router.delete('/:id', protect, resumeController.deleteResume);

module.exports = router;

