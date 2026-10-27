const { pool } = require('../config/db')
const logger = require('../utils/logger')

// GET /api/dashboard
// Every number comes from MySQL for the logged-in user (user id comes from the JWT).
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.userId

    // Reports analysed = reports that finished processing (failed ones are not counted).
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total,
              COALESCE(SUM(uploaded_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')), 0) AS this_month
       FROM medical_reports WHERE user_id = ? AND processing_status = 'completed'`,
      [userId]
    )
    const counts = countRows[0]

    const [recentReports] = await pool.query(
      `SELECT report_id, report_name, report_type, report_date, processing_status, uploaded_at
       FROM medical_reports WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 4`,
      [userId]
    )

    // LOW / HIGH are the "abnormal" ones. Status was set by code, not by the LLM.
    const [statRows] = await pool.query(
      `SELECT COALESCE(SUM(lr.status IN ('LOW','HIGH')), 0) AS abnormal,
              COALESCE(SUM(lr.status = 'NORMAL'), 0) AS normal
       FROM lab_results lr JOIN medical_reports mr ON lr.report_id = mr.report_id
       WHERE mr.user_id = ?`,
      [userId]
    )
    const stats = statRows[0]

    const [attentionResults] = await pool.query(
      `SELECT lr.test_name, lr.test_value, lr.unit, lr.status, mr.report_id
       FROM lab_results lr JOIN medical_reports mr ON lr.report_id = mr.report_id
       WHERE mr.user_id = ? AND lr.status IN ('LOW','HIGH')
       ORDER BY mr.uploaded_at DESC, lr.result_id LIMIT 5`,
      [userId]
    )

    // Extraction quality (shown in the third card):
    //   per report = % of extracted rows where a reference range was found on the report;
    //   card value = average over the user's completed reports that have rows.
    const [qualityRows] = await pool.query(
      `SELECT AVG(q) AS value FROM (
         SELECT 100 * SUM(lr.reference_min IS NOT NULL OR lr.reference_max IS NOT NULL) / COUNT(*) AS q
         FROM medical_reports mr JOIN lab_results lr ON lr.report_id = mr.report_id
         WHERE mr.user_id = ? AND mr.processing_status = 'completed'
         GROUP BY mr.report_id) per_report`,
      [userId]
    )
    const quality = qualityRows[0]

    res.json({
      success: true,
      data: {
        totalReportsThisMonth: Number(counts.this_month),
        totalReports: Number(counts.total),
        abnormalResults: Number(stats.abnormal),
        normalResults: Number(stats.normal),
        // No documented health-score algorithm exists yet, so we do not invent one.
        healthScore: null,
        // Real, measurable: see "Extraction quality" above. null until a report has rows.
        aiConfidence: quality.value === null ? null : Math.round(Number(quality.value)),
        recentReports,
        attentionResults,
      },
    })
  } catch (error) {
    logger.error('API', 'Dashboard fetch error:', error)
    res.status(500).json({ success: false, message: 'Unable to load dashboard data' })
  }
}

module.exports = { getDashboardData }
