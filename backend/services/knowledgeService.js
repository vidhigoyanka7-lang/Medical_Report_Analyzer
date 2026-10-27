// Small trusted medical knowledge base (backend/data/medicalKnowledge.json).
// Every entry stores: source, title, topic, parameter, section, source_url.
// It is searched by parameter name, not with a vector database; this keeps the
// project simple and the sources easy to check. The user's report data stays in
// MySQL, and only this general background text lives here.
const entries = require('../data/medicalKnowledge.json')

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Short aliases like "hb" or "na" are only trusted when they are the whole test name,
// otherwise they would match inside ordinary words.
const SHORT_ALIAS_LENGTH = 3

// Knowledge entry for one lab test name (e.g. "Hemoglobin", "Hb", "MCV").
const findForTestName = (testName) => {
  const name = (testName || '').toLowerCase().trim()
  return entries.find((entry) =>
    entry.aliases.some((alias) =>
      name === alias ||
      (alias.length >= SHORT_ALIAS_LENGTH && new RegExp(`\\b${escapeRegex(alias)}\\b`).test(name))
    )
  )
}

// Entries relevant to a free-text question.
const findForQuestion = (question) => {
  const q = (question || '').toLowerCase()
  return entries.filter((entry) =>
    entry.aliases.some((alias) =>
      alias.length >= SHORT_ALIAS_LENGTH && new RegExp(`\\b${escapeRegex(alias)}\\b`).test(q)
    )
  )
}

// Public shape of an entry (what we send to the browser / prompt).
const toSource = (entry) => ({
  title: entry.title,
  source: entry.source,
  topic: entry.topic,
  parameter: entry.parameter,
  section: entry.section,
  url: entry.source_url,
})

module.exports = { findForTestName, findForQuestion, toSource }
