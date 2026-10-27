const express = require('express')
const router = express.Router()
const { getTrends } = require('../controllers/reportController')
const { protect } = require('../middleware/authMiddleware')

// GET /api/trends/:testName  -> chronological values for one test
router.get('/:testName', protect, getTrends)

module.exports = router
