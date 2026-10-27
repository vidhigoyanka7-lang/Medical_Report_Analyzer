// OCR for scanned PDFs and images, using tesseract.js (pure JS, no install needed).
// First run downloads the English language data once, so it needs internet.
const fs = require('fs')
const { PDFParse } = require('pdf-parse')
const Tesseract = require('tesseract.js')
const logger = require('../utils/logger')

const MAX_OCR_PAGES = 10 // keeps processing time reasonable

// OCR one image buffer and return its text.
const ocrImage = async (imageBuffer) => {
  const { data } = await Tesseract.recognize(imageBuffer, 'eng')
  return data.text || ''
}

// Render each PDF page to a PNG, then OCR it.
const ocrPdf = async (filePath) => {
  const parser = new PDFParse({ data: new Uint8Array(fs.readFileSync(filePath)) })
  try {
    const shots = await parser.getScreenshot({ scale: 2 })
    const pages = shots.pages.slice(0, MAX_OCR_PAGES)
    let text = ''
    for (const page of pages) {
      logger.info('OCR', `Reading page ${page.pageNumber}/${pages.length}`)
      text += (await ocrImage(Buffer.from(page.data))) + '\n'
    }
    return text.trim()
  } finally {
    await parser.destroy()
  }
}

const ocrImageFile = async (filePath) => (await ocrImage(fs.readFileSync(filePath))).trim()

module.exports = { ocrPdf, ocrImageFile }
