/**
 * DOCX Text Extraction Service using mammoth
 */
const mammoth = require('mammoth');
const { normalizeText } = require('./pdfService');

async function extractTextFromDocx(filePathOrBuffer) {
  try {
    let result;
    if (Buffer.isBuffer(filePathOrBuffer)) {
      result = await mammoth.extractRawText({ buffer: filePathOrBuffer });
    } else {
      result = await mammoth.extractRawText({ path: filePathOrBuffer });
    }

    const cleanedText = normalizeText(result.value);
    return {
      text: cleanedText,
      messages: result.messages || []
    };
  } catch (error) {
    console.error('Error extracting text from DOCX:', error.message);
    throw new Error(`Failed to parse DOCX document: ${error.message}`);
  }
}

module.exports = {
  extractTextFromDocx
};

