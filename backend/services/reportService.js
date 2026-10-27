// Report processing pipeline:
//   file -> text (PDF text layer, or OCR if scanned) -> lab parameters -> MySQL
const { pool } = require('../config/db')
const { extractTextFromPdf } = require('./pdfService')
const { ocrPdf, ocrImageFile } = require('./ocrService')
const { extractLabResults, extractReportDate, detectReportType } = require('./extractionService')
const logger = require('../utils/logger')

// Scanned PDFs often return only page markers like "-- 1 of 3 --".
const hasRealText = (text) => text.replace(/--\s*\d+\s*of\s*\d+\s*--/g, '').trim().length > 30

const getReportText = async (filePath, mimeType) => {
  if (mimeType === 'application/pdf') {
    const text = await extractTextFromPdf(filePath)
    if (hasRealText(text)) return text
    logger.info('OCR', 'PDF has no text layer, running OCR')
    return ocrPdf(filePath)
  }
  logger.info('OCR', 'Image upload, running OCR')
  return ocrImageFile(filePath)
}

// Runs the whole pipeline for a report row that already exists.
// Updates processing_status so the UI/dashboard can show progress or failure.
const processReport = async (reportId, filePath, mimeType) => {
  try {
    await pool.query('UPDATE medical_reports SET processing_status = ? WHERE report_id = ?', ['processing', reportId])

    const text = await getReportText(filePath, mimeType)
    logger.info('REPORT', `Text extraction completed (${text.length} characters)`)
    if (!hasRealText(text)) throw new Error('No readable text found in the file')

    const results = extractLabResults(text)
    logger.info('REPORT', `Found ${results.length} lab values`)

    // Replace any old rows so re-processing never creates duplicates.
    await pool.query('DELETE FROM lab_results WHERE report_id = ?', [reportId])
    for (const r of results) {
      await pool.query(
        `INSERT INTO lab_results (report_id, test_name, test_value, unit, reference_min, reference_max, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [reportId, r.test_name, r.test_value, r.unit, r.reference_min, r.reference_max, r.status]
      )
    }

    // Use the date/type printed on the report when the user did not choose them.
    // Dates matter: trends and Compare are ordered by report_date.
    const foundDate = extractReportDate(text)
    const foundType = detectReportType(text)
    await pool.query(
      `UPDATE medical_reports
       SET extracted_text = ?, processing_status = 'completed', processing_error = NULL,
           report_date = COALESCE(report_date, ?, CURDATE()),
           report_type = COALESCE(report_type, ?, 'General Report')
       WHERE report_id = ?`,
      [text, foundDate, foundType, reportId]
    )
    return { status: 'completed', labResultCount: results.length }
  } catch (error) {
    logger.error('REPORT', `Processing failed for report ${reportId}:`, error.message)
    await pool.query(
      'UPDATE medical_reports SET processing_status = ?, processing_error = ? WHERE report_id = ?',
      ['failed', error.message.slice(0, 500), reportId]
    )
    return { status: 'failed', error: error.message, labResultCount: 0 }
  }
}

module.exports = { processReport }
