import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

export default function SkillTag({ name, variant = 'neutral', percentage }) {
  let styleClass = '';
  let IconComponent = null;

  switch (variant) {
    case 'matched':
      styleClass = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      IconComponent = Check;
      break;
    case 'missing':
      styleClass = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      IconComponent = X;
      break;
    case 'critical':
      styleClass = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      IconComponent = AlertCircle;
      break;
    default:
      styleClass = 'bg-slate-100 dark:bg-slate-800 text-[#17243D] dark:text-slate-300 border-slate-200/80 dark:border-slate-700';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${styleClass}`}>
      {IconComponent && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
      <span>{name}</span>
      {typeof percentage === 'number' && (
        <span className="opacity-70 text-[10px]">({percentage}%)</span>
      )}
    </span>
  );
}

