import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface WizardProgressProps {
  currentStep: number; // 1 to 7
}

export const WizardProgress: React.FC<WizardProgressProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Occasion' },
    { number: 2, label: 'Person' },
    { number: 3, label: 'Customize' },
    { number: 4, label: 'Memories' },
    { number: 5, label: 'Goodies' },
    { number: 6, label: 'Games' },
    { number: 7, label: 'Preview' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-4 px-2">
      {/* Desktop & Tablet View (7 Steppers) */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-800/80 -z-0" />

        {/* Active Progress Line */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 -z-0"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />

        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <div key={step.number} className="flex flex-col items-center relative z-10">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-pink-500 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-gradient-to-tr from-pink-500 to-rose-500 text-white ring-2 ring-pink-500/30 shadow-md scale-105'
                    : 'bg-slate-900 border border-slate-800 text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="h-3 w-3 stroke-[3]" /> : `0${step.number}`}
              </div>
              <span
                className={`mt-1 text-[10px] font-semibold tracking-wide transition-colors duration-200 ${
                  isCurrent ? 'text-pink-300' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Compact Mobile View */}
      <div className="sm:hidden space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 px-1">
          <span className="text-pink-400 font-mono uppercase tracking-wider">
            Step 0{currentStep} of 07
          </span>
          <span className="text-slate-400 font-heading">
            {steps[currentStep - 1]?.label}
          </span>
        </div>

        <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
};

