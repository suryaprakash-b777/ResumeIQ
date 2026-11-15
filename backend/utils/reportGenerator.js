/**
 * Prepares structured report data for PDF generation and export
 */
function generateStructuredReport(analysis, user = {}, resume = {}) {
  const parsedData = typeof resume.parsedData === 'string'
    ? JSON.parse(resume.parsedData || '{}')
    : (resume.parsedData || {});

  const scoreBreakdown = typeof analysis.scoreBreakdown === 'string'
    ? JSON.parse(analysis.scoreBreakdown || '{}')
    : (analysis.scoreBreakdown || {});

  const extractedSkills = typeof analysis.extractedSkills === 'string'
    ? JSON.parse(analysis.extractedSkills || '{}')
    : (analysis.extractedSkills || {});

  const matchedSkills = typeof analysis.matchedSkills === 'string'
    ? JSON.parse(analysis.matchedSkills || '[]')
    : (analysis.matchedSkills || []);

  const missingSkills = typeof analysis.missingSkills === 'string'
    ? JSON.parse(analysis.missingSkills || '[]')
    : (analysis.missingSkills || []);

  const missingKeywords = typeof analysis.missingKeywords === 'string'
    ? JSON.parse(analysis.missingKeywords || '[]')
    : (analysis.missingKeywords || []);

  const strengths = typeof analysis.strengths === 'string'
    ? JSON.parse(analysis.strengths || '[]')
    : (analysis.strengths || []);

  const weaknesses = typeof analysis.weaknesses === 'string'
    ? JSON.parse(analysis.weaknesses || '[]')
    : (analysis.weaknesses || []);

  const improvementSuggestions = typeof analysis.improvementSuggestions === 'string'
    ? JSON.parse(analysis.improvementSuggestions || '[]')
    : (analysis.improvementSuggestions || []);

  const recommendedRoles = typeof analysis.recommendedRoles === 'string'
    ? JSON.parse(analysis.recommendedRoles || '[]')
    : (analysis.recommendedRoles || []);

  const roadmap = typeof analysis.roadmap === 'string'
    ? JSON.parse(analysis.roadmap || '{}')
    : (analysis.roadmap || {});

  return {
    meta: {
      reportId: analysis.id,
      generatedAt: new Date().toISOString(),
      userName: user.name || parsedData.name || 'Candidate',
      userEmail: user.email || parsedData.email || 'N/A',
      fileName: resume.fileName || analysis.inputFileName || 'Resume Document',
      targetRole: analysis.targetRole || 'Software Professional',
      analyzerType: analysis.analyzerType || 'resume'
    },
    scores: {
      atsScore: analysis.atsScore || 0,
      jobMatchScore: analysis.jobMatchScore || 0,
      ratingLabel: getRatingLabel(analysis.atsScore || 0),
      breakdown: {
        skillsRelevance: scoreBreakdown.skillsRelevance || 0,
        experienceProjects: scoreBreakdown.experienceProjects || 0,
        educationCertifications: scoreBreakdown.educationCertifications || 0,
        resumeStructure: scoreBreakdown.resumeStructure || 0,
        keywordCompatibility: scoreBreakdown.keywordCompatibility || 0
      }
    },
    candidateProfile: {
      name: parsedData.name || user.name || 'Candidate',
      email: parsedData.email || user.email || '',
      phone: parsedData.phone || '',
      linkedin: parsedData.linkedin || '',
      github: parsedData.github || '',
      summary: parsedData.summary || analysis.geminiSummary || '',
      education: parsedData.education || [],
      experience: parsedData.experience || [],
      projects: parsedData.projects || [],
      certifications: parsedData.certifications || []
    },
    skillsAnalysis: {
      matchedSkills,
      missingSkills,
      missingKeywords,
      allExtracted: extractedSkills
    },
    evaluations: {
      strengths,
      weaknesses,
      improvementSuggestions,
      recommendedRoles
    },
    careerRoadmap: roadmap
  };
}

function getRatingLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Weak ATS Compatibility';
}

module.exports = {
  generateStructuredReport,
  getRatingLabel
};

