import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Image as ImageIcon,
  Code2,
  Briefcase,
  BarChart3,
  MessageSquareCode,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnalyzerCard from '../components/AnalyzerCard';

const FEATURES = [
  {
    title: 'Text Analyzer',
    description: 'Document analysis, executive summaries, key extraction, and fine-grained sentiment analysis.',
    badge: 'PDF / TXT',
    icon: FileText,
    iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
    to: '/analyzer/text'
  },
  {
    title: 'Image Analyzer',
    description: 'Object detection, scene understanding, visual breakdown, and multimodal AI insights.',
    badge: 'JPG / PNG / WEBP',
    icon: ImageIcon,
    iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
    to: '/analyzer/image'
  },
  {
    title: 'Code Analyzer',
    description: 'Automated bug detection, code quality grading, security audit, and refactored optimizations.',
    badge: 'Multi-Language',
    icon: Code2,
    iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    to: '/analyzer/code'
  },
  {
    title: 'Resume Analyzer',
    description: 'ATS compatibility scoring, skill gap identification, career matching, and 8-week learning roadmap.',
    badge: 'PDF / DOCX',
    icon: Briefcase,
    iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    to: '/analyzer/resume'
  },
  {
    title: 'Data Analyzer',
    description: 'Descriptive statistics, distribution doughnut charts, sequential trends, and automated business insights.',
    badge: 'CSV / Excel / JSON',
    icon: BarChart3,
    iconBg: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400',
    to: '/analyzer/data'
  },
  {
    title: 'General AI Analyzer',
    description: 'Interactive intelligent chat assistant for open-ended queries, explanations, and document analysis.',
    badge: 'Gemini Assistant',
    icon: MessageSquareCode,
    iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    to: '/analyzer/general'
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FC] dark:bg-[#0F172A] transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 text-center px-4 max-w-5xl mx-auto">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-800 text-[#3867F5] dark:text-blue-400 text-xs font-semibold mb-6 shadow-xs animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smarter Analysis • Better Insights</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#17243D] dark:text-white tracking-tight leading-[1.15] mb-6">
            Welcome to <span className="text-[#3867F5]">AI Analyzer</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-[#7C879B] dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Upload your data, documents, images or code — and let AI do the heavy lifting.
          </p>

          <p className="text-sm text-[#7C879B] dark:text-slate-400 max-w-xl mx-auto mb-10">
            A production-ready multimodal intelligence suite designed to extract, evaluate, score, and optimize every digital asset in seconds.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/analyzer/resume"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#3867F5] hover:bg-[#2B52D9] text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Analyze Your Resume</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#17243D] dark:text-white font-semibold text-sm border border-[#E8ECF4] dark:border-slate-700 shadow-sm transition-all"
            >
              Get Free Account
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[#7C879B] dark:text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Real Multimodal AI</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Enterprise Grade Privacy</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Instant Scoring & PDF Export</span>
            </div>
          </div>
        </section>

        {/* 6 Feature Cards Grid */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#17243D] dark:text-white">
              Specialized AI Analysis Modules
            </h2>
            <p className="text-sm text-[#7C879B] dark:text-slate-400 mt-2">
              Select an engine to process text, inspect source code, score resumes, or analyze data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat) => (
              <AnalyzerCard
                key={feat.title}
                title={feat.title}
                description={feat.description}
                badge={feat.badge}
                icon={feat.icon}
                iconBg={feat.iconBg}
                to={feat.to}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

