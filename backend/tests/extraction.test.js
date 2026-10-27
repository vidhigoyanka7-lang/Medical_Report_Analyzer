// Run with:  npm test
const test = require('node:test')
const assert = require('node:assert')
const { extractLabResults, extractReportDate, detectReportType, parseLine } = require('../services/extractionService')
const { getStatus, isValidEmail } = require('../utils/validation')

test('status is calculated from the reference range', () => {
  assert.strictEqual(getStatus(10.2, 12, 17), 'LOW')
  assert.strictEqual(getStatus(18, 12, 17), 'HIGH')
  assert.strictEqual(getStatus(14, 12, 17), 'NORMAL')
  assert.strictEqual(getStatus(5, null, null), 'UNKNOWN')
  assert.strictEqual(getStatus(240, null, 200), 'HIGH')
})

test('basic row with min-max range', () => {
  assert.deepStrictEqual(parseLine('Hemoglobin 10.2 g/dL 12-17'), {
    test_name: 'Hemoglobin', test_value: 10.2, unit: 'g/dL', reference_min: 12, reference_max: 17, status: 'LOW',
  })
})

test('less-than and greater-than ranges', () => {
  assert.strictEqual(parseLine('Total Cholesterol 240 mg/dL < 200').status, 'HIGH')
  assert.strictEqual(parseLine('HDL 55 mg/dL > 40').status, 'NORMAL')
})

test('range followed by a repeated unit (real lab layout)', () => {
  const row = parseLine('Total Bilirubin 1.06 mg/dl 0-1.2 mg/dl')
  assert.strictEqual(row.test_value, 1.06)
  assert.strictEqual(row.reference_max, 1.2)
  assert.strictEqual(row.status, 'NORMAL')
})

test('Indian-style numbers and names are cleaned', () => {
  const row = parseLine('Platelet Count 94,000 /cumm 1,50,000 - 4,50,000')
  assert.strictEqual(row.test_name, 'Platelets')
  assert.strictEqual(row.test_value, 94000)
  assert.strictEqual(row.status, 'LOW')
  assert.strictEqual(parseLine('Sr. Creatinine 0.8 mg/dl 0.5-1.4').test_name, 'Creatinine')
  assert.strictEqual(parseLine('Na+ Sodium 139.6 mEq/Lit 135 - 145').test_name, 'Sodium')
})

test('garbled OCR unit is dropped instead of stored', () => {
  assert.strictEqual(parseLine('Neutrophils 66 i 40-70').unit, null)
})

test('header and patient lines are ignored', () => {
  const rows = extractLabResults('NAME Mrs Test AGE : 45Yrs\nDATE : 04/08/2026\nAge 34 years\nRoom 12')
  assert.strictEqual(rows.length, 0)
})

test('report date is read day-first and validated', () => {
  assert.strictEqual(extractReportDate('SEX : Female\nDATE © 04/08/2026 LAB.ID'), '2026-08-04')
  assert.strictEqual(extractReportDate('Date: 25/12/2025'), '2025-12-25')
  assert.strictEqual(extractReportDate('no date here'), null)
  assert.strictEqual(extractReportDate('Date: 01/01/2999'), null) // future dates are not believable
})

test('report type from headings', () => {
  assert.strictEqual(detectReportType('COMPLETE BLOOD COUNT\nHb 12'), 'Blood Test (CBC)')
  assert.strictEqual(detectReportType('nothing useful'), null)
})

test('email validation', () => {
  assert.ok(isValidEmail('a@b.com'))
  assert.ok(!isValidEmail('not-an-email'))
})

test('OCR range that lost its decimal point gives UNKNOWN, not a false flag', () => {
  assert.strictEqual(parseLine('Sr. Creatinine 0.8 mg/dl 05-14').status, 'UNKNOWN')
  assert.strictEqual(parseLine('PDW 14.5 % 115-155').status, 'UNKNOWN')
  assert.strictEqual(parseLine('PDW 14.5 % 11.5-15.5').status, 'NORMAL')
})

test('sex-specific range uses the sex printed on the report', () => {
  const line = 'Haemoglobin 10.6 gm/dl M: 13-18 F: 12-16'
  const female = parseLine(line, 'female')
  assert.strictEqual(female.test_name, 'Hemoglobin')
  assert.strictEqual(female.reference_min, 12)
  assert.strictEqual(female.reference_max, 16)
  assert.strictEqual(female.status, 'LOW')
  assert.strictEqual(parseLine(line, 'male').reference_min, 13)
  // report does not say the sex: no guessing
  assert.strictEqual(parseLine(line, null).status, 'UNKNOWN')
})

test('sex is read from the report text', () => {
  const { extractSex } = require('../services/extractionService')
  assert.strictEqual(extractSex('REF. BY : Dr X, SEX : Female'), 'female')
  assert.strictEqual(extractSex('Age/Sex : 21 Yrs. / Male'), 'male')
  assert.strictEqual(extractSex('nothing'), null)
})
