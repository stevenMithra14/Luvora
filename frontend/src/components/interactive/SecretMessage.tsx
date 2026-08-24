import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Heart, Sparkles } from 'lucide-react';

interface SecretMessageProps {
  messageText?: string;
  isEditable?: boolean;
  onMessageChange?: (val: string) => void;
}

export const SecretMessage: React.FC<SecretMessageProps> = ({
  messageText = 'You are the most precious person in my life. I am so lucky to have you!',
  isEditable = false,
  onMessageChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-950 border border-rose-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-rose-500/20 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            {isOpen ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-white">Secret Message</h3>
            <p className="text-xs text-slate-400">For your eyes only</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-rose-300">Tap to Reveal</span>
      </div>

      {isEditable ? (
        <div className="space-y-3">
          <label htmlFor="secretInput" className="block text-xs font-semibold uppercase text-slate-300">
            Hidden Message Text
          </label>
          <textarea
            id="secretInput"
            rows={3}
            value={messageText}
            onChange={(e) => onMessageChange?.(e.target.value)}
            placeholder="Write a secret note..."
            className="w-full p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-rose-500 resize-none"
          />
        </div>
      ) : (
        <div className="text-center py-4">
          <AnimatePresence mode="wait">
            {!isOpen ? (
              <motion.button
                key="closed"
                type="button"
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-pink-500/25 transition-all"
              >
                <Heart className="h-4 w-4 text-white fill-white/20 group-hover:scale-110 transition-transform" />
                <span>Open when you're ready ❤️</span>
              </motion.button>
            ) : (
              <motion.div
                key="open"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="p-6 rounded-2xl bg-slate-950/90 border border-rose-500/40 text-left shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-3 mb-4">
                  <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Unlocked Secret Note
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-[11px] text-slate-500 hover:text-slate-300"
                  >
                    Lock again
                  </button>
                </div>
                <p className="font-heading text-base sm:text-xl text-rose-100 italic leading-relaxed">
                  "{messageText}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
