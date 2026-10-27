const { pool } = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { isValidEmail, isValidPassword } = require('../utils/validation')
const logger = require('../utils/logger')

// JWT_SECRET is checked at server start (server.js), so it is always set here.
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })

// POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const name = (req.body.name || '').trim()
    const email = (req.body.email || '').trim().toLowerCase()
    const password = req.body.password

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' })
    }
    if (!isValidEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address' })
    if (!isValidPassword(password)) return res.status(400).json({ message: 'Password must be at least 8 characters' })

    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email])
    if (existing.length > 0) return res.status(400).json({ message: 'User already exists' })

    // bcrypt hashes the password; the plain password is never stored
    const passwordHash = await bcrypt.hash(password, 10)
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    )

    logger.info('AUTH', `New user registered (id ${result.insertId})`)
    res.status(201).json({
      success: true,
      user: { id: result.insertId, name, email },
      token: generateToken(result.insertId),
    })
  } catch (error) {
    logger.error('AUTH', 'Registration error:', error)
    res.status(500).json({ message: 'Server error during registration' })
  }
}

// POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase()
    const password = req.body.password
    if (!email || !password) return res.status(400).json({ message: 'Please provide email and password' })

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    // Same message for "no such user" and "wrong password" so emails cannot be probed.
    if (users.length === 0 || !(await bcrypt.compare(password, users[0].password_hash))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const user = users[0]
    logger.info('AUTH', `Login successful (id ${user.user_id})`)
    res.json({
      success: true,
      user: { id: user.user_id, name: user.full_name, email: user.email },
      token: generateToken(user.user_id),
    })
  } catch (error) {
    logger.error('AUTH', 'Login error:', error)
    res.status(500).json({ message: 'Server error during login' })
  }
}

module.exports = { registerUser, loginUser }
