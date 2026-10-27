const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const ALLOWED_EXT = ['.pdf', '.jpg', '.jpeg', '.png']

// Safe filename: we never use the user's filename on disk (prevents path tricks).
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `report-${suffix}${path.extname(file.originalname).toLowerCase()}`)
  },
})

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase()
  if (ALLOWED_TYPES.includes(file.mimetype) && ALLOWED_EXT.includes(ext)) return cb(null, true)
  const err = new Error('Invalid file type. Only PDF, JPG and PNG files are supported.')
  err.status = 400
  cb(err, false)
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } }) // 20 MB

module.exports = { upload }
