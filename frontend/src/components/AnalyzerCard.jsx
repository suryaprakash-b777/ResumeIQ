import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function AnalyzerCard({
  title,
  description,
  badge,
  icon: Icon,
  iconBg = 'bg-blue-50 text-blue-600',
  to
}) {
  return (
    <Link
      to={to}
      className="group relative p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8ECF4] dark:border-slate-800 shadow-card hover:shadow-elevated hover:border-[#3867F5]/40 dark:hover:border-blue-500/40 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>

          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-[#7C879B] dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
            {badge}
          </span>
        </div>

        <h3 className="text-lg font-bold text-[#17243D] dark:text-white mb-2 group-hover:text-[#3867F5] dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>

        <p className="text-sm text-[#7C879B] dark:text-slate-400 leading-relaxed mb-6">
          {description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#E8ECF4]/60 dark:border-slate-800">
        <span className="text-xs font-semibold text-[#3867F5] dark:text-blue-400 group-hover:underline">
          Launch Analyzer
        </span>
        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#3867F5] dark:text-blue-400 flex items-center justify-center group-hover:bg-[#3867F5] group-hover:text-white transition-all shadow-xs">
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}

