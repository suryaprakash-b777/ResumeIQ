/**
 * Image Analyzer Controller
 */
const { PrismaClient } = require('@prisma/client');
const { processImageAnalysis } = require('../services/imageAnalysisService');

const prisma = new PrismaClient();

async function analyzeImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Please upload a JPG, JPEG, PNG, or WEBP image.',
        errors: ['Image file required']
      });
    }

    const result = await processImageAnalysis(req.file);

    // Save to user analysis history if logged in
    let savedRecord = null;
    if (req.user) {
      savedRecord = await prisma.analysis.create({
        data: {
          userId: req.user.id,
          analyzerType: 'image',
          inputFileName: req.file.originalname,
          inputType: 'file',
          geminiSummary: result.description,
          result: JSON.stringify(result)
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Image analysis completed successfully.',
      data: {
        analysisId: savedRecord ? savedRecord.id : null,
        ...result
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  analyzeImage
};

