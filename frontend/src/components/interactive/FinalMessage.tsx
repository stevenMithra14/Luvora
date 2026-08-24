import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';

interface FinalMessageProps {
  finalText?: string;
  senderName?: string;
  isEditable?: boolean;
  onUpdate?: (text: string) => void;
}

export const FinalMessage: React.FC<FinalMessageProps> = ({
  finalText = "Thank you for being such an essential part of my world. Here's to many more memories together!",
  senderName = "With love",
  isEditable = false,
  onUpdate,
}) => {
  return (
    <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl backdrop-blur-xl text-center relative overflow-hidden">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25">
        <Heart className="h-6 w-6 fill-white/20" />
      </div>

      <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mb-4">
        A Final Note
      </h3>

      {isEditable ? (
        <textarea
          rows={4}
          value={finalText}
          onChange={(e) => onUpdate?.(e.target.value)}
          placeholder="Write your closing message..."
          className="w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-pink-500 leading-relaxed resize-none text-center"
        />
      ) : (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif italic text-base sm:text-xl text-pink-100/90 leading-relaxed max-w-lg mx-auto mb-6"
        >
          "{finalText}"
        </motion.p>
      )}

      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-400">
        <Sparkles className="h-3.5 w-3.5" />
        <span>{senderName}</span>
      </div>
    </div>
  );
};
