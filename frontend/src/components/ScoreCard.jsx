import React from 'react';
import { getScoreColor } from '../utils/formatters';

export default function ScoreCard({
  title,
  score,
  suffix = '',
  label,
  icon: Icon,
  description
}) {
  const isNumeric = typeof score === 'number';

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8ECF4] dark:border-slate-800 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#7C879B] dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#3867F5] dark:text-blue-400 flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-extrabold text-[#17243D] dark:text-white">
          {score}
          {suffix}
        </span>
        {label && (
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${isNumeric ? getScoreColor(score) : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
            {label}
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs text-[#7C879B] dark:text-slate-400 mt-1">
          {description}
        </p>
      )}
    </div>
  );
}

