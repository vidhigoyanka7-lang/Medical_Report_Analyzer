// Extracts lab parameters, the report date and the report type from report text.
// It is plain regex/rules (no AI), so numbers are exactly what the report says.
//
// Example line: "Hemoglobin 10.2 g/dL 12-17"
//   -> { test_name, test_value, unit, reference_min, reference_max, status }
const { getStatus } = require('../utils/validation')

// A number such as 10.2, 240 or Indian-style 1,50,000
const NUMBER = String.raw`(\d[\d,]*(?:\.\d+)?)`

// name | value | unit | optional reference range | optional trailing unit text
//   range forms:  a-b   a to b   <b   <=b   >a   >=a
const LINE_REGEX = new RegExp(
  String.raw`^([A-Za-z][A-Za-z0-9 ()/%.,'+&-]{1,45}?)\s*[:\s]\s*` + NUMBER +
  String.raw`\s*([A-Za-z%µ/^0-9.]{1,15})?` +
  String.raw`(?:\s+(?:` + NUMBER + String.raw`\s*(?:-|–|to)\s*` + NUMBER +
  String.raw`|[<≤]=?\s*` + NUMBER + String.raw`|[>≥]=?\s*` + NUMBER + String.raw`)` +
  String.raw`(?:\s+[A-Za-z/%µ.]{1,15}){0,2})?\s*$`
)

// Lines that look like results but are really headers / patient info.
const SKIP_WORDS = /\b(page|phone|tel|age|date|years|yrs|ref|sample|collected|reported|patient|id|pin|address|reg|no)\b/i

// Units we accept. OCR often garbles units ("i", "jz"); a garbled unit is dropped
// (stored as NULL) instead of being shown as wrong text.
const UNIT_REGEX = /^(%|fl|pg|sec|secs|seconds|[a-zµ]{1,6}\/[a-z0-9µ^.]{1,8}|[a-zA-Z]{1,5}\/[A-Za-z]{2,5})$/i
const cleanUnit = (unit) => {
  if (!unit) return null
  if (/^[j/]cumm$/i.test(unit)) return '/cumm' // common OCR slip: "Jcumm"
  return UNIT_REGEX.test(unit) ? unit : null
}

// Same test, different spelling -> one name, so Compare and Trends line up.
const CANONICAL_NAMES = {
  hb: 'Hemoglobin', hgb: 'Hemoglobin', haemoglobin: 'Hemoglobin',
  hct: 'Hematocrit', pcv: 'Hematocrit',
  tlc: 'WBC', wbc: 'WBC', plt: 'Platelets', 'platelet count': 'Platelets', platelet: 'Platelets',
  creatinine: 'Creatinine', urea: 'Blood Urea', 'blood urea': 'Blood Urea', bun: 'Blood Urea',
  sodium: 'Sodium', potassium: 'Potassium', glucose: 'Blood Glucose',
}
const normalizeName = (rawName) => {
  let name = rawName.trim().replace(/\s+/g, ' ')
  name = name.replace(/^(sr|ser|serum)\.?\s+/i, '') // "Sr. Creatinine" -> "Creatinine"
  name = name.replace(/^(na|k)\+\s+/i, '')          // "Na+ Sodium" -> "Sodium"
  const canonical = CANONICAL_NAMES[name.toLowerCase()]
  return canonical || name
}

const toNumber = (text) => parseFloat(text.replace(/,/g, ''))

// Some reports print one range per sex:  "Haemoglobin 10.6 gm/dl M: 13-18 F: 12-16".
// We keep the range for the sex printed on the report ("SEX : Female"). If the report does
// not say, the range is dropped and the result becomes UNKNOWN rather than guessing.
const SEX_RANGE = /\bM(?:ale)?\s*[:\-]?\s*(\d[\d.,]*)\s*(?:-|–|to)\s*(\d[\d.,]*)\s+F(?:emale)?\s*[:\-]?\s*(\d[\d.,]*)\s*(?:-|–|to)\s*(\d[\d.,]*)\s*$/i

const extractSex = (text) => {
  const t = text || ''
  // "SEX : Female"  or  "Age/Sex : 21 Yrs. / Male"
  const m = t.match(/\bsex\b\W{0,6}(male|female)/i) || t.match(/age\s*\/\s*sex\W+\d+[^/\n]{0,10}\/\s*(male|female)/i)
  return m ? m[1].toLowerCase() : null
}

