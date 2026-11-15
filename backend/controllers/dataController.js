/**
 * Data Analyzer Controller
 */
const { PrismaClient } = require('@prisma/client');
const { processDataAnalysis } = require('../services/dataAnalysisService');

const prisma = new PrismaClient();

async function analyzeData(req, res, next) {
  try {
    let result = null;
    let fileName = 'dataset.csv';

    if (req.file) {
      fileName = req.file.originalname;
      result = await processDataAnalysis(req.file.buffer, fileName);
    } else if (req.body.data && Array.isArray(req.body.data)) {
      // JSON array of objects passed in body
      fileName = req.body.fileName || 'custom-data.json';
      const XLSX = require('xlsx');
      const ws = XLSX.utils.json_to_sheet(req.body.data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      result = await processDataAnalysis(buf, fileName);
    } else {
      return res.status(400).json({
        success: false,
        message: 'No dataset uploaded. Please upload a CSV, XLSX, or JSON file.',
        errors: ['Data file is required']
      });
    }

    // Save to user analysis history if logged in
    let savedRecord = null;
    if (req.user) {
      savedRecord = await prisma.analysis.create({
        data: {
          userId: req.user.id,
          analyzerType: 'data',
          inputFileName: fileName,
          inputType: 'file',
          geminiSummary: result.insights.executiveSummary,
          result: JSON.stringify(result)
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Dataset analyzed successfully.',
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
  analyzeData
};

