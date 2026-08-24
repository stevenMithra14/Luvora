import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, CheckCircle, XCircle, ArrowRight, Sparkles } from 'lucide-react';

interface QuoteItem {
  statement: string;
  options: string[];
  correctIndex: number;
}

interface WhoSaidItProps {
  config: {
    title?: string;
    quotes?: QuoteItem[];
  };
}

export const WhoSaidItPlayable: React.FC<WhoSaidItProps> = ({ config }) => {
  const quotes = config.quotes || [
    { statement: 'I need coffee right now or nobody survives.', options: ['Me', 'You', 'Both of us'], correctIndex: 0 },
    { statement: 'Let us take just one more photo!', options: ['Me', 'You', 'Both of us'], correctIndex: 1 }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuote = quotes[currentIndex];

  const handleGuess = (idx: number) => {
    if (isAnswered) return;
    setSelectedIdx(idx);
    setIsAnswered(true);
    if (idx === currentQuote.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quotes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedIdx(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-950 border border-purple-500/30 shadow-2xl text-center space-y-6">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
          <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
          Who Said It?
        </span>
        <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
          {config?.title || 'Who Said It?'}
        </h3>
        <p className="text-xs text-slate-400">
          Quote {currentIndex + 1} of {quotes.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div key={currentIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-base sm:text-lg font-serif italic text-white leading-relaxed">
              "{currentQuote.statement}"
            </div>

            <div className="grid grid-cols-3 gap-3">
              {currentQuote.options.map((opt, idx) => {
                const isSelected = selectedIdx === idx;
                const isCorrect = idx === currentQuote.correctIndex;
                let btnStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700';

                if (isAnswered) {
                  if (isCorrect) btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30';
                  else if (isSelected) btnStyle = 'bg-rose-950 border-rose-500 text-rose-200';
                  else btnStyle = 'bg-slate-900/40 border-slate-900 text-slate-600';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleGuess(idx)}
                    disabled={isAnswered}
                    className={`p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-rose-400" />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs cursor-pointer hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>{currentIndex < quotes.length - 1 ? 'Next Quote' : 'See Results'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-3">
            <Sparkles className="h-10 w-10 text-purple-400 mx-auto" />
            <h4 className="font-heading text-2xl font-bold text-white">Score: {score} / {quotes.length}! 🎉</h4>
            <p className="text-xs text-slate-400">Great memory on our favorite quotes!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