const parseLine = (rawLine, sex = null) => {
  let line = rawLine.trim()
  const sexRange = line.match(SEX_RANGE)
  if (sexRange) {
    const chosen = sex === 'female' ? `${sexRange[3]}-${sexRange[4]}` : sex === 'male' ? `${sexRange[1]}-${sexRange[2]}` : ''
    line = line.replace(SEX_RANGE, chosen).trim()
  }
  const m = line.match(LINE_REGEX)
  if (!m) return null
  const [, name, value, unit, rangeMin, rangeMax, lessThan, greaterThan] = m
  if (SKIP_WORDS.test(name)) return null

  let referenceMin = null
  let referenceMax = null
  if (rangeMin !== undefined) {
    referenceMin = toNumber(rangeMin)
    referenceMax = toNumber(rangeMax)
    if (referenceMin > referenceMax) return null // not a real range
  } else if (lessThan !== undefined) {
    referenceMax = toNumber(lessThan)
  } else if (greaterThan !== undefined) {
    referenceMin = toNumber(greaterThan)
  }

  // OCR often drops decimal points inside ranges ("0.5-1.4" read as "05-14").
  // A wrong range would create a wrong LOW/HIGH flag, so suspicious ranges are discarded
  // and the result is marked UNKNOWN instead.
  const testValue = toNumber(value)
  const rangeText = [rangeMin, rangeMax].filter(Boolean)
  const leadingZeroInteger = rangeText.some((t) => /^0\d+$/.test(t))
  const missingDecimal = value.includes('.') && rangeText.length === 2 && rangeText.every((t) => !t.includes('.')) &&
    testValue * 10 >= referenceMin && testValue * 10 <= referenceMax
  const suspectRange = leadingZeroInteger || missingDecimal
  if (suspectRange) { referenceMin = null; referenceMax = null }

  const cleanedUnit = cleanUnit(unit)
  // Without a unit or a range this is probably not a lab row (e.g. "Room 12").
  if (!cleanedUnit && referenceMin === null && referenceMax === null) return null

  return {
    test_name: normalizeName(name),
    test_value: testValue,
    unit: cleanedUnit,
    reference_min: referenceMin,
    reference_max: referenceMax,
    status: getStatus(testValue, referenceMin, referenceMax),
  }
}

const extractLabResults = (text) => {
  const sex = extractSex(text)
  const results = []
  const seen = new Set()
  for (const line of (text || '').split(/\r?\n/)) {
    const row = parseLine(line, sex)
    if (!row) continue
    const key = row.test_name.toLowerCase()
    if (seen.has(key)) continue // keep the first occurrence of each test
    seen.add(key)
    results.push(row)
  }
  return results
}

// Report date: first dd/mm/yyyy (or dd-mm-yyyy) found next to a "date" label.
// Indian labs write day first, so dd/mm is tried before mm/dd.
// Returns 'YYYY-MM-DD' or null when no believable date exists.
const extractReportDate = (text) => {
  const labelled = /(?:date|collected|reported)[^0-9\n]{0,15}(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/gi
  let match
  while ((match = labelled.exec(text || '')) !== null) {
    const [, a, b, year] = match.map(Number)
    const candidates = [[a, b], [b, a]] // [day, month], then the swapped reading
    for (const [day, month] of candidates) {
      const date = new Date(year, month - 1, day)
      const valid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
      if (valid && year >= 2000 && date <= new Date()) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      }
    }
  }
  return null
}

// Report type from section headings; names match the Upload page list.
const TYPE_RULES = [
  [/complete blood count|\bcbc\b|haemogram|hemogram/i, 'Blood Test (CBC)'],
  [/lipid profile|cholesterol/i, 'Lipid Profile'],
  [/thyroid|\btsh\b/i, 'Thyroid Panel'],
  [/liver function|\blft\b/i, 'Liver Function'],
  [/kidney function|renal function|\bkft\b/i, 'Kidney Function'],
  [/vitamin/i, 'Vitamin Panel'],
  [/urine|urinalysis/i, 'Urine Analysis'],
]
const detectReportType = (text) => {
  const rule = TYPE_RULES.find(([regex]) => regex.test(text || ''))
  return rule ? rule[1] : null
}

module.exports = { extractLabResults, extractReportDate, detectReportType, parseLine, extractSex }
