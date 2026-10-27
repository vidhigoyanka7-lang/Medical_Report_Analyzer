const jwt = require('jsonwebtoken')
const { pool } = require('../config/db')
const logger = require('../utils/logger')

// Protects a route: reads "Authorization: Bearer <token>", verifies it, and
// puts the user on req.user. Controllers must use req.user, not ids from the request body.
const protect = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }

  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET)
    const [users] = await pool.query(
      'SELECT user_id, full_name, email FROM users WHERE user_id = ?',
      [decoded.userId]
    )
    if (users.length === 0) return res.status(401).json({ message: 'Not authorized, user not found' })

    req.user = { userId: users[0].user_id, name: users[0].full_name, email: users[0].email }
    next()
  } catch (error) {
    // Bad/expired token is a normal 401; a database failure is a real 500.
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Not authorized, token failed' })
    }
    logger.error('AUTH', 'Auth middleware error:', error)
    res.status(500).json({ message: 'Server error during authentication' })
  }
}

module.exports = { protect }
