/**
 * Hybrid Skill and Resume Information Extractor
 * Rule-based dictionary matching + regex heuristics
 */
const { SKILL_DICTIONARY, ALL_SKILLS } = require('../utils/skillDictionary');

function extractSkillsRuleBased(text) {
  if (!text || typeof text !== 'string') {
    return {
      all: [],
      categorized: {
        frontend: [],
        backend: [],
        databases: [],
        ai_ml: [],
        cloud_devops: [],
        data: [],
        soft_skills: []
      }
    };
  }

  const normalizedText = text.toLowerCase();
  const foundSkillsSet = new Set();
  const categorized = {
    frontend: [],
    backend: [],
    databases: [],
    ai_ml: [],
    cloud_devops: [],
    data: [],
    soft_skills: []
  };

  for (const [category, skills] of Object.entries(SKILL_DICTIONARY)) {
    for (const skill of skills) {
      // Escape regex special chars except dots and hyphens
      const escapedSkill = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      // Use boundary-aware matching
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escapedSkill}(?:$|[^a-zA-Z0-9_#+])`, 'i');

      if (regex.test(normalizedText)) {
        if (!foundSkillsSet.has(skill.toLowerCase())) {
          foundSkillsSet.add(skill.toLowerCase());
          if (categorized[category]) {
            categorized[category].push(skill);
          }
        }
      }
    }
  }

  const all = Array.from(foundSkillsSet).map(s => {
    // Return original casing from ALL_SKILLS where possible
    const match = ALL_SKILLS.find(item => item.toLowerCase() === s);
    return match || (s.charAt(0).toUpperCase() + s.slice(1));
  });

  return {
    all,
    categorized
  };
}

function extractContactDetails(text) {
  if (!text) return { email: '', phone: '', linkedin: '', github: '', name: '' };

  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  const emails = text.match(emailRegex) || [];
  const email = emails[0] || '';

  const phoneRegex = /(?:(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}|\b\d{10}\b)/g;
  const phones = text.match(phoneRegex) || [];
  const phone = phones.find(p => p.replace(/\D/g, '').length >= 10) || '';

  const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|profile)\/([a-zA-Z0-9_-]+)/gi;
  const linkedinMatch = linkedinRegex.exec(text);
  const linkedin = linkedinMatch ? linkedinMatch[0] : '';

  const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/gi;
  const githubMatch = githubRegex.exec(text);
  const github = githubMatch ? githubMatch[0] : '';

  // Candidate name heuristic: First non-empty lines that don't look like labels or contact details
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let name = '';
  for (const line of lines.slice(0, 5)) {
    if (!line.includes('@') && !line.includes('http') && !line.includes('www.') && line.length < 50) {
      if (/^[a-zA-Z\s.'-]+$/.test(line) && line.split(' ').length >= 2 && line.split(' ').length <= 4) {
        name = line;
        break;
      }
    }
  }

  return {
    name: name || 'Candidate',
    email,
    phone,
    linkedin,
    github
  };
}

function extractBasicSections(text) {
  const sections = {
    summary: '',
    education: [],
    experience: [],
    projects: [],
    certifications: []
  };

  if (!text) return sections;

  const lines = text.split('\n');
  let currentSection = '';
  const buffer = {
    summary: [],
    education: [],
    experience: [],
    projects: [],
    certifications: []
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();

    if (/^(education|academic background|qualifications)/i.test(lower)) {
      currentSection = 'education';
      continue;
    } else if (/^(experience|work experience|employment history|work history)/i.test(lower)) {
      currentSection = 'experience';
      continue;
    } else if (/^(projects|technical projects|personal projects|key projects)/i.test(lower)) {
      currentSection = 'projects';
      continue;
    } else if (/^(certifications|certificates|licenses|achievements)/i.test(lower)) {
      currentSection = 'certifications';
      continue;
    } else if (/^(summary|professional summary|objective|about me)/i.test(lower)) {
      currentSection = 'summary';
      continue;
    } else if (/^(skills|technical skills|core competencies)/i.test(lower)) {
      currentSection = 'skills';
      continue;
    }

    if (currentSection && buffer[currentSection] && trimmed.length > 0) {
      buffer[currentSection].push(trimmed);
    }
  }

  sections.summary = buffer.summary.slice(0, 4).join(' ');
  sections.education = buffer.education.slice(0, 8);
  sections.experience = buffer.experience.slice(0, 15);
  sections.projects = buffer.projects.slice(0, 12);
  sections.certifications = buffer.certifications.slice(0, 8);

  return sections;
}

function mergeSkills(ruleSkills = [], aiSkills = []) {
  const uniqueMap = new Map();

  for (const s of ruleSkills) {
    if (s && typeof s === 'string') {
      uniqueMap.set(s.toLowerCase(), s.trim());
    }
  }

  for (const s of aiSkills) {
    if (s && typeof s === 'string') {
      const lower = s.toLowerCase();
      if (!uniqueMap.has(lower)) {
        uniqueMap.set(lower, s.trim());
      }
    }
  }

  return Array.from(uniqueMap.values());
}

module.exports = {
  extractSkillsRuleBased,
  extractContactDetails,
  extractBasicSections,
  mergeSkills
};

