import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export interface OccasionOption {
  id: string;
  emoji: string;
  name: string;
  description: string;
  gradient: string;
  activeBorder: string;
  glowColor: string;
}

interface OccasionCardProps {
  occasion: OccasionOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const OccasionCard: React.FC<OccasionCardProps> = ({
  occasion,
  isSelected,
  onSelect,
}) => {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(occasion.id)}
      whileHover={{ scale: 1.025, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`group relative flex flex-col justify-between w-full text-left rounded-3xl p-6 transition-all duration-300 backdrop-blur-xl ${
        isSelected
          ? `bg-slate-900/90 border-2 ${occasion.activeBorder} shadow-xl ${occasion.glowColor} ring-4 ring-pink-500/10`
          : 'bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/80 shadow-md'
      }`}
    >
      {/* Background Ambient Tint */}
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${occasion.gradient} ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
        } transition-opacity duration-300 -z-10`}
      />

      <div>
        {/* Emoji Icon & Selected Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950/70 border border-slate-800/80 text-3xl shadow-inner group-hover:scale-110 transition-transform duration-300">
            {occasion.emoji}
          </div>

          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
              isSelected
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30 scale-100'
                : 'border border-slate-800 bg-slate-950/60 text-transparent group-hover:border-slate-700'
            }`}
          >
            <Check className="h-4 w-4 stroke-[3]" />
          </div>
        </div>

        {/* Name */}
        <h3 className="font-heading text-xl font-bold text-white mb-1.5 group-hover:text-pink-200 transition-colors">
          {occasion.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed">
          {occasion.description}
        </p>
      </div>

      {/* Selected Badge Indicator */}
      {isSelected && (
        <div className="mt-4 pt-3 border-t border-pink-500/20 text-[11px] font-semibold text-pink-300 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-pulse" />
          <span>Selected Experience</span>
        </div>
      )}
    </motion.button>
  );
};
