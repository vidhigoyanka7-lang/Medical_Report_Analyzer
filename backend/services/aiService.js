// Talks to the LLM (summary + Q&A) and to the Python BioBERT service.
//
// The LLM settings come from backend/.env and are never sent to the browser:
//   LLM_BASE_URL / LLM_API_KEY / LLM_MODEL                    -> primary  (Groq)
//   LLM_FALLBACK_BASE_URL / LLM_FALLBACK_API_KEY / LLM_FALLBACK_MODEL -> backup (Gemini)
// Both are OpenAI-compatible APIs, so the same code can call either one.
const logger = require('../utils/logger')
const { getEvidence } = require('./evidenceService')

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:8000'

const SAFETY_RULES = `
RULES:
- You are an educational assistant. Do NOT diagnose, prescribe, or change medication.
- Do NOT claim certainty. Never say results "indicate" or "suggest" a specific disease; say a pattern "can be seen in" or "is commonly linked to" something, and that only a doctor can tell the cause.
- Do NOT invent values, reference ranges or report details.
- Only use the report data and background notes given below. If something is not there, say so.
- End by suggesting what the user could discuss with a healthcare professional.`

// Providers in the order we try them. Providers without a key are skipped.
const getProviders = () =>
  [
    { name: 'primary', baseUrl: process.env.LLM_BASE_URL, apiKey: process.env.LLM_API_KEY, model: process.env.LLM_MODEL },
    { name: 'fallback', baseUrl: process.env.LLM_FALLBACK_BASE_URL, apiKey: process.env.LLM_FALLBACK_API_KEY, model: process.env.LLM_FALLBACK_MODEL },
  ].filter((p) => p.baseUrl && p.apiKey && p.model)

// One chat-completion request. Retries once when the provider says "busy".
const callProvider = async (provider, messages) => {
  const url = `${provider.baseUrl.replace(/\/+$/, '')}/chat/completions`
  let response, data
  for (let attempt = 1; attempt <= 2; attempt++) {
    response = await fetch(url, {
      method: 'POST',
      // The key goes in a header, never in the URL, so it cannot leak into logs.
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.apiKey}` },
      body: JSON.stringify({
        model: provider.model,
        messages,
        temperature: 0.2,
        // gpt-oss is a "reasoning" model; low effort keeps answers fast
        ...(/gpt-oss/i.test(provider.model) && { reasoning_effort: 'low' }),
      }),
      signal: AbortSignal.timeout(60000),
    })
    data = await response.json().catch(() => ({}))
    // 429 = rate limit: do not wait, let callLLM switch to the other provider at once.
    if (response.status !== 503) break
    logger.warn('AI', `LLM ${provider.name} busy (503), retrying`)
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }
  if (!response.ok) {
    throw new Error(`${response.status}: ${data.error?.message || 'request failed'}`)
  }
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('empty response')
  return text
}

// Try the primary LLM first; if it fails, use the fallback.
const callLLM = async (input) => {
  // a plain string is one user message; an array is a full chat
  const messages = typeof input === 'string' ? [{ role: 'user', content: input }] : input
  const providers = getProviders()
  if (providers.length === 0) throw new Error('No LLM is configured (set LLM_API_KEY in backend/.env)')

  const errors = []
  for (const provider of providers) {
    try {
      return await callProvider(provider, messages)
    } catch (error) {
      logger.warn('AI', `LLM ${provider.name} (${provider.model}) failed: ${error.message}`)
      errors.push(`${provider.name}: ${error.message}`)
    }
  }
  throw new Error(`All LLM providers failed (${errors.join(' | ')})`)
}

// Turn lab_results rows into plain text for the prompt.
const formatLabResults = (labResults) => {
  if (!labResults.length) return 'No lab values were extracted from this report.'
  return labResults.map((r) => {
    const range = r.reference_min !== null || r.reference_max !== null
      ? `${r.reference_min ?? ''}-${r.reference_max ?? ''}` : 'not shown on report'
    return `- ${r.test_name}: ${r.test_value} ${r.unit || ''} (reference: ${range}) [${r.status}]`
  }).join('\n')
}

// Numbered evidence block for the prompt, e.g. "[1] MedlinePlus - Anemia: ...".
const formatEvidence = (evidence) =>
  evidence.length
    ? evidence.map((e, i) => `[${i + 1}] ${e.source} - ${e.title}: ${e.text}`).join('\n')
    : '(no outside evidence could be loaded)'

const toSources = (evidence) =>
  evidence.map((e, i) => ({ number: i + 1, title: e.title, source: e.source, url: e.url }))

const STYLE_RULES = `
STYLE:
- Write in plain, friendly language a non-medical person understands (about grade 8 reading level).
- Use short paragraphs and simple "-" bullet points. Use **bold** only for test names and values.
- Do not use tables, nested headings, or emojis.
- Cite evidence as [1], [2] after the sentence it supports. Only cite numbers that exist below.
- General statements about causes or meaning must come from the EVIDENCE. If the evidence does not cover
  something, say it is not covered instead of guessing.
- A result marked UNKNOWN has no readable reference range: say the range could not be read and do not call it normal or abnormal.`

// Plain lists built by code, so the LLM does not have to decide what is abnormal.
const groupByStatus = (labResults) => {
  const names = (status) => labResults.filter((r) => r.status === status).map((r) => r.test_name).join(', ') || 'none'
  return `OUTSIDE THE REFERENCE RANGE (only these may be listed as abnormal):
- LOW: ${names('LOW')}
- HIGH: ${names('HIGH')}
WITHIN THE REFERENCE RANGE: ${names('NORMAL')}
RANGE NOT READABLE (UNKNOWN): ${names('UNKNOWN')}`
}

const generateReportSummary = async (report, labResults) => {
  logger.info('AI', 'Summary generation started')
  const evidence = await getEvidence('summary of abnormal report results', labResults)
  const prompt = `You are MediGuide AI. Write a SIMPLE educational summary of the medical report "${report.report_name}".

LAB RESULTS (exact values from the report; status was calculated by software from the report's own reference range):
${formatLabResults(labResults)}

${groupByStatus(labResults)}

EVIDENCE:
${formatEvidence(evidence)}

Under "Values outside the reference range" list ONLY the LOW and HIGH tests above, never a NORMAL one.
Do not assume whether the person was fasting, their age, sex or symptoms unless the report says so.

Structure the answer with these four short sections, each starting with a "## " heading using exactly these titles:
What this report contains
Values outside the reference range
What this can generally mean
Questions to discuss with your doctor
${STYLE_RULES}
${SAFETY_RULES}`
  const text = await callLLM(prompt)
  logger.info('AI', 'Summary generation completed')
  return text
}

// Ask the Python service (BioBERT) which report lines are relevant to the question.
// Returns { context, matchedTerms } or null if the service is not running.
const getBioBertContext = async (question, reportText) => {
  try {
    const response = await fetch(`${PYTHON_AI_URL}/api/ask_question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, report_context: reportText }),
      signal: AbortSignal.timeout(120000), // first call loads the model
    })
    if (!response.ok) throw new Error(`status ${response.status}`)
    const data = await response.json()
    return { context: data.relevant_context, matchedTerms: data.matched_terms || [] }
  } catch (error) {
    logger.warn('NLP', `BioBERT service unavailable: ${error.message}`)
    return null
  }
}

