import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, Sparkles, Check } from 'lucide-react';

interface PairItem {
  optionA: string;
  optionB: string;
}

interface WouldYouRatherProps {
  config: {
    title?: string;
    pairs?: PairItem[];
  };
}

export const WouldYouRatherPlayable: React.FC<WouldYouRatherProps> = ({ config }) => {
  const pairs = config.pairs || [
    { optionA: 'Travel to Paris for a weekend', optionB: 'Explore Tokyo for a week' },
    { optionA: 'Have endless pizza forever', optionB: 'Have endless ice cream forever' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const handleSelect = (choice: 'A' | 'B') => {
    setSelectedOption(choice);
    setTimeout(() => {
      if (currentIndex < pairs.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        setIsFinished(true);
      }
    }, 800);
  };

  const currentPair = pairs[currentIndex] || { optionA: 'Option A', optionB: 'Option B' };

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-950 border border-purple-500/30 shadow-2xl text-center space-y-6">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
          <Sliders className="h-3.5 w-3.5 text-purple-400" />
          Would You Rather
        </span>
        <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
          {config?.title || 'Would You Rather?'}
        </h3>
        <p className="text-xs text-slate-400">
          Round {currentIndex + 1} of {pairs.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <button
              type="button"
              onClick={() => handleSelect('A')}
              className={`p-6 rounded-2xl border text-left flex flex-col justify-between min-h-[140px] cursor-pointer transition-all ${
                selectedOption === 'A'
                  ? 'bg-pink-950/80 border-pink-500 text-pink-200 ring-2 ring-pink-500/30'
                  : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400">Option A</span>
              <span className="font-heading text-base font-bold text-white my-auto">{currentPair.optionA}</span>
              {selectedOption === 'A' && <Check className="h-5 w-5 text-pink-400 self-end" />}
            </button>

            <button
              type="button"
              onClick={() => handleSelect('B')}
              className={`p-6 rounded-2xl border text-left flex flex-col justify-between min-h-[140px] cursor-pointer transition-all ${
                selectedOption === 'B'
                  ? 'bg-purple-950/80 border-purple-500 text-purple-200 ring-2 ring-purple-500/30'
                  : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Option B</span>
              <span className="font-heading text-base font-bold text-white my-auto">{currentPair.optionB}</span>
              {selectedOption === 'B' && <Check className="h-5 w-5 text-purple-400 self-end" />}
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-3">
            <Sparkles className="h-10 w-10 text-purple-400 mx-auto" />
            <h4 className="font-heading text-2xl font-bold text-white">All Choices Complete! 🎉</h4>
            <p className="text-xs text-slate-400">Thanks for playing the Would You Rather challenge!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
