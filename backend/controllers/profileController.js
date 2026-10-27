// Health profile: personal details, medical conditions, family history.
// Everything is tied to req.user.userId (from the JWT), never to an id sent by the browser.
const { pool } = require('../config/db')
const logger = require('../utils/logger')

const FAMILY_RELATIONS = ['Mother', 'Father', 'Siblings', 'Grandparents']
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const GENDERS = ['Male', 'Female', 'Other']

const loadProfile = async (userId) => {
  const [profileRows] = await pool.query('SELECT * FROM health_profiles WHERE user_id = ?', [userId])
  const profile = profileRows[0]
  const [conditions] = await pool.query('SELECT condition_name FROM health_conditions WHERE user_id = ?', [userId])
  const [family] = await pool.query('SELECT relation, condition_name FROM family_history WHERE user_id = ?', [userId])

  const familyByRelation = {}
  FAMILY_RELATIONS.forEach((relation) => { familyByRelation[relation] = [] })
  family.forEach((row) => { if (familyByRelation[row.relation]) familyByRelation[row.relation].push(row.condition_name) })

  return {
    exists: !!profile,
    personal: {
      dob: profile?.date_of_birth || '',
      gender: profile?.gender || '',
      height: profile?.height_cm ?? '',
      weight: profile?.weight_kg ?? '',
      bloodGroup: profile?.blood_group || '',
      contact: profile?.contact_number || '',
    },
    conditions: conditions.map((c) => c.condition_name),
    family: familyByRelation,
  }
}

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    res.json({ success: true, data: await loadProfile(req.user.userId) })
  } catch (error) {
    logger.error('API', 'Profile fetch error:', error)
    res.status(500).json({ success: false, message: 'Unable to load profile' })
  }
}

const toNumberOrNull = (value) => (value === '' || value === null || value === undefined ? null : Number(value))

// PUT /api/profile
const saveProfile = async (req, res) => {
  const { personal = {}, conditions = [], family = {} } = req.body
  const height = toNumberOrNull(personal.height)
  const weight = toNumberOrNull(personal.weight)

  // Basic validation so bad values never reach the database
  if (height !== null && (Number.isNaN(height) || height < 30 || height > 260)) return res.status(400).json({ success: false, message: 'Height must be between 30 and 260 cm' })
  if (weight !== null && (Number.isNaN(weight) || weight < 1 || weight > 500)) return res.status(400).json({ success: false, message: 'Weight must be between 1 and 500 kg' })
  if (personal.gender && !GENDERS.includes(personal.gender)) return res.status(400).json({ success: false, message: 'Invalid gender value' })
  if (personal.bloodGroup && !BLOOD_GROUPS.includes(personal.bloodGroup)) return res.status(400).json({ success: false, message: 'Invalid blood group' })
  if (personal.dob && (Number.isNaN(Date.parse(personal.dob)) || new Date(personal.dob) > new Date())) return res.status(400).json({ success: false, message: 'Invalid date of birth' })
  if (!Array.isArray(conditions)) return res.status(400).json({ success: false, message: 'Conditions must be a list' })

  const fullName = (personal.fullName || '').toString().trim()
  if (personal.fullName !== undefined && (fullName.length < 2 || fullName.length > 100)) {
    return res.status(400).json({ success: false, message: 'Name must be between 2 and 100 characters' })
  }

  const userId = req.user.userId
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    if (personal.fullName !== undefined) {
      await connection.query('UPDATE users SET full_name = ? WHERE user_id = ?', [fullName, userId])
    }
    await connection.query(
      `INSERT INTO health_profiles (user_id, date_of_birth, gender, height_cm, weight_kg, blood_group, contact_number)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE date_of_birth = VALUES(date_of_birth), gender = VALUES(gender),
         height_cm = VALUES(height_cm), weight_kg = VALUES(weight_kg),
         blood_group = VALUES(blood_group), contact_number = VALUES(contact_number)`,
      [userId, personal.dob || null, personal.gender || null, height, weight, personal.bloodGroup || null,
        (personal.contact || '').slice(0, 30) || null]
    )

    // Lists are small, so "delete then insert" is the simplest correct way to save them.
    await connection.query('DELETE FROM health_conditions WHERE user_id = ?', [userId])
    for (const name of conditions.slice(0, 30)) {
      await connection.query('INSERT INTO health_conditions (user_id, condition_name) VALUES (?, ?)', [userId, String(name).slice(0, 255)])
    }
    await connection.query('DELETE FROM family_history WHERE user_id = ?', [userId])
    for (const relation of FAMILY_RELATIONS) {
      const names = Array.isArray(family[relation]) ? family[relation] : []
      for (const name of names.slice(0, 30)) {
        await connection.query('INSERT INTO family_history (user_id, relation, condition_name) VALUES (?, ?, ?)', [userId, relation, String(name).slice(0, 255)])
      }
    }
    await connection.commit()
    res.json({ success: true, data: await loadProfile(userId), fullName: personal.fullName !== undefined ? fullName : req.user.name })
  } catch (error) {
    await connection.rollback()
    logger.error('API', 'Profile save error:', error)
    res.status(500).json({ success: false, message: 'Unable to save profile' })
  } finally {
    connection.release()
  }
}

// Short text version of the profile for the Q&A prompt (no contact number).
const getProfileText = async (userId) => {
  const p = await loadProfile(userId)
  if (!p.exists && p.conditions.length === 0) return ''
  const parts = []
  if (p.personal.gender) parts.push(`Gender: ${p.personal.gender}`)
  if (p.personal.dob) parts.push(`Date of birth: ${p.personal.dob}`)
  if (p.conditions.length) parts.push(`Existing conditions: ${p.conditions.join(', ')}`)
  return parts.join('\n')
}

module.exports = { getProfile, saveProfile, getProfileText, loadProfile }
