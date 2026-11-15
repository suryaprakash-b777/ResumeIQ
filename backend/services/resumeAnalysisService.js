/**
 * Comprehensive Resume Analysis Pipeline Orchestrator
 * Integrates text parsing, hybrid skill extraction, ATS scoring, role matching,
 * and Gemini AI recommendations with deterministic fallbacks.
 */
const { extractSkillsRuleBased, extractContactDetails, extractBasicSections, mergeSkills } = require('./skillExtractor');
const { calculateAtsScore } = require('./atsScorer');
const { matchJobRole } = require('./jobMatcher');
const {
  extractResumeDataWithAI,
  analyzeAtsQualityWithAI,
  analyzeSkillGapWithAI,
  generateCareerRoadmapWithAI
} = require('./geminiService');

async function processResumeAnalysis({
  resumeText,
  targetRole = '',
  jobDescription = ''
}) {
  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error('Resume text is empty or could not be extracted.');
  }

  // 1. Rule-based extraction
  const ruleSkillsObj = extractSkillsRuleBased(resumeText);
  const contacts = extractContactDetails(resumeText);
  const sections = extractBasicSections(resumeText);

  // 2. AI Structured Extraction with fallback
  let aiProfile = null;
  try {
    aiProfile = await extractResumeDataWithAI(resumeText);
  } catch (err) {
    console.warn('Gemini resume extraction skipped/failed, using rule-based profile:', err.message);
  }

  // Build merged candidate profile
  const mergedProfile = {
    name: (aiProfile && aiProfile.name) || contacts.name || 'Candidate',
    email: (aiProfile && aiProfile.email) || contacts.email || '',
    phone: (aiProfile && aiProfile.phone) || contacts.phone || '',
    linkedin: (aiProfile && aiProfile.linkedin) || contacts.linkedin || '',
    github: (aiProfile && aiProfile.github) || contacts.github || '',
    summary: (aiProfile && aiProfile.summary) || sections.summary || 'Demonstrated technical background with practical software engineering experience.',
    education: (aiProfile && aiProfile.education && aiProfile.education.length > 0) ? aiProfile.education : sections.education,
    experience: (aiProfile && aiProfile.experience && aiProfile.experience.length > 0) ? aiProfile.experience : sections.experience,
    projects: (aiProfile && aiProfile.projects && aiProfile.projects.length > 0) ? aiProfile.projects : sections.projects,
    certifications: (aiProfile && aiProfile.certifications && aiProfile.certifications.length > 0) ? aiProfile.certifications : sections.certifications
  };

  // 3. Merge skills
  const aiSkills = aiProfile ? [
    ...(aiProfile.technicalSkills || []),
    ...(aiProfile.softSkills || []),
    ...(aiProfile.tools || [])
  ] : [];

  const mergedSkills = mergeSkills(ruleSkillsObj.all, aiSkills);

  // 4. Job Role Match & Skill Gap
  const jobMatchResult = matchJobRole({
    extractedSkills: mergedSkills,
    targetRole,
    jobDescription,
    resumeText
  });

  // 5. ATS Scoring (Rule-based transparent engine)
  const atsResult = calculateAtsScore({
    extractedSkills: mergedSkills,
    targetRoleSkills: [...jobMatchResult.matchedSkills, ...jobMatchResult.missingSkills],
    resumeText,
    parsedProfile: mergedProfile,
    jobDescription
  });

  // 6. Gemini ATS Quality & Suggestions (with intelligent fallback)
  let aiQuality = null;
  try {
    aiQuality = await analyzeAtsQualityWithAI(resumeText, mergedSkills, targetRole, jobDescription);
  } catch (err) {
    console.warn('Gemini ATS quality review fallback:', err.message);
  }

  // 7. Career Roadmap (Gemini or deterministic 8-week curriculum)
  let aiRoadmap = null;
  try {
    aiRoadmap = await generateCareerRoadmapWithAI(mergedProfile, jobMatchResult.missingSkills, targetRole);
  } catch (err) {
    console.warn('Gemini roadmap generation fallback:', err.message);
  }

  // Build final harmonized results
  const strengths = (aiQuality && aiQuality.strengths && aiQuality.strengths.length > 0)
    ? aiQuality.strengths
    : generateDefaultStrengths(mergedSkills, mergedProfile);

  const weaknesses = (aiQuality && aiQuality.weaknesses && aiQuality.weaknesses.length > 0)
    ? aiQuality.weaknesses
    : generateDefaultWeaknesses(jobMatchResult.missingSkills);

  const improvementSuggestions = (aiQuality && aiQuality.improvementSuggestions && aiQuality.improvementSuggestions.length > 0)
    ? aiQuality.improvementSuggestions
    : generateDefaultSuggestions(jobMatchResult.missingSkills, atsResult.scoreBreakdown);

  const roadmap = (aiRoadmap && aiRoadmap.weeklyRoadmap && aiRoadmap.weeklyRoadmap.length > 0)
    ? aiRoadmap
    : generateDefaultRoadmap(targetRole || 'Full Stack Engineer', jobMatchResult.missingSkills);

  const finalAtsScore = (aiQuality && typeof aiQuality.atsScore === 'number')
    ? Math.round((atsResult.atsScore * 0.6) + (aiQuality.atsScore * 0.4))
    : atsResult.atsScore;

  return {
    parsedProfile: mergedProfile,
    atsScore: Math.min(100, Math.max(0, finalAtsScore)),
    jobMatchScore: jobMatchResult.jobMatchScore,
    scoreBreakdown: atsResult.scoreBreakdown,
    extractedSkills: {
      all: mergedSkills,
      categorized: ruleSkillsObj.categorized
    },
    matchedSkills: jobMatchResult.matchedSkills,
    missingSkills: jobMatchResult.missingSkills,
    missingKeywords: jobMatchResult.missingKeywords,
    roleFitExplanation: jobMatchResult.roleFitExplanation,
    recommendedRoles: jobMatchResult.recommendedRoles,
    strengths,
    weaknesses,
    improvementSuggestions,
    roadmap,
    geminiSummary: mergedProfile.summary
  };
}

