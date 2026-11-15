import React from 'react';

export default function ResultCard({
  title,
  subtitle,
  badge,
  icon: Icon,
  action,
  children,
  className = ''
}) {
  return (
    <div className={`p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8ECF4] dark:border-slate-800 shadow-card ${className}`}>
      {(title || action || Icon) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E8ECF4]/70 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#3867F5] dark:text-blue-400 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#17243D] dark:text-white">
                  {title}
                </h3>
                {badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-[#3867F5] dark:text-blue-400 border border-blue-200/50 dark:border-blue-800">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-[#7C879B] dark:text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      {children}
    </div>
  );
}

