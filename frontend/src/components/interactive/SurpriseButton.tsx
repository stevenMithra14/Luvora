import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Sparkles, PartyPopper, Heart } from 'lucide-react';

interface SurpriseButtonProps {
  buttonText?: string;
  surpriseMessage?: string;
  isEditable?: boolean;
  onUpdate?: (buttonText: string, surpriseMessage: string) => void;
}

export const SurpriseButton: React.FC<SurpriseButtonProps> = ({
  buttonText = "Don't click this 👀",
  surpriseMessage = "Surprise! You are completely amazing and I wanted to make you smile today! 🎉✨",
  isEditable = false,
  onUpdate,
}) => {
  const [btnTextState, setBtnTextState] = useState(buttonText);
  const [msgState, setMsgState] = useState(surpriseMessage);
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-950 border border-purple-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Eye className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-white">Surprise Button</h3>
            <p className="text-xs text-slate-400">Playful interactive surprise</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-purple-300">Tap to Trigger</span>
      </div>

      {isEditable ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="btnTextInput" className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Button Label
            </label>
            <input
              id="btnTextInput"
              type="text"
              value={btnTextState}
              onChange={(e) => {
                setBtnTextState(e.target.value);
                onUpdate?.(e.target.value, msgState);
              }}
              placeholder="e.g. Don't click this 👀"
              className="w-full p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label htmlFor="surpriseMsgInput" className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Surprise Reveal Message
            </label>
            <textarea
              id="surpriseMsgInput"
              rows={3}
              value={msgState}
              onChange={(e) => {
                setMsgState(e.target.value);
                onUpdate?.(btnTextState, e.target.value);
              }}
              placeholder="Surprise message revealed on click..."
              className="w-full p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <AnimatePresence mode="wait">
            {!isRevealed ? (
              <motion.button
                key="trigger"
                type="button"
                onClick={() => setIsRevealed(true)}
                whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-purple-500/30 transition-all"
              >
                <Sparkles className="h-4 w-4 text-amber-300 animate-spin" />
                <span>{btnTextState}</span>
              </motion.button>
            ) : (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, scale: 0.8, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
                className="p-6 rounded-2xl bg-slate-950/90 border border-purple-500/40 text-center shadow-2xl relative"
              >
                {/* Floating Confetti Particle Accents */}
                <div className="flex items-center justify-center gap-3 mb-3 text-purple-400">
                  <PartyPopper className="h-6 w-6 animate-bounce" />
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  <Heart className="h-6 w-6 text-pink-400 fill-pink-400/40 animate-pulse" />
                </div>

                <p className="font-heading text-lg sm:text-2xl font-bold text-white mb-4 leading-relaxed">
                  "{msgState}"
                </p>

                <button
                  type="button"
                  onClick={() => setIsRevealed(false)}
                  className="text-xs font-semibold px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20"
                >
                  Reset Surprise
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
