/**
 * Text Analyzer Controller
 */
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { processTextAnalysis } = require('../services/textAnalysisService');
const { extractTextFromPdf } = require('../services/pdfService');

const prisma = new PrismaClient();

async function analyzeText(req, res, next) {
  try {
    let textToAnalyze = req.body.text || '';
    let fileName = null;

    // Check if a file was uploaded instead
    if (req.file) {
      fileName = req.file.originalname;
      const ext = path.extname(fileName).toLowerCase();

      if (ext === '.pdf') {
        const parsed = await extractTextFromPdf(req.file.path);
        textToAnalyze = parsed.text;
      } else {
        // Plain TXT or text file
        textToAnalyze = fs.readFileSync(req.file.path, 'utf8');
      }
    }

    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No text provided. Please enter text or upload a document (.txt, .pdf).',
        errors: ['Text is required']
      });
    }

    const result = await processTextAnalysis(textToAnalyze);

    // Save to user analysis history if logged in
    let savedRecord = null;
    if (req.user) {
      savedRecord = await prisma.analysis.create({
        data: {
          userId: req.user.id,
          analyzerType: 'text',
          inputFileName: fileName || 'Text Snippet',
          inputType: fileName ? 'file' : 'text',
          geminiSummary: result.summary,
          result: JSON.stringify(result)
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Text analysis completed successfully.',
      data: {
        analysisId: savedRecord ? savedRecord.id : null,
        fileName,
        ...result
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  analyzeText
};