// ---------------- Chat ----------------

// Greetings, thanks, "who are you" etc. These need a friendly reply, not report data or web lookups.
const SMALL_TALK = /^(hi+|hello+|hey+|hola|namaste|yo|good (morning|afternoon|evening|night)|thanks?( you)?( so much)?|thank u|ok(ay)?|cool|great|nice|bye|goodbye|see you|how are you|who are you|what are you|what can you do|help)\b[\s!.?,]*$/i
const isSmallTalk = (text) => SMALL_TALK.test(text.trim())

const buildPersona = (userName) => `You are MediGuide AI, a warm, friendly assistant inside a medical-report app. You chat like a kind, knowledgeable friend: natural, short, easy words. The user's first name is ${userName || 'there'}.

HOW TO REPLY:
- Reply to what the user actually said. Only a greeting from the user (or the very first message) gets a greeting back, with their first name and one line about what you can help with. For every other message, start straight with the answer: no "Hi", and use their name only rarely. Do NOT mention any lab results unless the user asks about them.
- Answer ONLY what was asked. Do not list other results or bring up topics the user did not ask about.
- Keep it short: usually 2-5 sentences. A short bullet list only when it really helps. No headings, no tables. An emoji only in greetings.
- Facts about the user's own report come ONLY from REPORT DATA (never write the words REPORT DATA or EVIDENCE in your reply; the only citation style is [1]). If something is not there, say you can't find it. Never invent values, ranges, causes or advice.
- General medical explanations come ONLY from EVIDENCE, cited like [1]. If EVIDENCE does not cover it, say you don't have a reliable source for that and suggest asking a doctor.
- If the message is not about health, the user's report, or this app, kindly say you can only help with health reports and related questions.
- Never diagnose, prescribe or change medicines. Do not say results "indicate", "suggest" or "point to" a disease; say a pattern "can be seen in" something and that only a doctor can tell the cause.
- Diet, lifestyle or treatment tips: give them ONLY if EVIDENCE contains them (cite it). Otherwise say you don't have a reliable source for that and that a doctor or dietitian can advise.
- Short follow-ups ("what about that one?", "why?") refer to the earlier messages in this chat.
- If the user describes an emergency (for example chest pain or trouble breathing), tell them to contact emergency services or a doctor right away.`

// Only keep the sources the answer really cites, e.g. "[2]".
const citedSources = (answer, evidence) => {
  const cited = new Set([...answer.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])))
  return toSources(evidence).filter((source) => cited.has(source.number))
}

// history: earlier turns as [{ role: 'user' | 'assistant', content }]
const answerQuestion = async (question, { report, labResults, bioBert, profileText, history = [], userName }) => {
  let system = buildPersona(userName)
  let evidence = []

  if (!isSmallTalk(question)) {
    evidence = await getEvidence(question, labResults)
    system += `

REPORT DATA ${report ? `(report "${report.report_name}"; status was calculated by software from the report's own reference range)` : ''}:
${report ? formatLabResults(labResults) : 'The user has not uploaded an analysed report yet. If they ask about their report, tell them to upload one first.'}
${report ? `\nREPORT LINES PICKED BY BioBERT AS RELEVANT (OCR text, may contain small errors):\n${bioBert?.context || '(not available)'}` : ''}
${profileText ? `\nUSER HEALTH PROFILE (context only):\n${profileText}` : ''}

EVIDENCE:
${formatEvidence(evidence)}`
  }

  const messages = [{ role: 'system', content: system }, ...history, { role: 'user', content: question }]
  // some models write 【1】 instead of [1]
  const answer = (await callLLM(messages)).replace(/【(\d+)】/g, '[$1]').replace(/【[^】]*】/g, '')
  return { answer, sources: citedSources(answer, evidence) }
}

module.exports = { generateReportSummary, answerQuestion, getBioBertContext, isSmallTalk }
