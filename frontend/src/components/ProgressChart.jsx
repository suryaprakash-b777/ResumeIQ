import React from 'react';

export function CircularProgress({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 10,
  title = '',
  subtitle = '',
  color = '#3867F5'
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E8ECF4"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="dark:stroke-slate-800"
          />
          {/* Active progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Centered value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-[#17243D] dark:text-white leading-none">
            {value}%
          </span>
          {subtitle && (
            <span className="text-[10px] font-medium text-[#7C879B] dark:text-slate-400 mt-1">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {title && (
        <span className="mt-3 text-xs font-semibold text-[#17243D] dark:text-white text-center">
          {title}
        </span>
      )}
    </div>
  );
}

export function HorizontalProgressBar({
  label,
  value = 0,
  weight,
  color = 'bg-[#3867F5]'
}) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[#17243D] dark:text-slate-200">
          {label} {weight && <span className="text-[#7C879B] dark:text-slate-400 font-normal">({weight}%)</span>}
        </span>
        <span className="font-bold text-[#17243D] dark:text-white">
          {clampedValue}/100
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}