function generateDefaultStrengths(skills, profile) {
  const list = [];
  if (skills.length >= 8) {
    list.push(`Strong multi-disciplinary skill repository across ${skills.slice(0, 4).join(', ')}.`);
  } else {
    list.push('Clear foundational core competencies aligned with modern software paradigms.');
  }
  if (profile.github) {
    list.push('Active developer presence highlighted with verifiable GitHub repositories.');
  }
  if (profile.education && profile.education.length > 0) {
    list.push('Relevant formal educational qualifications listed with degree and institution.');
  }
  list.push('Structured formatting enables rapid automated ATS parsing and recruiter skimming.');
  return list;
}

function generateDefaultWeaknesses(missingSkills) {
  const list = [];
  if (missingSkills.length > 0) {
    list.push(`Missing notable target competencies: ${missingSkills.slice(0, 3).join(', ')}.`);
  }
  list.push('Limited quantified business outcomes (e.g., % latency reduction, $ revenue impact, scale metrics).');
  list.push('Action verbs could be enhanced to highlight leadership and technical ownership.');
  return list;
}

function generateDefaultSuggestions(missingSkills, breakdown) {
  const list = [
    'Incorporate measurable metrics (e.g., "improved load time by 34%", "scaled API to 50k DAU").',
    'Add an executive 3-line professional summary at the very top showcasing domain expertise.',
    'Mirror high-value keywords from the job description in your projects and work history.'
  ];
  if (missingSkills.length > 0) {
    list.unshift(`Build a capstone project utilizing ${missingSkills.slice(0, 2).join(' and ')} to demonstrate direct proficiency.`);
  }
  return list;
}

