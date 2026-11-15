/**
 * Google Gemini Integration Service
 * Handles structured AI extraction, resume evaluation, code inspection,
 * multimodal image analysis, and conversational intelligence with safe JSON parsing and retries.
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

let genAI = null;
if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key' && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

function getModel(modelName = 'gemini-1.5-flash', isJson = true) {
  if (!genAI) {
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key') {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    } else {
      return null;
    }
  }

  const config = isJson ? { responseMimeType: 'application/json' } : {};
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: config
  });
}

/**
 * Safely parse JSON from LLM responses, stripping any markdown backticks
 */
function cleanAndParseJson(text) {
  if (!text || typeof text !== 'string') return null;

  let cleaned = text.trim();
  // Strip markdown code fences if model included them
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt relaxed bracket slice
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch (innerErr) {
        // Fallback for arrays
        const firstBracket = cleaned.indexOf('[');
        const lastBracket = cleaned.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
          return JSON.parse(cleaned.substring(firstBracket, lastBracket + 1));
        }
      }
    }
    throw new Error(`JSON parse failed: ${err.message}`);
  }
}

/**
 * Helper to execute Gemini prompt with timeout and 1 automatic retry
 */
async function callGeminiWithRetry(prompt, isJson = true, modelName = 'gemini-1.5-flash') {
  const model = getModel(modelName, isJson);
  if (!model) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const execute = async () => {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  };

  try {
    const raw = await execute();
    return isJson ? cleanAndParseJson(raw) : raw;
  } catch (err) {
    console.warn('Initial Gemini attempt failed, retrying once...', err.message);
    try {
      const raw = await execute();
      return isJson ? cleanAndParseJson(raw) : raw;
    } catch (retryErr) {
      console.error('Gemini retry also failed:', retryErr.message);
      throw retryErr;
    }
  }
}

// ==========================================
// TASK 1: Resume Structured Extraction
// ==========================================
async function extractResumeDataWithAI(resumeText) {
  const prompt = `
You are an expert ATS parser. Extract structured information from the following resume text.
Return ONLY valid JSON matching this exact structure:
{
  "name": "Candidate Full Name",
  "email": "email@example.com",
  "phone": "+1 234 567 8900",
  "linkedin": "url or handle",
  "github": "url or handle",
  "education": ["Degree, Major, Institution, Year"],
  "experience": ["Role, Company, Duration, Key achievements"],
  "projects": ["Project Name: Description and technologies used"],
  "certifications": ["Certification Name - Issuer"],
  "technicalSkills": ["Skill 1", "Skill 2"],
  "softSkills": ["Skill 1", "Skill 2"],
  "tools": ["Tool 1", "Tool 2"],
  "summary": "2-3 sentence executive summary of the candidate"
}

Resume Text:
"""
${resumeText.slice(0, 10000)}
"""
`;

  return await callGeminiWithRetry(prompt, true);
}

// ==========================================
// TASK 2: ATS and Resume Quality Analysis
// ==========================================
async function analyzeAtsQualityWithAI(resumeText, extractedSkills = [], targetRole = '', jobDescription = '') {
  const prompt = `
You are a senior technical recruiter and ATS expert.
Evaluate this resume for target role "${targetRole || 'Software Professional'}".
${jobDescription ? `Job Description: """${jobDescription.slice(0, 2000)}"""` : ''}

Extracted Skills: ${extractedSkills.join(', ')}

Resume Content:
"""
${resumeText.slice(0, 8000)}
"""

Return ONLY valid JSON matching this exact structure:
{
  "atsScore": 82,
  "scoreBreakdown": {
    "skillsRelevance": 85,
    "experienceProjects": 80,
    "educationCertifications": 75,
    "resumeStructure": 90,
    "keywordCompatibility": 80
  },
  "strengths": [
    "Specific strong point with evidence from resume",
    "Another demonstrable strength"
  ],
  "weaknesses": [
    "Specific area of weakness or omission",
    "Missing metrics or clarity issue"
  ],
  "improvementSuggestions": [
    "Actionable bullet point improvement recommendation",
    "Keyword or structural optimization advice"
  ]
}
`;

  return await callGeminiWithRetry(prompt, true);
}

