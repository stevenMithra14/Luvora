import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cake, CheckCircle2 } from 'lucide-react';

interface GuessAgeProps {
  config: {
    title?: string;
    targetAge?: number;
    clue?: string;
  };
}

export const GuessAgePlayable: React.FC<GuessAgeProps> = ({ config }) => {
  const targetAge = config.targetAge || 25;
  const clue = config.clue || 'Forever young at heart!';

  const [inputAge, setInputAge] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    const guessed = parseInt(inputAge, 10);
    if (isNaN(guessed)) return;

    if (guessed === targetAge) {
      setFeedback(`Correct! 🎉 Turning ${targetAge} and looking fabulous!`);
      setIsSuccess(true);
    } else if (guessed < targetAge) {
      setFeedback(`Too low! Higher than ${guessed}! Try again ❤️`);
    } else {
      setFeedback(`Too high! Lower than ${guessed}! Try again ❤️`);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-950 border border-rose-500/30 shadow-2xl text-center space-y-6">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
          <Cake className="h-3.5 w-3.5 text-rose-400" />
          Guess My Age
        </span>
        <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
          {config?.title || 'Guess My Age Challenge'}
        </h3>
        {clue && <p className="text-xs text-slate-400 italic">Clue: "{clue}"</p>}
      </div>

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <form onSubmit={handleGuess} className="space-y-4 max-w-xs mx-auto">
            <div className="flex gap-2">
              <input
                type="number"
                value={inputAge}
                onChange={(e) => setInputAge(e.target.value)}
                placeholder="Enter age..."
                min={1}
                max={120}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-center text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-extrabold text-xs cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                Guess
              </button>
            </div>

            {feedback && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold text-rose-300">
                {feedback}
              </motion.div>
            )}
          </form>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-6 space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
            <h4 className="font-heading text-2xl font-bold text-white">{feedback}</h4>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
