import axios from 'axios'

/**
 * api.js — Axios instance pre-configured for the backend API.
 *
 * Base URL reads from the Vite env variable VITE_API_URL.
 * Falls back to /api so Vite's dev proxy handles it automatically.
 *
 * Usage:
 *   import api from '../services/api'
 *   const res = await api.get('/health')
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
})

// ── Request interceptor ──────────────────────────────────────────────────────
// Attach JWT token (when available in later phases) to every request header.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor ─────────────────────────────────────────────────────
// Centralized error handling. Extend this in later phases.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred'
    console.error('[API Error]', message)

    // Token missing/expired: clear it and go to the login page (but not while logging in).
    const onAuthPage = ['/login', '/signup'].includes(window.location.pathname)
    if (error.response?.status === 401 && !onAuthPage) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