// ==========================================
// TASK 3: Skill Gap and Job Match Analysis
// ==========================================
async function analyzeSkillGapWithAI(extractedSkills = [], targetRole = '', jobDescription = '') {
  const prompt = `
You are an AI career strategist.
Compare the candidate's skills with the target role "${targetRole || 'Software Engineer'}" and/or job description.

Candidate Skills: ${extractedSkills.join(', ')}
${jobDescription ? `Job Description:\n"""${jobDescription.slice(0, 2000)}"""` : ''}

Return ONLY valid JSON with this exact structure:
{
  "jobMatchScore": 78,
  "matchedSkills": ["Skill A", "Skill B"],
  "missingSkills": ["Critical Skill 1", "Critical Skill 2"],
  "missingKeywords": ["Keyword 1", "Keyword 2"],
  "roleFitExplanation": "Concise paragraph explaining how well the candidate aligns with the role.",
  "recommendedRoles": [
    {
      "title": "Role Title",
      "category": "Domain",
      "matchPercentage": 85,
      "description": "Why candidate qualifies for this role"
    }
  ]
}
`;

  return await callGeminiWithRetry(prompt, true);
}

// ==========================================
// TASK 4: Career Roadmap Generator
// ==========================================
async function generateCareerRoadmapWithAI(profile = {}, missingSkills = [], targetRole = '') {
  const prompt = `
You are a principal tech mentor. Design an 8-week personalized learning roadmap for a professional aiming to excel as "${targetRole || 'Full Stack Engineer'}".
Target Missing Skills to bridge: ${missingSkills.slice(0, 10).join(', ') || 'Modern cloud, testing, and system design'}

Candidate background summary: ${profile.summary || 'Aspiring software practitioner'}

Return ONLY valid JSON with this exact structure:
{
  "careerPaths": [
    "Alternative or ascending career trajectory 1",
    "Career trajectory 2"
  ],
  "weeklyRoadmap": [
    {
      "week": 1,
      "focus": "Core concept focus",
      "skillsToLearn": ["Skill A", "Skill B"],
      "resources": ["Official Documentation", "Recommended course/guide topic"],
      "miniProject": "Actionable hands-on coding task"
    },
    {
      "week": 2,
      "focus": "...",
      "skillsToLearn": ["..."],
      "resources": ["..."],
      "miniProject": "..."
    },
    {
      "week": 3,
      "focus": "...",
      "skillsToLearn": ["..."],
      "resources": ["..."],
      "miniProject": "..."
    },
    {
      "week": 4,
      "focus": "...",
      "skillsToLearn": ["..."],
      "resources": ["..."],
      "miniProject": "..."
    },
    {
      "week": 5,
      "focus": "...",
      "skillsToLearn": ["..."],
      "resources": ["..."],
      "miniProject": "..."
    },
    {
      "week": 6,
      "focus": "...",
      "skillsToLearn": ["..."],
      "resources": ["..."],
      "miniProject": "..."
    },
    {
      "week": 7,
      "focus": "...",
      "skillsToLearn": ["..."],
      "resources": ["..."],
      "miniProject": "..."
    },
    {
      "week": 8,
      "focus": "Final integration, portfolio deployment and interview readiness",
      "skillsToLearn": ["Production deployment", "Monitoring", "CI/CD"],
      "resources": ["Cloud deployment guides"],
      "miniProject": "Deploy full end-to-end project to public cloud"
    }
  ],
  "interviewTopics": [
    "System Design & Scalability",
    "Data Structures & Algorithmic Problem Solving",
    "API Security & Authentication Patterns",
    "Concurrency and Async Performance"
  ],
  "portfolioProjectIdeas": [
    {
      "title": "Production SaaS Platform",
      "description": "Full-stack application featuring role-based auth, caching, and payment or AI webhooks.",
      "techStack": ["React", "Node.js", "PostgreSQL", "Redis", "Docker"]
    },
    {
      "title": "High-Throughput Analytics Pipeline",
      "description": "Real-time event processing dashboard with WebSocket updates and data aggregation.",
      "techStack": ["TypeScript", "Next.js", "FastAPI", "Kafka/RabbitMQ"]
    }
  ]
}
`;

  return await callGeminiWithRetry(prompt, true);
}

// ==========================================
// TEXT ANALYZER
// ==========================================
async function analyzeTextWithAI(text) {
  const prompt = `
Analyze the following document or text thoroughly.
Text:
"""
${text.slice(0, 12000)}
"""

Return ONLY valid JSON with this exact structure:
{
  "summary": "Executive summary of the document (2-4 sentences)",
  "detailedSummary": "A comprehensive paragraph explaining main themes and implications",
  "sentiment": "Positive" | "Neutral" | "Negative",
  "sentimentScore": 85, // 0 to 100 confidence
  "keyPoints": [
    "Key takeaway point 1",
    "Key takeaway point 2",
    "Key takeaway point 3",
    "Key takeaway point 4"
  ],
  "keywords": ["Keyword1", "Keyword2", "Keyword3", "Keyword4", "Keyword5", "Keyword6"],
  "readingTimeMinutes": 2,
  "wordCount": 350
}
`;

  return await callGeminiWithRetry(prompt, true);
}

