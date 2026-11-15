import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

const DEFAULT_STEPS = [
  'Uploading and validating input payload',
  'Extracting structured content and key entities',
  'Analyzing syntax, parameters, and patterns',
  'Synthesizing intelligent AI insights',
  'Finalizing evaluation report and dashboard metrics'
];

export default function LoadingSteps({
  title = 'Analyzing in progress...',
  steps = DEFAULT_STEPS,
  activeStepIndex = 0
}) {
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-advance steps periodically if not controlled externally
  useEffect(() => {
    if (activeStepIndex > 0) {
      setCurrentStep(activeStepIndex);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, [activeStepIndex, steps.length]);

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8ECF4] dark:border-slate-800 shadow-elevated">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E8ECF4] dark:border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#3867F5] dark:text-blue-400 flex items-center justify-center shrink-0">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#17243D] dark:text-white">
            {title}
          </h3>
          <p className="text-xs text-[#7C879B] dark:text-slate-400">
            Multimodal AI model is processing your request
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-[#3867F5] dark:text-blue-400 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-700" />
                )}
              </div>
              <span
                className={`text-xs ${
                  isCurrent
                    ? 'font-bold text-[#3867F5] dark:text-blue-400'
                    : isDone
                    ? 'font-medium text-[#17243D] dark:text-slate-300'
                    : 'text-[#7C879B] dark:text-slate-500'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

