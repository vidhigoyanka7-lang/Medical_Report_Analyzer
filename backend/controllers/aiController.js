const { pool } = require('../config/db')
const { findOwnedReport, attachInfo } = require('./reportController')
const { getProfileText } = require('./profileController')
const { generateReportSummary, answerQuestion, getBioBertContext, isSmallTalk } = require('../services/aiService')
const logger = require('../utils/logger')

const loadLabResults = async (reportId) => {
  const [rows] = await pool.query(
    'SELECT test_name, test_value, unit, reference_min, reference_max, status FROM lab_results WHERE report_id = ?',
    [reportId]
  )
  return rows
}

// GET /api/ai/summary/:reportId
// The summary is generated once and cached in medical_reports.ai_summary.
const generateSummary = async (req, res) => {
  try {
    const report = await findOwnedReport(req.params.reportId, req.user.userId)
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' })

    const labResults = await loadLabResults(report.report_id)
    const reportInfo = {
      reportId: report.report_id,
      reportName: report.report_name,
      reportDate: report.report_date,
      reportType: report.report_type,
      processingStatus: report.processing_status,
    }

    let summary = report.ai_summary
    let summaryError = null
    if (!summary && report.processing_status === 'completed') {
      try {
        summary = await generateReportSummary(report, labResults)
        await pool.query('UPDATE medical_reports SET ai_summary = ? WHERE report_id = ?', [summary, report.report_id])
      } catch (error) {
        logger.error('AI', 'Summary generation failed:', error.message)
        summaryError = 'The AI summary could not be generated right now.'
      }
    }

    // Lab results are always returned, even if the summary failed.
    res.json({ success: true, summary, summaryError, labResults: attachInfo(labResults), report: reportInfo })
  } catch (error) {
    logger.error('AI', 'Summary route error:', error)
    res.status(500).json({ success: false, message: 'Server error generating summary' })
  }
}

// Earlier chat turns sent by the browser. Checked and trimmed so nobody can inject odd roles or huge text.
const cleanHistory = (history) =>
  (Array.isArray(history) ? history : [])
    .filter((m) => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string' && m.content.trim())
    .slice(-8)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }))

// POST /api/ai/ask   body: { question, reportId?, history? }
const askQuestion = async (req, res) => {
  try {
    const { reportId } = req.body
    const question = (req.body.question || '').toString().trim()
    if (!question) return res.status(400).json({ success: false, message: 'Question is required' })
    if (question.length > 1000) return res.status(400).json({ success: false, message: 'Question is too long' })
    logger.info('QA', 'Question received')

    // The report is optional now: greetings and general questions work without one.
    let report = null
    let labResults = []
    let bioBert = null
    let profileText = ''
    if (!isSmallTalk(question)) {
      if (reportId) {
        report = await findOwnedReport(reportId, req.user.userId)
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' })
      } else {
        const [rows] = await pool.query(
          'SELECT * FROM medical_reports WHERE user_id = ? AND processing_status = ? ORDER BY uploaded_at DESC LIMIT 1',
          [req.user.userId, 'completed']
        )
        report = rows[0] || null
      }
      if (report) {
        labResults = await loadLabResults(report.report_id)
        bioBert = await getBioBertContext(question, report.extracted_text || '')
      }
      profileText = await getProfileText(req.user.userId)
    }

    try {
      const { answer, sources } = await answerQuestion(question, {
        report, labResults, bioBert, profileText,
        history: cleanHistory(req.body.history),
        userName: (req.user.name || '').split(' ')[0],
      })
      logger.info('QA', 'Answer generated')
      res.json({ success: true, answer, sources, usedBioBert: !!bioBert })
    } catch (error) {
      logger.error('AI', 'Answer generation failed:', error.message)
      res.status(502).json({ success: false, message: 'The AI service could not answer right now. Please try again.' })
    }
  } catch (error) {
    logger.error('QA', 'Ask route error:', error)
    res.status(500).json({ success: false, message: 'Server error generating answer' })
  }
}

module.exports = { generateSummary, askQuestion }
