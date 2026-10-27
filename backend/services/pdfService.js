// Reads the text layer of a PDF. Scanned PDFs have no text layer, so the
// result is empty and the caller must report that OCR is needed.
const fs = require('fs')
const { PDFParse } = require('pdf-parse')
const logger = require('../utils/logger')

const extractTextFromPdf = async (filePath) => {
  const buffer = fs.readFileSync(filePath)
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  try {
    const result = await parser.getText()
    return (result.text || '').trim()
  } finally {
    await parser.destroy()
  }
}

module.exports = { extractTextFromPdf }
