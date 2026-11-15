import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Smile,
  Meh,
  Frown,
  Key,
  ListChecks,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Clock,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import ResultCard from '../components/ResultCard';
import ScoreCard from '../components/ScoreCard';
import { CircularProgress } from '../components/ProgressChart';
import { textAPI } from '../services/api';

const SAMPLES = {
  Technology: `Artificial Intelligence and distributed cloud architectures are fundamentally redefining how modern software engineering teams build scalable services. High-throughput event queues like Apache Kafka, containerized microservices managed via Kubernetes, and declarative infrastructure with Terraform allow engineering teams to achieve sub-second latency across global regions. However, with heightened system complexity comes the imperative need for comprehensive observability, automated health checks, rate limiting, and zero-trust authentication protocols.`,
  Education: `Modern educational paradigms are shifting toward adaptive personalized learning. By combining interactive simulations, gamified milestone tracking, and algorithmic assessment pacing, students can acquire critical analytical thinking skills at their optimal cognitive cadence. Collaborative peer reviews and continuous formative feedback mechanisms demonstrate measurable improvements in student retention and practical subject mastery compared to traditional lecture formats.`,
  Business: `Quarterly operational revenues accelerated by 24% following the strategic deployment of automated customer onboarding workflows and in-depth business intelligence dashboards. Cross-functional team alignment between product marketing and customer success reduced churn by 12% while expanding enterprise contract lifetime value. Strategic capital allocation will focus on AI workflow integrations, data security compliance, and international market penetration.`
};

