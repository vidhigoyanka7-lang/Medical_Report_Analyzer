// Load environment variables FIRST — before anything else
require('dotenv').config()

const express = require('express')
const cors    = require('cors')

const { testConnection }           = require('./config/db')
const healthRoutes                 = require('./routes/healthRoutes')
const { notFound, errorHandler }   = require('./middleware/errorMiddleware')

const authRoutes                   = require('./routes/authRoutes')
const dashboardRoutes              = require('./routes/dashboardRoutes')
const reportRoutes                 = require('./routes/reportRoutes')
const aiRoutes                     = require('./routes/aiRoutes')
const profileRoutes                = require('./routes/profileRoutes')
const helmet                       = require('helmet')
const rateLimit                    = require('express-rate-limit')
const trendRoutes                  = require('./routes/trendRoutes')
const logger                       = require('./utils/logger')

// ── Create Express application ─────────────────────────────────────────────
const app  = express()
const PORT = process.env.PORT || 5000

// ── CORS configuration ─────────────────────────────────────────────────────
// Allow requests from the React frontend (port 3000 in development)
// Extra allowed origins (for deployment) can be listed in .env: CORS_ORIGINS=https://a.com,https://b.com
const extraOrigins = (process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean)
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', // Vite default port
    ...extraOrigins,
  ],
  credentials: true, // Allow cookies / Authorization headers
  optionsSuccessStatus: 200,
}
app.use(helmet())            // safe default security headers
app.use(cors(corsOptions))

// Slow down password guessing and general abuse (per IP).
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { message: 'Too many attempts, please try again later' } })
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 300 })
app.use('/api', apiLimiter)
app.use('/api/auth', authLimiter)

// ── Body parsers ───────────────────────────────────────────────────────────
app.use(express.json())                        // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })) // Parse form data

// NOTE: uploads/ is intentionally NOT served statically. Medical files must only
// be reachable through authenticated, ownership-checked routes.

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/trends', trendRoutes)
app.use('/api/profile', profileRoutes)

// More routes will be added here in later phases:
// app.use('/api/chat',    chatRoutes)

// ── 404 handler (must come after all routes) ────────────────────────────────
app.use(notFound)

// ── Global error handler (must be last) ────────────────────────────────────
app.use(errorHandler)

// ── Start server ───────────────────────────────────────────────────────────
const startServer = async () => {
  // Tokens cannot be signed safely without a secret, so refuse to start.
  if (!process.env.JWT_SECRET) {
    logger.error('AUTH', 'JWT_SECRET is empty. Set it in backend/.env (see the comment there) and restart.')
    process.exit(1)
  }

  // Test the MySQL connection before accepting requests
  await testConnection()

  app.listen(PORT, () => {
    console.log(`🚀  Server running at http://localhost:${PORT}`)
    console.log(`📋  Health check: http://localhost:${PORT}/api/health`)
    console.log(`🗄️   DB test:      http://localhost:${PORT}/api/health/db`)
  })
}

startServer()
