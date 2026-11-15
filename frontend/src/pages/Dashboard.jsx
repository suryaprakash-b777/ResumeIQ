import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Award,
  Target,
  AlertTriangle,
  ArrowRight,
  Eye,
  Plus,
  Loader2,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { historyAPI } from '../services/api';
import ScoreCard from '../components/ScoreCard';
import EmptyState from '../components/EmptyState';
import { formatDate, getScoreColor } from '../utils/formatters';

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await historyAPI.getAll({ sort: 'desc' });
        if (res.success && res.data) {
          setHistory(res.data);
        }
      } catch (err) {
        console.warn('Dashboard fetch notice:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Compute stats
  const totalAnalyses = history.length;
  const resumeAnalyses = history.filter(h => h.analyzerType === 'resume');
  const latestResume = resumeAnalyses[0];
  const latestAtsScore = latestResume?.atsScore || 0;
  const latestJobMatchScore = latestResume?.jobMatchScore || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-[#3867F5] to-indigo-600 text-white shadow-xl shadow-blue-500/15">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Multimodal Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Explorer'}!
          </h1>
          <p className="text-sm text-blue-100 max-w-xl mt-1 leading-relaxed">
            Ready to review candidate compatibility, examine codebase health, or query your multimodal datasets?
          </p>
        </div>

        <Link
          to="/analyzer/resume"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-[#3867F5] hover:bg-blue-50 font-bold text-sm shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Analyse New Resume</span>
        </Link>
      </div>

      {/* Top Statistic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <ScoreCard
          title="Total Analysed"
          score={totalAnalyses}
          icon={FileText}
          description="Total documents & inputs scored"
        />

        <ScoreCard
          title="Latest ATS Score"
          score={latestAtsScore ? `${latestAtsScore}%` : 'N/A'}
          icon={Award}
          label={latestAtsScore >= 80 ? 'Excellent' : latestAtsScore >= 65 ? 'Good' : 'Needs Work'}
          description="Evaluated on 5 ATS categories"
        />

        <ScoreCard
          title="Job Match Score"
          score={latestJobMatchScore ? `${latestJobMatchScore}%` : 'N/A'}
          icon={Target}
          label={latestJobMatchScore >= 75 ? 'Strong Fit' : 'Moderate'}
          description="Role skill coverage match"
        />

        <ScoreCard
          title="Top Gaps to Bridge"
          score={latestResume ? '3 Skills' : '0'}
          icon={AlertTriangle}
          label="Actionable"
          description="Identified for targeted learning"
        />
      </div>

      {/* Quick Launch Analyzers Bar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#17243D] dark:text-white">
            Quick Analyzers
          </h2>
          <span className="text-xs text-[#7C879B] dark:text-slate-400">
            Select a specialized AI model
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { name: 'ResumeIQ', to: '/analyzer/resume', icon: Briefcase, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60' },
            { name: 'Text & Docs', to: '/analyzer/text', icon: FileText, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60' },
            { name: 'Visual Media', to: '/analyzer/image', icon: Target, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/60' },
            { name: 'Code Review', to: '/analyzer/code', icon: Award, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60' },
            { name: 'Data Insights', to: '/analyzer/data', icon: AlertTriangle, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/60' },
            { name: 'General Chat', to: '/analyzer/general', icon: Sparkles, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.to}
                className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8ECF4] dark:border-slate-800 hover:border-[#3867F5]/50 dark:hover:border-blue-500/50 shadow-card hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-2 group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#17243D] dark:text-white">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Analyses Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8ECF4] dark:border-slate-800 shadow-card">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8ECF4] dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-[#17243D] dark:text-white">
              Recent Analyses
            </h2>
            <p className="text-xs text-[#7C879B] dark:text-slate-400">
              Audit trails, score breakdowns, and downloadable reports
            </p>
          </div>

          <Link
            to="/history"
            className="text-xs font-semibold text-[#3867F5] dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-[#3867F5] animate-spin" />
            <p className="text-xs text-[#7C879B]">Loading historical analyses...</p>
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            title="No Analyses Completed Yet"
            description="Upload your resume or dataset to generate instant ATS compatibility scores, skill gap analyses, and roadmaps."
            actionText="Run First Analysis"
            onAction={() => window.location.href = '/analyzer/resume'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E8ECF4] dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-[#7C879B] dark:text-slate-400">
                  <th className="pb-3 pl-2">Date</th>
                  <th className="pb-3">Input File / Name</th>
                  <th className="pb-3">Module</th>
                  <th className="pb-3">Target Role</th>
                  <th className="pb-3 text-center">ATS Score</th>
                  <th className="pb-3 text-center">Job Match</th>
                  <th className="pb-3 pr-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF4]/60 dark:divide-slate-800/60">
                {history.slice(0, 6).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-2 text-xs text-[#7C879B] dark:text-slate-400 whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>

                    <td className="py-3.5 font-medium text-[#17243D] dark:text-white max-w-[200px] truncate">
                      {item.inputFileName || 'Document'}
                    </td>

                    <td className="py-3.5 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950 text-[#3867F5] dark:text-blue-400 capitalize">
                        {item.analyzerType}
                      </span>
                    </td>

                    <td className="py-3.5 text-xs text-[#7C879B] dark:text-slate-400 whitespace-nowrap">
                      {item.targetRole || 'General Evaluation'}
                    </td>

                    <td className="py-3.5 text-center">
                      {typeof item.atsScore === 'number' ? (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${getScoreColor(item.atsScore)}`}>
                          {item.atsScore}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 text-center">
                      {typeof item.jobMatchScore === 'number' ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.jobMatchScore}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <Link
                        to={`/history?view=${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#17243D] dark:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

