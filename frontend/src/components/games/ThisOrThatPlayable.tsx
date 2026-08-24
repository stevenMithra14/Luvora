import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Sparkles } from 'lucide-react';

interface RoundItem {
  optionA: string;
  optionB: string;
}

interface ThisOrThatProps {
  config: {
    title?: string;
    rounds?: RoundItem[];
  };
}

export const ThisOrThatPlayable: React.FC<ThisOrThatProps> = ({ config }) => {
  const rounds = config.rounds || [
    { optionA: 'Coffee ☕', optionB: 'Tea 🍵' },
    { optionA: 'Beach Vacation 🏖️', optionB: 'Mountain Cabin 🏔️' },
    { optionA: 'Night Out 🌃', optionB: 'Cozy Night In 🛋️' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const handleChoose = (option: string) => {
    const nextChoices = [...choices, option];
    setChoices(nextChoices);

    if (currentIndex < rounds.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const currentRound = rounds[currentIndex] || { optionA: 'This', optionB: 'That' };

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-950 border border-indigo-500/30 shadow-2xl text-center space-y-6">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          <CheckSquare className="h-3.5 w-3.5 text-indigo-400" />
          This or That
        </span>
        <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
          {config?.title || 'This or That Rapid Match'}
        </h3>
        <p className="text-xs text-slate-400">
          Round {currentIndex + 1} of {rounds.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-2 gap-4"
          >
            <button
              type="button"
              onClick={() => handleChoose(currentRound.optionA)}
              className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 text-white font-heading text-lg font-extrabold hover:border-indigo-500 hover:scale-105 active:scale-95 cursor-pointer transition-all min-h-[120px] flex items-center justify-center shadow-lg"
            >
              <span>{currentRound.optionA}</span>
            </button>

            <button
              type="button"
              onClick={() => handleChoose(currentRound.optionB)}
              className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950/40 border border-blue-500/30 text-white font-heading text-lg font-extrabold hover:border-blue-500 hover:scale-105 active:scale-95 cursor-pointer transition-all min-h-[120px] flex items-center justify-center shadow-lg"
            >
              <span>{currentRound.optionB}</span>
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-4">
            <Sparkles className="h-10 w-10 text-indigo-400 mx-auto" />
            <h4 className="font-heading text-2xl font-bold text-white">Your Selections Complete! 🎉</h4>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {choices.map((item, idx) => (
                <span key={idx} className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 border border-indigo-500/30 text-indigo-300">
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
