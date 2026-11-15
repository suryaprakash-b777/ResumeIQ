/**
 * Static & AI Code Analysis Service
 * Inspects source code for security, anti-patterns, performance, and style.
 * Never executes user code on the host machine.
 */
const { analyzeCodeWithAI } = require('./geminiService');

async function processCodeAnalysis(code, language = 'javascript') {
  if (!code || code.trim().length === 0) {
    throw new Error('Code snippet is empty.');
  }

  const cleanCode = code.trim();

  let aiResult = null;
  try {
    aiResult = await analyzeCodeWithAI(cleanCode, language);
  } catch (err) {
    console.warn('Gemini code analysis unavailable/failed, using static analysis engine:', err.message);
  }

  if (aiResult && aiResult.codeQuality) {
    return {
      language,
      codeLength: cleanCode.length,
      linesOfCode: cleanCode.split('\n').length,
      ...aiResult
    };
  }

  // Static AST-like rule-based analyzer fallback
  return runStaticCodeAnalysis(cleanCode, language);
}

function runStaticCodeAnalysis(code, language) {
  const lines = code.split('\n');
  const issues = [];
  const recommendations = [];

  // 1. Secret / Credential Leaks
  const secretRegex = /(api[_-]?key|secret|password|auth[_-]?token|bearer\s+[a-z0-9-_]+)\s*=\s*['"][a-zA-Z0-9_\-]{8,}['"]/i;
  lines.forEach((line, idx) => {
    if (secretRegex.test(line)) {
      issues.push({
        severity: 'Critical',
        line: `Line ${idx + 1}`,
        title: 'Hardcoded Credential or Secret',
        description: 'Hardcoded secrets or API credentials in source files expose application systems to security breaches.',
        fix: 'Move sensitive values into secure environment variables (.env) or a secret manager.'
      });
    }
  });

  // 2. Dangerous eval / exec patterns
  lines.forEach((line, idx) => {
    if (/\beval\s*\(/.test(line) || /\bexec\s*\(/.test(line)) {
      issues.push({
        severity: 'Critical',
        line: `Line ${idx + 1}`,
        title: 'Arbitrary Code Execution (eval/exec)',
        description: 'Using eval() or exec() with untrusted inputs permits arbitrary code execution and injection attacks.',
        fix: 'Replace dynamic evaluation with explicit data mapping or safe parsers (e.g. JSON.parse).'
      });
    }
  });

  // 3. Debug Statements Left in Code
  lines.forEach((line, idx) => {
    if (/(console\.log|print\(|System\.out\.print|var_dump|fmt\.Println)/.test(line) && !line.trim().startsWith('//') && !line.trim().startsWith('#')) {
      issues.push({
        severity: 'Info',
        line: `Line ${idx + 1}`,
        title: 'Debugging Statement in Production Code',
        description: 'Unfiltered logging can leak internal state and degrade I/O performance under high concurrency.',
        fix: 'Use a structured logging library (e.g., Winston, Pino, Log4j) with configurable log levels.'
      });
    }
  });

  // 4. Missing Error Handling or Catch-All
  if (/(catch\s*\([^)]*\)\s*\{\s*\}|except:\s*pass)/.test(code)) {
    issues.push({
      severity: 'Warning',
      line: 'Catch Block',
      title: 'Empty Exception Handler (Swallowed Error)',
      description: 'Swallowing errors silently suppresses diagnostic context and leads to undefined system behavior.',
      fix: 'Properly log the error stack trace and return a structured failure response.'
    });
  }

  // Calculate complexity & score
  let complexity = 'Low';
  if (lines.length > 80 || (code.match(/for|while|if|switch/g) || []).length > 8) {
    complexity = 'High';
  } else if (lines.length > 30 || (code.match(/for|while|if|switch/g) || []).length > 4) {
    complexity = 'Medium';
  }

  const criticalCount = issues.filter(i => i.severity === 'Critical').length;
  const warningCount = issues.filter(i => i.severity === 'Warning').length;

  let qualityScore = 90 - (criticalCount * 25) - (warningCount * 10);
  qualityScore = Math.max(30, Math.min(98, qualityScore));

  let codeQuality = 'Good';
  if (qualityScore >= 85) codeQuality = 'Excellent';
  else if (qualityScore >= 70) codeQuality = 'Good';
  else if (qualityScore >= 50) codeQuality = 'Needs Improvement';
  else codeQuality = 'Poor';

  recommendations.push(`Adopt standard ${language.toUpperCase()} linting and formatting tooling (e.g., ESLint/Prettier/Ruff).`);
  recommendations.push('Enforce type safety or validation schemas on all function boundaries and payload inputs.');
  recommendations.push('Write comprehensive automated unit test suites targeting critical boundary branches.');

  // Generate clean optimized code suggestion
  let optimizedCode = code;
  // Clean console.log comments
  optimizedCode = optimizedCode.replace(/console\.log\([^)]*\);?/g, '// [Optimized: Replaced debug log with structured logger]');

  return {
    language,
    codeLength: code.length,
    linesOfCode: lines.length,
    issuesFound: issues.length,
    codeQuality,
    codeQualityScore: qualityScore,
    complexity,
    suggestionsCount: issues.length + recommendations.length,
    overview: `Analyzed ${lines.length} lines of ${language} code. Detected ${issues.length} potential issues across security, clean code conventions, and maintainability.`,
    issues,
    recommendations,
    optimizedCode
  };
}

module.exports = {
  processCodeAnalysis
};

