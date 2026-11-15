/**
 * Job Role Matching & Skill Gap Analysis Service
 */
const { ROLE_TEMPLATES } = require('../utils/roleTemplates');
const { ALL_SKILLS } = require('../utils/skillDictionary');

function matchJobRole({
  extractedSkills = [],
  targetRole = '',
  jobDescription = '',
  resumeText = ''
}) {
  const normExtracted = new Set(extractedSkills.map(s => s.toLowerCase()));
  const normText = (resumeText || '').toLowerCase();

  // Find matching template if targetRole is provided
  let targetTemplate = null;
  if (targetRole) {
    targetTemplate = ROLE_TEMPLATES.find(
      r => r.title.toLowerCase() === targetRole.toLowerCase() ||
           r.title.toLowerCase().includes(targetRole.toLowerCase())
    );
  }

  let requiredSkills = [];
  let preferredSkills = [];

  if (targetTemplate) {
    requiredSkills = targetTemplate.requiredSkills;
    preferredSkills = targetTemplate.preferredSkills;
  }

  // If a job description was provided, extract additional target skills from it
  let jdSkills = [];
  let jdKeywords = [];
  if (jobDescription && jobDescription.trim().length > 10) {
    const jdLower = jobDescription.toLowerCase();
    jdSkills = ALL_SKILLS.filter(skill => {
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}(?:$|[^a-zA-Z0-9_#+])`, 'i');
      return regex.test(jdLower);
    });

    // Extract notable keywords from JD that are missing in resume
    const words = jobDescription.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 4 && !isGenericWord(w));

    const wordCounts = {};
    for (const w of words) {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    }

    jdKeywords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .filter(w => !normText.includes(w))
      .slice(0, 8);
  }

  // Combine target skills (merging template + jd skills)
  const combinedTargetSkills = Array.from(new Set([
    ...requiredSkills,
    ...preferredSkills,
    ...jdSkills
  ]));

  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of combinedTargetSkills) {
    if (normExtracted.has(skill.toLowerCase()) || normText.includes(skill.toLowerCase())) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  // Compute job match score
  let jobMatchScore = 70;
  if (combinedTargetSkills.length > 0) {
    const matchRatio = matchedSkills.length / combinedTargetSkills.length;
    jobMatchScore = Math.min(100, Math.round(matchRatio * 100));
  } else if (extractedSkills.length > 0) {
    jobMatchScore = Math.min(85, Math.max(45, extractedSkills.length * 6));
  }

  // Generate fallback recommended roles based on extracted skills
  const recommendedRoles = recommendRolesFromSkills(extractedSkills);

  // Generate natural language explanation
  let roleFitExplanation = '';
  const roleName = targetRole || (targetTemplate ? targetTemplate.title : 'Software Developer');
  if (jobMatchScore >= 80) {
    roleFitExplanation = `Strong alignment with ${roleName}. You possess ${matchedSkills.length} key competencies including ${matchedSkills.slice(0, 3).join(', ')}.`;
  } else if (jobMatchScore >= 60) {
    roleFitExplanation = `Moderate alignment with ${roleName}. You have foundational knowledge in ${matchedSkills.slice(0, 3).join(', ')}, but bridging gaps in ${missingSkills.slice(0, 3).join(', ')} will significantly boost your interview callback rate.`;
  } else {
    roleFitExplanation = `Emerging profile for ${roleName}. High-priority skills such as ${missingSkills.slice(0, 3).join(', ')} should be acquired and demonstrated in active portfolio projects.`;
  }

  return {
    jobMatchScore,
    matchedSkills,
    missingSkills,
    missingKeywords: jdKeywords.length > 0 ? jdKeywords : ['Unit Testing', 'CI/CD Pipelines', 'Performance Optimization', 'Architecture', 'System Design'],
    roleFitExplanation,
    recommendedRoles
  };
}

function recommendRolesFromSkills(skills = []) {
  const normSkills = new Set(skills.map(s => s.toLowerCase()));
  const scoredRoles = ROLE_TEMPLATES.map(template => {
    const allRoleSkills = [...template.requiredSkills, ...template.preferredSkills];
    const matches = allRoleSkills.filter(s => normSkills.has(s.toLowerCase())).length;
    const score = Math.round((matches / allRoleSkills.length) * 100);
    return {
      title: template.title,
      category: template.category,
      matchPercentage: Math.max(20, Math.min(100, score)),
      description: template.description
    };
  });

  return scoredRoles.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 3);
}

function isGenericWord(w) {
  const generic = new Set([
    'about', 'after', 'again', 'against', 'almost', 'along', 'already', 'also', 'although',
    'always', 'among', 'another', 'around', 'because', 'before', 'being', 'between',
    'candidate', 'company', 'position', 'requirements', 'responsibilities', 'experience',
    'should', 'their', 'there', 'these', 'those', 'through', 'under', 'using', 'which',
    'while', 'would', 'working', 'years', 'skills', 'ability'
  ]);
  return generic.has(w);
}

module.exports = {
  matchJobRole,
  recommendRolesFromSkills
};

