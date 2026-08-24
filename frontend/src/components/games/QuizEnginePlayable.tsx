import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle, XCircle, Trophy, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';

interface QuestionItem {
  question: string;
  options: string[];
  correctIndex: number;
}

interface QuizEngineProps {
  config: {
    title?: string;
    description?: string;
    questions?: QuestionItem[];
  };
  onComplete?: (score: number, total: number) => void;
}

export const QuizEnginePlayable: React.FC<QuizEngineProps> = ({ config, onComplete }) => {
  const questions = config.questions || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
        No questions configured for this quiz yet.
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      if (onComplete) onComplete(score, questions.length);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsAnswered(false);
    setIsFinished(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-950 border border-pink-500/30 shadow-2xl text-left">
      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Header / Progress Bar */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 text-pink-400">
                <HelpCircle className="h-4 w-4" />
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="font-mono text-slate-300">
                Score: {score}/{questions.length}
              </span>
            </div>

            <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <h3 className="font-heading text-lg sm:text-2xl font-bold text-white leading-snug">
              {currentQ.question}
            </h3>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;
                let btnStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-850';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                  } else {
                    btnStyle = 'bg-slate-900/40 border-slate-900 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrect && <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Next Action Button */}
            {isAnswered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'See Final Score'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* Final Score Card */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-6"
          >
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 text-white flex items-center justify-center mx-auto shadow-2xl shadow-pink-500/30">
              <Trophy className="h-10 w-10 text-amber-300" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
                <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                Quiz Complete
              </span>
              <h3 className="font-heading text-2xl sm:text-4xl font-extrabold text-white">
                You scored {score} / {questions.length}!
              </h3>
              <p className="text-sm text-slate-300 italic font-serif">
                {score === questions.length
                  ? 'Perfect Score! You know me better than anyone ❤️'
                  : score > questions.length / 2
                  ? 'Great job! You really know your stuff 🎉'
                  : 'Nice try! You learned something new today ❤️'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 border border-slate-700 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Play Again</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
