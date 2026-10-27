const { pool } = require('../config/db')

/**
 * healthController.js — Handlers for health-check and DB-test routes.
 */

/**
 * GET /api/health
 * Returns a simple JSON response to confirm the API is running.
 */
const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Medical Report Analyzer API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
}

/**
 * GET /api/health/db
 * Tests the MySQL connection by running a lightweight query.
 * Returns connection status and current MySQL timestamp.
 */
const testDatabase = async (req, res) => {
  try {
    // Run a cheap query that just returns the MySQL server time
    const [rows] = await pool.query('SELECT NOW() AS serverTime')

    res.status(200).json({
      success: true,
      message: 'MySQL database connection is working',
      database: process.env.DB_NAME,
      serverTime: rows[0].serverTime,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'MySQL database connection failed',
    })
  }
}

module.exports = { getHealth, testDatabase }