export default function TextAnalyzer() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expandedSummary, setExpandedSummary] = useState(false);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      toast.success(`Loaded file: ${selected.name}`);
    }
  };

  const handleSample = (category) => {
    setText(SAMPLES[category]);
    setFile(null);
    toast.success(`Loaded ${category} sample text!`);
  };

  const handleAnalyze = async () => {
    if (!text.trim() && !file) {
      toast.error('Please enter text or upload a document.');
      return;
    }

    try {
      setLoading(true);
      let payload;
      if (file) {
        payload = new FormData();
        payload.append('file', file);
      } else {
        payload = { text: text.trim() };
      }

      const res = await textAPI.analyzeText(payload);
      if (res.success && res.data) {
        setResult(res.data);
        toast.success('Text analysis generated!');
      }
    } catch (err) {
      toast.error(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const sentimentColor = result?.sentiment === 'Positive'
    ? '#10B981'
    : result?.sentiment === 'Negative'
    ? '#EF4444'
    : '#3867F5';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="pb-6 border-b border-[#E8ECF4] dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            Module 01
          </span>
          <span className="text-xs text-[#7C879B] dark:text-slate-400">• Natural Language & Document AI</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17243D] dark:text-white tracking-tight">
          Text & Document Analyzer
        </h1>
        <p className="text-sm text-[#7C879B] dark:text-slate-400 mt-1">
          Extract summaries, sentiment confidence, reading time, and key topics from any text or uploaded PDF/TXT.
        </p>
      </div>

      {/* Two-Column Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: INPUT TEXT */}
        <div className="lg:col-span-5 space-y-6">
          <ResultCard title="Input Text / Document" icon={FileText}>
            <div className="space-y-4">
              {/* Sample Buttons */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C879B] dark:text-slate-400 block mb-1.5">
                  Try Sample Text
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(SAMPLES).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSample(cat)}
                      className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#17243D] dark:text-white transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  rows={9}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (file) setFile(null);
                  }}
                  placeholder="Paste or write text to analyze (articles, reports, reviews, essays, notes)..."
                  className="w-full p-4 rounded-2xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#17243D] dark:text-white text-sm focus:outline-none focus:border-[#3867F5] focus:ring-2 focus:ring-blue-500/20 transition-all resize-none placeholder:text-[#7C879B]/60"
                />

                <div className="flex items-center justify-between text-xs text-[#7C879B] dark:text-slate-400 px-1 mt-1">
                  <span>{text.split(/\s+/).filter(Boolean).length} words</span>
                  <span>{text.length} characters</span>
                </div>
              </div>

              {/* Upload PDF/TXT Button */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[#E8ECF4] dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs text-[#7C879B] dark:text-slate-400">
                  <Upload className="w-4 h-4 text-[#3867F5]" />
                  <span>{file ? file.name : 'Upload PDF or TXT document'}</span>
                </div>
                <label className="cursor-pointer px-3 py-1 rounded-lg bg-white dark:bg-slate-700 text-xs font-semibold text-[#17243D] dark:text-white border border-[#E8ECF4] dark:border-slate-600 hover:border-[#3867F5] transition-all">
                  Browse
                  <input
                    type="file"
                    accept=".txt,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Analyze Button */}
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading || (!text.trim() && !file)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#3867F5] hover:bg-[#2B52D9] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Text</span>
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
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#17243D] dark:text-white">
                No Text Analyzed Yet
              </h3>
              <p className="text-xs text-[#7C879B] dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Enter text or choose a sample on the left to inspect sentiment, executive summaries, and extracted keywords.
              </p>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ScoreCard
                  title="Sentiment Tone"
                  score={result.sentiment}
                  icon={result.sentiment === 'Positive' ? Smile : result.sentiment === 'Negative' ? Frown : Meh}
                  label={`${result.sentimentScore}% Conf.`}
                  description="Lexicon & semantic evaluation"
                />

                <ScoreCard
                  title="Reading Time"
                  score={`${result.readingTimeMinutes} min`}
                  icon={Clock}
                  description={`Approx. ${result.wordCount} total words`}
                />

                <ScoreCard
                  title="Key Entities"
                  score={result.keywords?.length || 0}
                  icon={Key}
                  description="Extracted topical keywords"
                />
              </div>

              {/* Summary Card with Expandable details */}
              <ResultCard
                title="Executive Summary"
                icon={BookOpen}
                action={
                  <button
                    onClick={() => setExpandedSummary(!expandedSummary)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#3867F5] dark:text-blue-400 hover:underline"
                  >
                    <span>{expandedSummary ? 'Collapse' : 'Expand'}</span>
                    {expandedSummary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                }
              >
                <div className="space-y-3 text-sm text-[#17243D] dark:text-slate-200 leading-relaxed">
                  <p className="font-medium bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    {result.summary}
                  </p>

                  {expandedSummary && result.detailedSummary && (
                    <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 animate-in fade-in duration-150">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#3867F5] dark:text-blue-400 block mb-1">
                        In-Depth Exploration
                      </span>
                      <p className="text-xs text-[#17243D] dark:text-slate-300 leading-relaxed">
                        {result.detailedSummary}
                      </p>
                    </div>
                  )}
                </div>
              </ResultCard>

              {/* Sentiment Card with Circular Chart */}
              <ResultCard title="Sentiment & Emotional Tone" icon={Smile}>
                <div className="flex flex-col sm:flex-row items-center gap-6 p-2">
                  <CircularProgress
                    value={result.sentimentScore}
                    color={sentimentColor}
                    subtitle={result.sentiment}
                    title="Confidence Metric"
                  />

                  <div className="space-y-2 text-xs text-[#7C879B] dark:text-slate-400">
                    <p className="text-sm font-bold text-[#17243D] dark:text-white">
                      Tone Assessment: <span style={{ color: sentimentColor }}>{result.sentiment}</span>
                    </p>
                    <p className="leading-relaxed">
                      The document exhibits a {result.sentiment.toLowerCase()} demeanor with {result.sentimentScore}% confidence. Language metrics reveal constructive terminology focused on progression and clarity.
                    </p>
                  </div>
                </div>
              </ResultCard>

              {/* Key Points & Extracted Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResultCard title="Key Takeaways" icon={ListChecks}>
                  <ul className="space-y-2 text-xs text-[#17243D] dark:text-slate-300">
                    {(result.keyPoints || []).map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </ResultCard>

                <ResultCard title="Extracted Keywords" icon={Key}>
                  <div className="flex flex-wrap gap-2">
                    {(result.keywords || []).map((kw) => (
                      <span
                        key={kw}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </ResultCard>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

