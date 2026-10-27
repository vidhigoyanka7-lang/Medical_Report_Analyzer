const logger = require('../utils/logger')

const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  error.status = 404
  next(error)
}

// Last middleware: turns any error (including multer upload errors) into JSON.
const errorHandler = (err, req, res, next) => {
  let status = err.status || (res.statusCode !== 200 ? res.statusCode : 500)
  let message = err.message || 'Internal Server Error'
  if (err.code === 'LIMIT_FILE_SIZE') { status = 400; message = 'File is too large. Maximum size is 20 MB.' }
  else if (err.name === 'MulterError') status = 400

  if (status >= 500) logger.error('API', `${req.method} ${req.originalUrl} failed:`, err)
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

module.exports = { notFound, errorHandler }
