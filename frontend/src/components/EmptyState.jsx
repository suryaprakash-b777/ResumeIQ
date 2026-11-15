import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'No Data Available',
  description = 'Upload or submit an input to generate real-time AI analysis results.',
  icon: Icon = Inbox,
  actionText,
  onAction
}) {
  return (
    <div className="w-full p-10 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8ECF4] dark:border-slate-800 shadow-card text-center flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[#7C879B] dark:text-slate-400 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-[#17243D] dark:text-white mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-[#7C879B] dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#3867F5] text-white hover:bg-[#2B52D9] transition-all shadow-md shadow-blue-500/20"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

