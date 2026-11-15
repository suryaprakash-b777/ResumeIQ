/**
 * ATS Resume Scoring Engine
 * Computes transparent category scores (0-100) and weighted final score.
 */

function calculateAtsScore({
  extractedSkills = [],
  targetRoleSkills = [],
  resumeText = '',
  parsedProfile = {},
  jobDescription = ''
}) {
  const normText = (resumeText || '').toLowerCase();
  const lowerExtracted = new Set(extractedSkills.map(s => s.toLowerCase()));

  // 1. Skills Relevance (30%)
  // Ratio of matched target role skills + richness of technical skill set
  let skillsRelevance = 50;
  if (targetRoleSkills.length > 0) {
    const matchedCount = targetRoleSkills.filter(ts => lowerExtracted.has(ts.toLowerCase())).length;
    const matchRatio = matchedCount / targetRoleSkills.length;
    skillsRelevance = Math.min(100, Math.round(matchRatio * 90 + Math.min(10, extractedSkills.length * 0.5)));
  } else {
    // General skill breadth if no role provided
    skillsRelevance = Math.min(95, Math.max(30, extractedSkills.length * 6));
  }

  // 2. Experience & Projects (20%)
  // Looks for measurable achievements (%, $, metrics), project descriptions, active links
  let experienceProjects = 40;
  const hasGithub = /(github\.com|git)/i.test(normText) || Boolean(parsedProfile.github);
  const hasMetrics = /\b(\d+%\s*|\$\d+|\d+\+?\s*(users|clients|requests|downloads|stars|projects|team members))\b/i.test(normText);
  const expItems = parsedProfile.experience || [];
  const projItems = parsedProfile.projects || [];
  const hasActionVerbs = /(developed|engineered|implemented|architected|optimized|led|designed|deployed|built)/i.test(normText);

  if (hasGithub) experienceProjects += 15;
  if (hasMetrics) experienceProjects += 20;
  if (hasActionVerbs) experienceProjects += 10;
  if (expItems.length > 0 || projItems.length > 0) experienceProjects += 15;
  experienceProjects = Math.min(100, Math.max(25, experienceProjects));

  // 3. Education & Certifications (15%)
  let educationCertifications = 40;
  const hasDegree = /(bachelor|master|b\.tech|m\.tech|b\.s|m\.s|degree|diploma|phd|computer science|engineering|information technology)/i.test(normText);
  const hasCerts = /(certified|certification|aws certified|oracle|google cloud|azure certified|coursera|udemy|edx)/i.test(normText) || (parsedProfile.certifications && parsedProfile.certifications.length > 0);
  const hasGpaOrYear = /\b(gpa|cgpa|201\d|202\d|graduated)\b/i.test(normText);

  if (hasDegree) educationCertifications += 35;
  if (hasCerts) educationCertifications += 20;
  if (hasGpaOrYear) educationCertifications += 5;
  educationCertifications = Math.min(100, Math.max(20, educationCertifications));

  // 4. Resume Structure (15%)
  // Checks presence of email, phone, location/links, summary, skills, experience, education, clean length
  let resumeStructure = 30;
  if (parsedProfile.email || /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(normText)) resumeStructure += 15;
  if (parsedProfile.phone || /\b\d{10}\b|\+\d{1,3}/.test(normText)) resumeStructure += 10;
  if (parsedProfile.summary || /(summary|profile|about me|objective)/i.test(normText)) resumeStructure += 15;
  if (extractedSkills.length >= 5) resumeStructure += 15;
  if (normText.length >= 400 && normText.length <= 15000) resumeStructure += 15;
  resumeStructure = Math.min(100, Math.max(25, resumeStructure));

  // 5. Keyword & ATS Compatibility (20%)
  let keywordCompatibility = 50;
  if (jobDescription && jobDescription.trim().length > 20) {
    const jdWords = jobDescription.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !isStopWord(w));

    const uniqueJdWords = Array.from(new Set(jdWords));
    const matchedJdWords = uniqueJdWords.filter(w => normText.includes(w));
    const matchPercent = uniqueJdWords.length > 0 ? (matchedJdWords.length / uniqueJdWords.length) : 0.5;
    keywordCompatibility = Math.min(100, Math.round(matchPercent * 100));
  } else {
    // Standard industry keywords density
    const standardKeywords = ['agile', 'api', 'development', 'software', 'performance', 'testing', 'design', 'collaboration', 'database', 'version control', 'security'];
    const matchedStd = standardKeywords.filter(k => normText.includes(k));
    keywordCompatibility = Math.min(95, Math.max(45, Math.round((matchedStd.length / standardKeywords.length) * 100)));
  }

  // Calculate Weighted Final Score
  const finalScore = Math.round(
    (skillsRelevance * 0.30) +
    (experienceProjects * 0.20) +
    (educationCertifications * 0.15) +
    (resumeStructure * 0.15) +
    (keywordCompatibility * 0.20)
  );

  return {
    atsScore: Math.min(100, Math.max(0, finalScore)),
    ratingLabel: getRatingLabel(finalScore),
    scoreBreakdown: {
      skillsRelevance,
      experienceProjects,
      educationCertifications,
      resumeStructure,
      keywordCompatibility
    }
  };
}

function getRatingLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Weak ATS Compatibility';
}

function isStopWord(word) {
  const common = new Set([
    'with', 'this', 'that', 'from', 'have', 'more', 'will', 'about', 'your',
    'which', 'their', 'work', 'experience', 'responsible', 'requirements',
    'skills', 'qualifications', 'ability', 'candidate', 'position', 'team'
  ]);
  return common.has(word);
}

module.exports = {
  calculateAtsScore,
  getRatingLabel
};

