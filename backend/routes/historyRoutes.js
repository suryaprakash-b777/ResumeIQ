/**
 * History Routes
 */
const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, historyController.getHistory);
router.get('/:id', protect, historyController.getHistoryItem);
router.delete('/:id', protect, historyController.deleteHistoryItem);

module.exports = router;

