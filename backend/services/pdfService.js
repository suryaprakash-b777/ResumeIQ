/**
 * PDF Text Extraction Service using pdf-parse
 */
const fs = require('fs');
const pdfParse = require('pdf-parse');

async function extractTextFromPdf(filePathOrBuffer) {
  try {
    let dataBuffer;
    if (Buffer.isBuffer(filePathOrBuffer)) {
      dataBuffer = filePathOrBuffer;
    } else {
      dataBuffer = fs.readFileSync(filePathOrBuffer);
    }

    const data = await pdfParse(dataBuffer);
    const cleanedText = normalizeText(data.text);
    return {
      text: cleanedText,
      numPages: data.numpages || 1,
      info: data.info || {}
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error.message);
    throw new Error(`Failed to parse PDF document: ${error.message}`);
  }
}

function normalizeText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \u00A0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

module.exports = {
  extractTextFromPdf,
  normalizeText
};

