const express = require('express')
const router = express.Router()
const { uploadReport, getReports, getReportById, deleteReport, reprocessReport, downloadReportFile, getTrends } = require('../controllers/reportController')
const { protect } = require('../middleware/authMiddleware')
const { upload } = require('../middleware/uploadMiddleware')

// 'report' is the FormData field name used by the frontend
router.post('/upload', protect, upload.single('report'), uploadReport)

// '/trends' must stay above '/:id' or "trends" would be read as an id
router.get('/trends', protect, getTrends)
router.get('/', protect, getReports)
router.get('/:id', protect, getReportById)
router.get('/:id/file', protect, downloadReportFile)
router.post('/:id/reprocess', protect, reprocessReport)
router.delete('/:id', protect, deleteReport)

module.exports = router