// ==========================================
// CODE ANALYZER
// ==========================================
async function analyzeCodeWithAI(code, language = 'javascript') {
  const prompt = `
You are a Principal Software Engineer and Automated Code Reviewer.
Analyze the following ${language} code for bugs, security vulnerabilities, anti-patterns, performance bottlenecks, and style issues.

Code:
\`\`\`${language}
${code.slice(0, 10000)}
\`\`\`

Return ONLY valid JSON with this exact structure:
{
  "issuesFound": 3,
  "codeQuality": "Good" | "Excellent" | "Needs Improvement" | "Poor",
  "codeQualityScore": 80, // 0 to 100
  "complexity": "Low" | "Medium" | "High",
  "suggestionsCount": 4,
  "overview": "Brief assessment of the codebase quality and architecture",
  "issues": [
    {
      "severity": "Critical" | "Warning" | "Info",
      "line": "approximate line number or snippet",
      "title": "Brief title of the issue",
      "description": "Clear explanation of the bug or smell and why it is problematic",
      "fix": "Actionable guidance or code fix"
    }
  ],
  "recommendations": [
    "Best practice recommendation 1",
    "Best practice recommendation 2"
  ],
  "optimizedCode": "The full or refactored snippet incorporating fixes and clean standards"
}
`;

  return await callGeminiWithRetry(prompt, true);
}

// ==========================================
// MULTIMODAL IMAGE ANALYZER
// ==========================================
async function analyzeImageWithAI(imageBuffer, mimeType = 'image/jpeg') {
  const model = getModel('gemini-1.5-flash', true);
  if (!model) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const base64Data = imageBuffer.toString('base64');
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType || 'image/jpeg'
    }
  };

  const prompt = `
Examine this image in high detail.
Return ONLY valid JSON matching this exact structure:
{
  "description": "Comprehensive narrative description of the scene and content",
  "mainSubjects": ["Subject 1", "Subject 2"],
  "detectedObjects": [
    { "name": "Object name", "confidence": 95, "location": "center/left/foreground" }
  ],
  "colors": ["Primary Blue", "Warm White", "Charcoal"],
  "sceneType": "Outdoor/Indoor/Diagram/Screenshot/Document",
  "insights": [
    "Notable AI insight or deduction 1",
    "Notable AI insight 2"
  ],
  "textDetected": "Any readable text extracted from the image if present, or null"
}
`;

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  return cleanAndParseJson(response.text());
}

// ==========================================
// DATA ANALYZER INSIGHTS
// ==========================================
async function analyzeDataInsightsWithAI(dataSummary) {
  const prompt = `
You are a Lead Data Scientist. Analyze the dataset summary statistics below and produce intelligent strategic observations and actionable insights.

Dataset Summary:
${JSON.stringify(dataSummary, null, 2)}

Return ONLY valid JSON with this exact structure:
{
  "executiveSummary": "Overall analysis of the dataset distributions and health",
  "dataQuality": "High" | "Moderate" | "Requires Cleaning",
  "keyObservations": [
    "Key analytical observation with specific metrics",
    "Distribution anomaly or trend highlighted"
  ],
  "actionableRecommendations": [
    "Strategic business or operational recommendation based on data",
    "Follow-up exploratory direction"
  ],
  "potentialBiases": [
    "Possible data skew, outliers, or missing sample warnings"
  ]
}
`;

  return await callGeminiWithRetry(prompt, true);
}

// ==========================================
// GENERAL AI CHAT
// ==========================================
async function generalAiChat(messages = [], currentMessage = '', contextText = '') {
  const model = getModel('gemini-1.5-flash', false); // plain text/markdown
  if (!model) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  let prompt = `You are AI Analyzer, a smart, helpful, expert AI assistant.\n`;
  if (contextText) {
    prompt += `Reference Document/Context:\n"""\n${contextText.slice(0, 5000)}\n"""\n\n`;
  }

  prompt += `Conversation history:\n`;
  for (const m of messages.slice(-8)) {
    prompt += `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}\n`;
  }
  prompt += `User: ${currentMessage}\nAssistant:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

module.exports = {
  getModel,
  cleanAndParseJson,
  extractResumeDataWithAI,
  analyzeAtsQualityWithAI,
  analyzeSkillGapWithAI,
  generateCareerRoadmapWithAI,
  analyzeTextWithAI,
  analyzeCodeWithAI,
  analyzeImageWithAI,
  analyzeDataInsightsWithAI,
  generalAiChat
};

