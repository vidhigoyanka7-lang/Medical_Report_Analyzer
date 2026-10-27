const express = require('express')
const router = express.Router()
const { getHealth, testDatabase } = require('../controllers/healthController')

/**
 * Health check routes.
 *
 * GET /api/health    — API status
 * GET /api/health/db — MySQL connection test
 */
router.get('/', getHealth)
router.get('/db', testDatabase)

module.exports = router
