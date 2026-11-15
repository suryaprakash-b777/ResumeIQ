/**
 * Analysis History Controller
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/history
async function getHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const { type, sort = 'desc' } = req.query;

    const whereClause = { userId };
    if (type && type !== 'all') {
      whereClause.analyzerType = type;
    }

    const analyses = await prisma.analysis.findMany({
      where: whereClause,
      orderBy: { createdAt: sort === 'asc' ? 'asc' : 'desc' },
      select: {
        id: true,
        analyzerType: true,
        inputFileName: true,
        inputType: true,
        targetRole: true,
        atsScore: true,
        jobMatchScore: true,
        geminiSummary: true,
        createdAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'History retrieved successfully.',
      data: analyses
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/history/:id
async function getHistoryItem(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
        resume: true
      }
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found.',
        errors: ['Not found']
      });
    }

    if (analysis.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this analysis history.',
        errors: ['Forbidden']
      });
    }

    // Safely parse JSON strings
    const safeParse = (str) => {
      if (!str) return null;
      if (typeof str === 'object') return str;
      try { return JSON.parse(str); } catch { return str; }
    };

    const formatted = {
      ...analysis,
      scoreBreakdown: safeParse(analysis.scoreBreakdown),
      extractedSkills: safeParse(analysis.extractedSkills),
      matchedSkills: safeParse(analysis.matchedSkills),
      missingSkills: safeParse(analysis.missingSkills),
      missingKeywords: safeParse(analysis.missingKeywords),
      strengths: safeParse(analysis.strengths),
      weaknesses: safeParse(analysis.weaknesses),
      improvementSuggestions: safeParse(analysis.improvementSuggestions),
      recommendedRoles: safeParse(analysis.recommendedRoles),
      roadmap: safeParse(analysis.roadmap),
      result: safeParse(analysis.result)
    };

    res.status(200).json({
      success: true,
      message: 'Analysis record retrieved.',
      data: formatted
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/history/:id
async function deleteHistoryItem(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const analysis = await prisma.analysis.findUnique({ where: { id } });
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found.',
        errors: ['Not found']
      });
    }

    if (analysis.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized action.',
        errors: ['Forbidden']
      });
    }

    await prisma.analysis.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Analysis record deleted successfully.',
      data: {}
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHistory,
  getHistoryItem,
  deleteHistoryItem
};

