// Small input-validation helpers used by controllers.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isValidEmail = (email) => typeof email === 'string' && EMAIL_REGEX.test(email)

// Minimum 8 characters keeps things simple but not trivial.
const isValidPassword = (password) => typeof password === 'string' && password.length >= 8

// Compare an extracted value with the reference range printed on the report.
// This is deterministic on purpose: the LLM never decides LOW/HIGH.
const getStatus = (value, referenceMin, referenceMax) => {
  if (value === null || value === undefined) return 'UNKNOWN'
  if (referenceMin !== null && referenceMin !== undefined && value < referenceMin) return 'LOW'
  if (referenceMax !== null && referenceMax !== undefined && value > referenceMax) return 'HIGH'
  if ((referenceMin === null || referenceMin === undefined) &&
      (referenceMax === null || referenceMax === undefined)) return 'UNKNOWN'
  return 'NORMAL'
}

module.exports = { isValidEmail, isValidPassword, getStatus }
