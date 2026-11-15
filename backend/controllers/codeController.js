/**
 * Code Analyzer Controller
 */
const { PrismaClient } = require('@prisma/client');
const { processCodeAnalysis } = require('../services/codeAnalysisService');

const prisma = new PrismaClient();

async function analyzeCode(req, res, next) {
  try {
    let codeToAnalyze = req.body.code || '';
    const language = req.body.language || 'javascript';
    let fileName = null;

    if (req.file) {
      fileName = req.file.originalname;
      codeToAnalyze = req.file.buffer.toString('utf8');
    }

    if (!codeToAnalyze || codeToAnalyze.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No code supplied. Please write code or upload a source code file.',
        errors: ['Code is required']
      });
    }

    const result = await processCodeAnalysis(codeToAnalyze, language);

    // Save to user analysis history if logged in
    let savedRecord = null;
    if (req.user) {
      savedRecord = await prisma.analysis.create({
        data: {
          userId: req.user.id,
          analyzerType: 'code',
          inputFileName: fileName || `${language}-snippet`,
          inputType: fileName ? 'file' : 'code',
          geminiSummary: result.overview,
          result: JSON.stringify(result)
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Code analysis completed successfully.',
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
  analyzeCode
};

