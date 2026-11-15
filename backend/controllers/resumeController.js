/**
 * Resume Analysis & Management Controller
 */
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { extractTextFromPdf } = require('../services/pdfService');
const { extractTextFromDocx } = require('../services/docxService');
const { extractContactDetails, extractSkillsRuleBased, extractBasicSections } = require('../services/skillExtractor');
const { processResumeAnalysis } = require('../services/resumeAnalysisService');
const { generateStructuredReport } = require('../utils/reportGenerator');

const prisma = new PrismaClient();

// POST /api/resume/upload
async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded. Please upload a PDF or DOCX file.',
        errors: ['File is required']
      });
    }

    const { originalname, mimetype, size, path: filePath } = req.file;
    const ext = path.extname(originalname).toLowerCase();

    let rawText = '';
    if (ext === '.pdf' || mimetype === 'application/pdf') {
      const pdfData = await extractTextFromPdf(filePath);
      rawText = pdfData.text;
    } else if (ext === '.docx' || mimetype.includes('wordprocessingml')) {
      const docxData = await extractTextFromDocx(filePath);
      rawText = docxData.text;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported resume format. Please provide a PDF or DOCX document.',
        errors: ['Invalid file format']
      });
    }

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract readable text from document. Ensure file is not password-protected or scanned image.',
        errors: ['Text extraction yielded insufficient content']
      });
    }

    // Quick preliminary parse for preview
    const contacts = extractContactDetails(rawText);
    const skills = extractSkillsRuleBased(rawText);
    const sections = extractBasicSections(rawText);

    const initialParsedData = {
      name: contacts.name,
      email: contacts.email,
      phone: contacts.phone,
      linkedin: contacts.linkedin,
      github: contacts.github,
      skills: skills.all,
      education: sections.education,
      experience: sections.experience,
      projects: sections.projects,
      summary: sections.summary
    };

    // Save resume record in database (for authenticated users or guests)
    const userId = req.user ? req.user.id : null;
    const resumeRecord = await prisma.resume.create({
      data: {
        userId,
        fileName: originalname,
        fileType: ext.replace('.', ''),
        fileSize: size,
        rawText,
        parsedData: JSON.stringify(initialParsedData)
      }
    });

    res.status(200).json({
      success: true,
      message: 'Resume uploaded and parsed successfully.',
      data: {
        resumeId: resumeRecord.id,
        fileName: originalname,
        fileSize: size,
        rawText,
        rawTextLength: rawText.length,
        preview: initialParsedData
      }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/resume/analyze
async function analyzeResume(req, res, next) {
  try {
    const { resumeId, targetRole, jobDescription, directText, rawText, fileName } = req.body;
    let resumeText = directText || rawText || '';
    let dbResume = null;

    if (resumeId) {
      dbResume = await prisma.resume.findUnique({
        where: { id: resumeId },
        include: { user: true }
      });
      if (dbResume && !resumeText) {
        resumeText = dbResume.rawText;
      }
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No resume content available to analyze. Please upload a resume first.',
        errors: ['Missing resume text or invalid resumeId']
      });
    }

    // Run the complete hybrid pipeline
    const analysisResult = await processResumeAnalysis({
      resumeText,
      targetRole: targetRole || '',
      jobDescription: jobDescription || ''
    });

    // Update resume record parsedData if dbResume exists
    if (dbResume && analysisResult.parsedProfile) {
      await prisma.resume.update({
        where: { id: dbResume.id },
        data: {
          parsedData: JSON.stringify(analysisResult.parsedProfile)
        }
      });
    }

    // Save Analysis record in database
    const userId = req.user ? req.user.id : (dbResume ? dbResume.userId : null);

    const savedAnalysis = await prisma.analysis.create({
      data: {
        userId,
        resumeId: dbResume ? dbResume.id : null,
        analyzerType: 'resume',
        inputFileName: (dbResume ? dbResume.fileName : fileName) || 'resume.pdf',
        inputType: 'file',
        targetRole: targetRole || 'Software Professional',
        jobDescription: jobDescription || '',
        atsScore: analysisResult.atsScore,
        jobMatchScore: analysisResult.jobMatchScore,
        scoreBreakdown: JSON.stringify(analysisResult.scoreBreakdown),
        extractedSkills: JSON.stringify(analysisResult.extractedSkills),
        matchedSkills: JSON.stringify(analysisResult.matchedSkills),
        missingSkills: JSON.stringify(analysisResult.missingSkills),
        missingKeywords: JSON.stringify(analysisResult.missingKeywords),
        strengths: JSON.stringify(analysisResult.strengths),
        weaknesses: JSON.stringify(analysisResult.weaknesses),
        improvementSuggestions: JSON.stringify(analysisResult.improvementSuggestions),
        recommendedRoles: JSON.stringify(analysisResult.recommendedRoles),
        roadmap: JSON.stringify(analysisResult.roadmap),
        geminiSummary: analysisResult.geminiSummary
      }
    });

    res.status(200).json({
      success: true,
      message: 'Resume analysis generated successfully.',
      data: {
        analysisId: savedAnalysis ? savedAnalysis.id : 'analysis-record',
        resumeId: dbResume ? dbResume.id : null,
        targetRole: targetRole || 'Software Professional',
        ...analysisResult
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/resume/:id
async function getResumeById(req, res, next) {
  try {
    const { id } = req.params;
    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.',
        errors: ['Not found']
      });
    }

    // Security check: verify owner
    if (req.user && resume.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to resume.',
        errors: ['Forbidden']
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resume retrieved.',
      data: {
        ...resume,
        parsedData: typeof resume.parsedData === 'string' ? JSON.parse(resume.parsedData) : resume.parsedData
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/resume/:id/report (or /api/analysis/:id/report)
async function getResumeReport(req, res, next) {
  try {
    const { id } = req.params;

    // Check if ID belongs to an Analysis or a Resume
    let analysis = await prisma.analysis.findUnique({
      where: { id },
      include: { user: true, resume: true }
    });

    let resume = analysis ? analysis.resume : null;
    let user = analysis ? analysis.user : (req.user || {});

    if (!analysis) {
      // Try searching as resume ID
      resume = await prisma.resume.findUnique({
        where: { id },
        include: {
          user: true,
          analyses: { orderBy: { createdAt: 'desc' }, take: 1 }
        }
      });
      if (resume && resume.analyses.length > 0) {
        analysis = resume.analyses[0];
        user = resume.user;
      }
    }

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis report record not found.',
        errors: ['Report data unavailable']
      });
    }

    const structuredReport = generateStructuredReport(analysis, user, resume || {});

    res.status(200).json({
      success: true,
      message: 'Report data retrieved.',
      data: structuredReport
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/resume/:id
async function deleteResume(req, res, next) {
  try {
    const { id } = req.params;
    const resume = await prisma.resume.findUnique({ where: { id } });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.',
        errors: ['Not found']
      });
    }

    if (req.user && resume.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized action.',
        errors: ['Forbidden']
      });
    }

    await prisma.resume.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Resume and associated analyses deleted successfully.',
      data: {}
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/resumes
async function getUserResumes(req, res, next) {
  try {
    const userId = req.user.id;
    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'User resumes retrieved.',
      data: resumes.map(r => ({
        ...r,
        parsedData: typeof r.parsedData === 'string' ? JSON.parse(r.parsedData) : r.parsedData
      }))
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadResume,
  analyzeResume,
  getResumeById,
  getResumeReport,
  deleteResume,
  getUserResumes
};

