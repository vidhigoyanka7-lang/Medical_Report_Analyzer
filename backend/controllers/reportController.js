const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { pool } = require('../config/db')
const { processReport } = require('../services/reportService')
const { findForTestName } = require('../services/knowledgeService')
const logger = require('../utils/logger')

// Loads one report only if it belongs to the logged-in user.
// Returns undefined when it does not exist OR belongs to someone else (same 404 for both).
const findOwnedReport = async (reportId, userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM medical_reports WHERE report_id = ? AND user_id = ?',
    [reportId, userId]
  )
  return rows[0]
}

// Adds short background text + source link (from the knowledge base) to each lab row.
const attachInfo = (labResults) =>
  labResults.map((row) => {
    const entry = findForTestName(row.test_name)
    return { ...row, info: entry ? { text: entry.text, title: entry.title, url: entry.source_url } : null }
  })

// POST /api/reports/upload
const uploadReport = async (req, res) => {
  try {
    // user id comes from the JWT, never from the request body
    const userId = req.user.userId
    const file = req.file
    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' })

    logger.info('REPORT', 'Upload started')
    // Same file uploaded before by this user? Reuse the old analysis instead of
    // running OCR and the AI again.
    const fileHash = crypto.createHash('sha256').update(fs.readFileSync(file.path)).digest('hex')
    const [existing] = await pool.query(
      `SELECT report_id FROM medical_reports
       WHERE user_id = ? AND file_hash = ? AND processing_status <> 'failed' LIMIT 1`,
      [userId, fileHash]
    )
    if (existing.length > 0) {
      fs.unlink(file.path, () => {}) // the new copy is not needed
      logger.info('REPORT', `Duplicate upload, reusing report ${existing[0].report_id}`)
      return res.status(200).json({
        success: true, duplicate: true, reportId: existing[0].report_id,
        message: 'This file was already analyzed. Showing the existing analysis.',
      })
    }

    const reportName = (req.body.reportName || file.originalname).slice(0, 255)
    // Type and date stay NULL unless the user gave them; processing fills them
    // from the text printed on the report (see reportService).
    const reportType = req.body.reportType ? req.body.reportType.slice(0, 255) : null
    const reportDate = req.body.reportDate || null

    const [result] = await pool.query(
      `INSERT INTO medical_reports
       (user_id, report_name, report_type, report_date, file_name, file_path, mime_type, file_hash, processing_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, reportName, reportType, reportDate, file.filename, file.path, file.mimetype, fileHash]
    )
    const reportId = result.insertId

    // OCR can take a minute, so answer now and keep working in the background.
    // The frontend polls GET /api/reports/:id until processing_status is 'completed' or 'failed'.
    processReport(reportId, file.path, file.mimetype)
    res.status(202).json({ success: true, message: 'Report uploaded, processing started', reportId })
  } catch (error) {
    logger.error('REPORT', 'Upload error:', error)
    res.status(500).json({ success: false, message: 'Server error during file upload' })
  }
}

// GET /api/reports  -> list with an abnormal-count per report
const getReports = async (req, res) => {
  try {
    const [reports] = await pool.query(
      `SELECT mr.report_id, mr.report_name, mr.report_type, mr.report_date, mr.mime_type,
              mr.processing_status, mr.uploaded_at,
              COUNT(lr.result_id) AS result_count,
              COALESCE(SUM(lr.status IN ('LOW','HIGH')), 0) AS abnormal_count
       FROM medical_reports mr
       LEFT JOIN lab_results lr ON lr.report_id = mr.report_id
       WHERE mr.user_id = ?
       GROUP BY mr.report_id
       ORDER BY mr.uploaded_at DESC`,
      [req.user.userId]
    )
    res.json({ success: true, data: reports })
  } catch (error) {
    logger.error('REPORT', 'Fetch error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching reports' })
  }
}

// GET /api/reports/:id  -> one report with its lab results
const getReportById = async (req, res) => {
  try {
    const report = await findOwnedReport(req.params.id, req.user.userId)
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' })

    const [labResults] = await pool.query(
      'SELECT test_name, test_value, unit, reference_min, reference_max, status FROM lab_results WHERE report_id = ?',
      [report.report_id]
    )
    // file_path / extracted_text are internal; do not send them to the browser
    const { file_path, extracted_text, ...safeReport } = report
    res.json({ success: true, data: { ...safeReport, ai_summary: undefined, labResults: attachInfo(labResults) } })
  } catch (error) {
    logger.error('REPORT', 'Fetch one error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching report' })
  }
}

// POST /api/reports/:id/reprocess  -> run OCR/extraction again (e.g. after a failure)
const reprocessReport = async (req, res) => {
  try {
    const report = await findOwnedReport(req.params.id, req.user.userId)
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' })
    if (report.processing_status === 'processing') {
      return res.status(409).json({ success: false, message: 'Report is already being processed' })
    }
    await pool.query('UPDATE medical_reports SET ai_summary = NULL WHERE report_id = ?', [report.report_id])
    processReport(report.report_id, report.file_path, report.mime_type)
    res.status(202).json({ success: true, message: 'Reprocessing started' })
  } catch (error) {
    logger.error('REPORT', 'Reprocess error:', error)
    res.status(500).json({ success: false, message: 'Server error reprocessing report' })
  }
}

// GET /api/reports/:id/file  -> the original upload, only for its owner
const downloadReportFile = async (req, res) => {
  try {
    const report = await findOwnedReport(req.params.id, req.user.userId)
    if (!report || !fs.existsSync(report.file_path)) {
      return res.status(404).json({ success: false, message: 'File not found' })
    }
    res.download(path.resolve(report.file_path), report.report_name)
  } catch (error) {
    logger.error('REPORT', 'Download error:', error)
    res.status(500).json({ success: false, message: 'Server error downloading file' })
  }
}

// DELETE /api/reports/:id  -> removes the DB rows and the stored file
const deleteReport = async (req, res) => {
  try {
    const report = await findOwnedReport(req.params.id, req.user.userId)
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' })

    await pool.query('DELETE FROM medical_reports WHERE report_id = ?', [report.report_id]) // lab_results cascade
    fs.unlink(report.file_path, () => {}) // best effort; ignore if already gone
    logger.info('REPORT', `Report ${report.report_id} deleted`)
    res.json({ success: true })
  } catch (error) {
    logger.error('REPORT', 'Delete error:', error)
    res.status(500).json({ success: false, message: 'Server error deleting report' })
  }
}

// Builds the trend list from medical_reports + lab_results (no separate table).
const loadTrends = async (userId, testName) => {
  const params = [userId]
  let filter = ''
  if (testName) { filter = 'AND LOWER(lr.test_name) = LOWER(?)'; params.push(testName) }
  const [rows] = await pool.query(
    `SELECT lr.test_name, lr.test_value, lr.unit, lr.status, lr.reference_min, lr.reference_max,
            mr.report_id, mr.report_date
     FROM lab_results lr
     JOIN medical_reports mr ON lr.report_id = mr.report_id
     WHERE mr.user_id = ? ${filter}
     ORDER BY mr.report_date ASC, mr.report_id ASC`,
    params
  )
  const trends = {}
  rows.forEach((row) => {
    const key = row.test_name.toLowerCase()
    if (!trends[key]) {
      trends[key] = { test_name: row.test_name, unit: row.unit, reference_min: null, reference_max: null, history: [] }
    }
    // keep the latest reference range / unit seen
    trends[key].unit = row.unit
    trends[key].reference_min = row.reference_min
    trends[key].reference_max = row.reference_max
    trends[key].history.push({ report_id: row.report_id, date: row.report_date, value: row.test_value, status: row.status })
  })
  // add short background text + source link for each test (knowledge base)
  return Object.values(trends).map((t) => {
    const entry = findForTestName(t.test_name)
    return { ...t, info: entry ? { text: entry.text, title: entry.title, url: entry.source_url } : null }
  })
}

// GET /api/reports/trends  and  GET /api/trends/:testName
const getTrends = async (req, res) => {
  try {
    const data = await loadTrends(req.user.userId, req.params.testName)
    res.json({ success: true, data })
  } catch (error) {
    logger.error('REPORT', 'Trend fetch error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching trends' })
  }
}

module.exports = { uploadReport, getReports, getReportById, deleteReport, reprocessReport, downloadReportFile, getTrends, findOwnedReport, attachInfo }