function generateDefaultRoadmap(targetRole, missingSkills = []) {
  const topSkills = missingSkills.length > 0 ? missingSkills : ['System Architecture', 'Cloud Services', 'Docker', 'Testing'];
  return {
    careerPaths: [
      `${targetRole} (Immediate)`,
      `Senior ${targetRole} (2-3 years)`,
      `Lead Architect / Engineering Manager (5+ years)`
    ],
    weeklyRoadmap: [
      {
        week: 1,
        focus: `Foundations of ${topSkills[0] || 'Core Architecture'}`,
        skillsToLearn: [topSkills[0] || 'Modern Syntax', 'Design Patterns'],
        resources: ['Official Documentation', 'Interactive Tutorials'],
        miniProject: 'Build a modular prototype demonstrating separation of concerns'
      },
      {
        week: 2,
        focus: 'Advanced Concepts & API Design',
        skillsToLearn: ['RESTful Standards', 'Authentication & Security'],
        resources: ['OWASP Top 10 Security Guide', 'API Best Practices'],
        miniProject: 'Implement secure JWT-based micro-service endpoint'
      },
      {
        week: 3,
        focus: `Deep Dive: ${topSkills[1] || 'State & Persistence'}`,
        skillsToLearn: [topSkills[1] || 'Database Optimization', 'Query Tuning'],
        resources: ['Database Performance Manuals'],
        miniProject: 'Design indexing strategy and schema migration script'
      },
      {
        week: 4,
        focus: 'Caching, Performance & Scalability',
        skillsToLearn: ['Redis', 'In-memory caching', 'Connection Pooling'],
        resources: ['System Design Primer'],
        miniProject: 'Benchmark endpoint latency before and after caching layer'
      },
      {
        week: 5,
        focus: `DevOps & Containerization: ${topSkills[2] || 'Docker'}`,
        skillsToLearn: ['Docker', 'Multi-stage builds', 'Environment isolation'],
        resources: ['Docker Mastery Guide', 'CI/CD Handbook'],
        miniProject: 'Containerize multi-container web application with Docker Compose'
      },
      {
        week: 6,
        focus: 'Testing & Quality Assurance',
        skillsToLearn: ['Unit Testing', 'Integration Testing', 'Automated CI'],
        resources: ['Testing Best Practices Guide'],
        miniProject: 'Achieve 80%+ test coverage with GitHub Actions pipeline'
      },
      {
        week: 7,
        focus: 'Production Cloud Deployment & Monitoring',
        skillsToLearn: ['Cloud Hosting', 'Logging', 'Healthchecks'],
        resources: ['AWS/Cloud Architecture Well-Architected Framework'],
        miniProject: 'Deploy live application with SSL, monitoring, and automated alerts'
      },
      {
        week: 8,
        focus: 'Portfolio Polish, Resume Update & Mock Interviews',
        skillsToLearn: ['Behavioral STAR Method', 'System Design Interview Questions'],
        resources: ['Tech Interview Handbook', 'LeetCode / HackerRank Patterns'],
        miniProject: 'Publish live portfolio showcase and publish technical blog post'
      }
    ],
    interviewTopics: [
      'Core language idioms and memory management',
      'System design: rate limiting, caching, and database sharding',
      'Asynchronous programming, event loops, and concurrency',
      'Secure authentication, authorization, and data encryption'
    ],
    portfolioProjectIdeas: [
      {
        title: `Enterprise ${targetRole} Solution`,
        description: `Full-stack production platform integrating automated workflows, real-time metrics, and cloud deployment.`,
        techStack: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS']
      },
      {
        title: 'Distributed Event Monitoring Dashboard',
        description: 'Scalable data ingest system with dynamic charts, websocket streaming, and alert triggers.',
        techStack: ['TypeScript', 'Next.js', 'Redis', 'Tailwind CSS']
      }
    ]
  };
}

module.exports = {
  processResumeAnalysis
};

