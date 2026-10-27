// Collects trusted medical evidence for a question (this is the "RAG" step).
//
// Sources, from most to least specific:
//   1. our local knowledge base (MedlinePlus lab-test pages)       -> instant
//   2. MedlinePlus health topics, live from the NIH/NLM search API -> online
//   3. WHO fact sheets (anaemia, diabetes, ...), fetched live      -> online
// Online pages are cached in memory for 24 hours, so repeat questions are fast,
// and every online call has a short timeout so a slow site never blocks an answer.
//
// The user's own report data is NOT here; it stays in MySQL.
const logger = require('../utils/logger')
const { findForQuestion, findForTestName } = require('./knowledgeService')

const CACHE_MS = 24 * 60 * 60 * 1000
const FETCH_TIMEOUT_MS = 5000
const cache = new Map()

const cached = async (key, loader) => {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.time < CACHE_MS) return hit.value
  const value = await loader()
  cache.set(key, { time: Date.now(), value })
  return value
}

const decodeEntities = (text) =>
  text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&rsquo;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')

const stripTags = (html) => decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()

// Cut text at a sentence end so evidence never stops mid-sentence.
const shorten = (text, maxChars) => {
  if (text.length <= maxChars) return text
  const cut = text.slice(0, maxChars)
  const lastStop = cut.lastIndexOf('. ')
  return lastStop > maxChars * 0.5 ? cut.slice(0, lastStop + 1) : cut
}

// ---- MedlinePlus health topics (free NIH/NLM web service, no key) ----
const searchMedlinePlus = (term) =>
  cached(`mlp:${term}`, async () => {
    const url = `https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&retmax=1&term=${encodeURIComponent(term)}`
    const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    if (!response.ok) throw new Error(`status ${response.status}`)
    const xml = await response.text()
    const doc = xml.match(/<document[^>]*url="([^"]+)"[^>]*>([\s\S]*?)<\/document>/)
    if (!doc) return null
    const field = (name) => {
      const m = doc[2].match(new RegExp(`<content name="${name}">([\\s\\S]*?)</content>`))
      return m ? stripTags(decodeEntities(m[1])) : ''
    }
    const summary = field('FullSummary')
    if (!summary) return null
    return {
      source: 'MedlinePlus (U.S. National Library of Medicine)',
      title: field('title') || term,
      url: doc[1],
      text: shorten(summary, 650),
    }
  })

// ---- WHO fact sheets ----
const WHO_FACT_SHEETS = {
  anaemia: 'anaemia',
  diabetes: 'diabetes',
  hypertension: 'hypertension',
  cardiovascular: 'cardiovascular-diseases-(cvds)',
  obesity: 'obesity-and-overweight',
  hepatitis: 'hepatitis-b',
}

const fetchWhoFactSheet = (key) =>
  cached(`who:${key}`, async () => {
    const url = `https://www.who.int/news-room/fact-sheets/detail/${WHO_FACT_SHEETS[key]}`
    const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    if (!response.ok) throw new Error(`status ${response.status}`)
    const html = await response.text()
    const article = html.match(/<article[\s\S]*?<\/article>/i)
    if (!article) return null
    const cleaned = article[0].replace(/<(script|style|nav)[\s\S]*?<\/\1>/gi, ' ')
    const text = stripTags(cleaned).replace(/^Overview\s*/, '')
    const title = (html.match(/<title>([^<|]+)/i) || [])[1]
    return {
      source: 'World Health Organization (WHO) fact sheet',
      title: title ? decodeEntities(title).trim() : 'WHO fact sheet',
      url,
      text: shorten(text, 650),
    }
  })

// Which topics a question / abnormal result is about. One rule list drives both
// the MedlinePlus search term and the WHO fact sheet.
const TOPICS = [
  { pattern: /hemoglobin|haemoglobin|\bhb\b|anemi|anaemi|\bmcv\b|\bmch\b|\bmchc\b|hematocrit|\bpcv\b|iron|ferritin|\brbc\b|red blood/i, medline: 'anemia', who: 'anaemia' },
  { pattern: /glucose|sugar|diabet|a1c/i, medline: 'diabetes', who: 'diabetes' },
  { pattern: /blood pressure|hypertens/i, medline: 'high blood pressure', who: 'hypertension' },
  { pattern: /cholesterol|\bldl\b|\bhdl\b|triglycer|lipid|heart/i, medline: 'cholesterol', who: 'cardiovascular' },
  { pattern: /obes|\bbmi\b|overweight/i, medline: 'obesity', who: 'obesity' },
  { pattern: /hepatitis|hbsag|\bhcv\b/i, medline: 'hepatitis', who: 'hepatitis' },
  { pattern: /creatinine|\burea\b|\bbun\b|egfr|kidney|renal/i, medline: 'kidney function tests', who: null },
  { pattern: /bilirubin|\balt\b|\bast\b|sgpt|sgot|\balp\b|phosphatase|liver|albumin/i, medline: 'liver function tests', who: null },
  { pattern: /thyroid|\btsh\b|\bt3\b|\bt4\b/i, medline: 'thyroid diseases', who: null },
  { pattern: /platelet/i, medline: 'platelet disorders', who: null },
  { pattern: /\bwbc\b|white blood|leucocyte|leukocyte|neutrophil|lymphocyte/i, medline: 'white blood cell disorders', who: null },
  { pattern: /vitamin d/i, medline: 'vitamin d', who: null },
]

// Collect evidence for a question plus the report's abnormal results.
// Returns a list: [{ source, title, url, text }] (already de-duplicated).
const getEvidence = async (question, labResults) => {
  const abnormalNames = labResults.filter((r) => r.status === 'LOW' || r.status === 'HIGH').map((r) => r.test_name)
  // The question decides the topic; abnormal results add topics only for general questions.
  const subject = `${question} ${/\b(abnormal|flagged|report|summary|everything|overall)\b/i.test(question) ? abnormalNames.join(' ') : ''}`
  const topics = TOPICS.filter((t) => t.pattern.test(subject)).slice(0, 3)

  const evidence = []

  // 1. Local knowledge base: entries for the question and for tests named in it
  findForQuestion(question).forEach((e) => evidence.push({ source: e.source, title: e.title, url: e.source_url, text: e.text }))

  // 2 + 3. Online sources, fetched in parallel; failures are logged and skipped
  const jobs = []
  topics.forEach((t) => {
    jobs.push(searchMedlinePlus(t.medline))
    if (t.who) jobs.push(fetchWhoFactSheet(t.who))
  })
  if (topics.length === 0) {
    // No known topic: only search the web for a test the user actually named
    // (so chit-chat or off-topic questions never trigger lookups).
    const q = question.toLowerCase()
    labResults
      .filter((r) => r.test_name.length >= 3 && q.includes(r.test_name.toLowerCase()))
      .slice(0, 2)
      .forEach((r) => jobs.push(searchMedlinePlus(`${r.test_name} test`)))
  }
  const settled = await Promise.allSettled(jobs)
  settled.forEach((s) => {
    if (s.status === 'fulfilled' && s.value) evidence.push(s.value)
    else if (s.status === 'rejected') logger.warn('RAG', `Online source skipped: ${s.reason.message}`)
  })

  // De-duplicate by URL and keep the list short so the prompt stays focused.
  const seen = new Set()
  const unique = evidence.filter((e) => !seen.has(e.url) && seen.add(e.url))
  logger.info('RAG', `${unique.length} evidence passages collected`)
  return unique.slice(0, 4)
}

module.exports = { getEvidence, findForTestName }
