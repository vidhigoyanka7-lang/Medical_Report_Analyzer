const express = require('express');
const router = express.Router();
const { generateSummary, askQuestion } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary/:reportId', protect, generateSummary);
router.post('/ask', protect, askQuestion);

module.exports = router;
