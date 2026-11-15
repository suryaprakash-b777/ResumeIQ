import React, { useState } from 'react';
import {
  Code2,
  Upload,
  Sparkles,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  FileCode,
  ShieldAlert,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import ResultCard from '../components/ResultCard';
import ScoreCard from '../components/ScoreCard';
import { codeAPI } from '../services/api';

const SAMPLE_CODE = {
  javascript: `// Authentication & User Data Fetcher
const apiKey = "AIzaSyB123_SECRET_KEY_EXPOSED"; // Warning: hardcoded credential

function fetchUserData(userId) {
  console.log("Fetching user data for:", userId);
  
  if (userId == null) {
    throw new Error("Missing ID");
  }

  // Potential SQL Injection or dynamic evaluation risk
  const query = "SELECT * FROM users WHERE id = " + userId;
  
  try {
    const result = eval("({ id: " + userId + ", active: true })");
    return result;
  } catch (err) {
    // Swallowed error
  }
}`,
  python: `# Data processor script
import os
SECRET_TOKEN = "sk-live-99283471029384729"

def process_records(items):
    print("Processing items...")
    results = []
    for i in range(len(items)):
        try:
            val = items[i] * 2
            results.append(val)
        except:
            pass # Silent failure
    return results`,
  java: `public class PaymentService {
    private String stripeSecret = "sk_live_enterprise_82937482";

    public void processPayment(double amount) {
        System.out.println("Processing payment: " + amount);
        if (amount <= 0) {
            throw new IllegalArgumentException("Invalid amount");
        }
    }
}`
};

export default function CodeAnalyzer() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(SAMPLE_CODE.javascript);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (SAMPLE_CODE[lang]) {
      setCode(SAMPLE_CODE[lang]);
    }
    setResult(null);
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setCode(event.target.result);
        toast.success(`Loaded ${selected.name}`);
      };
      reader.readAsText(selected);
    }
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast.error('Please input code or upload a file.');
      return;
    }

    try {
      setLoading(true);
      const res = await codeAPI.analyzeCode({ code, language });
      if (res.success && res.data) {
        setResult(res.data);
        toast.success('Code audit completed!');
      }
    } catch (err) {
      toast.error(err.message || 'Code analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOptimized = () => {
    if (result?.optimizedCode) {
      navigator.clipboard.writeText(result.optimizedCode);
      setCopied(true);
      toast.success('Optimized code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="pb-6 border-b border-[#E8ECF4] dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            Module 03
          </span>
          <span className="text-xs text-[#7C879B] dark:text-slate-400">• Static Analysis & Automated Code Review</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17243D] dark:text-white tracking-tight">
          Code Analyzer
        </h1>
        <p className="text-sm text-[#7C879B] dark:text-slate-400 mt-1">
          Inspect source code for security vulnerabilities, bugs, cyclomatic complexity, and generate optimized refactors.
        </p>
      </div>

      {/* Two-Column Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: CODE INPUT */}
        <div className="lg:col-span-5 space-y-6">
          <ResultCard title="Source Code Editor" icon={Code2}>
            <div className="space-y-4">
              {/* Language Selector & File Upload */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7C879B] dark:text-slate-400 mb-1">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#17243D] dark:text-white text-xs font-semibold focus:outline-none focus:border-[#3867F5]"
                  >
                    <option value="javascript">JavaScript (Node / React)</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                    <option value="php">PHP</option>
                    <option value="go">Go</option>
                  </select>
                </div>

                <div className="shrink-0 self-end">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-[#17243D] dark:text-white border border-[#E8ECF4] dark:border-slate-700 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#3867F5]" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Code Textarea with mono font */}
              <div className="relative">
                <textarea
                  rows={14}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste or write code to analyze..."
                  className="w-full p-4 font-mono text-xs leading-relaxed rounded-2xl border border-[#E8ECF4] dark:border-slate-700 bg-slate-900 text-emerald-400 dark:bg-slate-950 focus:outline-none focus:border-[#3867F5] transition-all resize-none shadow-inner"
                  spellCheck={false}
                />
                <div className="flex items-center justify-between text-[11px] text-[#7C879B] px-1 mt-1 font-mono">
                  <span>{code.split('\n').length} lines</span>
                  <span>{code.length} characters</span>
                </div>
              </div>

              {/* Analyze Button */}
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading || !code.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-[#3867F5] hover:bg-[#2B52D9] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Auditing Source Code...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Code</span>
                  </>
                )}
              </button>
            </div>
          </ResultCard>
        </div>

        {/* RIGHT PANEL: ANALYSIS RESULTS */}
        <div className="lg:col-span-7 space-y-6">
          {!result ? (
            <div className="p-10 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8ECF4] dark:border-slate-800 shadow-card text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <FileCode className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#17243D] dark:text-white">
                No Code Inspected Yet
              </h3>
              <p className="text-xs text-[#7C879B] dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Submit a source snippet on the left to uncover potential vulnerabilities, cyclomatic complexity scores, and refactoring advice.
              </p>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <ScoreCard
                  title="Issues Found"
                  score={result.issuesFound}
                  icon={ShieldAlert}
                  label={result.issuesFound === 0 ? 'Clean' : `${result.issuesFound} detected`}
                />

                <ScoreCard
                  title="Code Quality"
                  score={result.codeQuality}
                  icon={CheckCircle2}
                  label={`${result.codeQualityScore || 80}%`}
                />

                <ScoreCard
                  title="Suggestions"
                  score={result.suggestionsCount || 3}
                  icon={Zap}
                  label="Optimizations"
                />

                <ScoreCard
                  title="Complexity"
                  score={result.complexity}
                  icon={Code2}
                  label="Cyclomatic"
                />
              </div>

              {/* Overview Narrative */}
              {result.overview && (
                <ResultCard title="Executive Architectural Review" icon={CheckCircle2}>
                  <p className="text-xs text-[#17243D] dark:text-slate-200 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {result.overview}
                  </p>
                </ResultCard>
              )}

              {/* Issues List with Severity Badges */}
              <ResultCard title={`Detected Issues (${result.issues?.length || 0})`} icon={AlertTriangle}>
                <div className="space-y-3">
                  {result.issues && result.issues.length > 0 ? (
                    result.issues.map((issue, idx) => {
                      const isCritical = issue.severity === 'Critical';
                      const isWarning = issue.severity === 'Warning';

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-[#E8ECF4] dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isCritical ? (
                                <AlertOctagon className="w-4 h-4 text-rose-500" />
                              ) : isWarning ? (
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                              ) : (
                                <Info className="w-4 h-4 text-blue-500" />
                              )}
                              <span className="text-xs font-bold text-[#17243D] dark:text-white">
                                {issue.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-[#7C879B] font-mono">
                                {issue.line}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  isCritical
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                    : isWarning
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                }`}
                              >
                                {issue.severity}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-[#7C879B] dark:text-slate-400 leading-relaxed">
                            {issue.description}
                          </p>

                          {issue.fix && (
                            <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50 font-medium">
                              <strong>Recommended Fix:</strong> {issue.fix}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Zero high-severity issues discovered in this snippet.</span>
                    </div>
                  )}
                </div>
              </ResultCard>

              {/* Refactored / Optimized Code */}
              {result.optimizedCode && (
                <ResultCard
                  title="Suggested Refactored Code"
                  icon={Code2}
                  action={
                    <button
                      onClick={handleCopyOptimized}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#3867F5] dark:text-blue-400 hover:underline"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  }
                >
                  <pre className="p-4 rounded-xl font-mono text-xs bg-slate-900 text-emerald-400 overflow-x-auto leading-relaxed border border-slate-800">
                    <code>{result.optimizedCode}</code>
                  </pre>
                </ResultCard>
              )}

              {/* Best Practice Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <ResultCard title="Engineering Best Practices" icon={Sparkles}>
                  <ul className="space-y-2 text-xs text-[#17243D] dark:text-slate-300">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3867F5] mt-1.5 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </ResultCard>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

