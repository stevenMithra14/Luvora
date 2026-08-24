import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Calendar, Gift, Music, Image as ImageIcon } from 'lucide-react';

interface LivePreviewCardProps {
  recipientName: string;
  recipientDate: string;
  dontKnowYear: boolean;
  occasion: string;
}

export const LivePreviewCard: React.FC<LivePreviewCardProps> = ({
  recipientName,
  recipientDate,
  dontKnowYear,
  occasion,
}) => {
  const displayName = recipientName.trim() || 'Someone Special';

  // Format headline based on occasion
  const getHeadline = () => {
    switch (occasion) {
      case 'birthday':
        return `Happy Birthday, ${displayName}! 🎂`;
      case 'love':
        return `For ${displayName} ❤️`;
      case 'anniversary':
        return `Happy Anniversary, ${displayName}! 💍`;
      case 'friendship':
        return `To My Best Friend, ${displayName} 🫂`;
      case 'graduation':
        return `Congratulations, ${displayName}! 🎓`;
      case 'celebration':
        return `Let's Celebrate, ${displayName}! 🎉`;
      case 'just-because':
        return `Just Because You're Amazing, ${displayName} ✨`;
      default:
        return `A Special Gift For ${displayName}`;
    }
  };

  // Format date display
  const getFormattedDate = () => {
    if (!recipientDate) return null;
    try {
      const dateObj = new Date(recipientDate);
      if (isNaN(dateObj.getTime())) return null;

      if (dontKnowYear) {
        return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      }
      return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return null;
    }
  };

  const formattedDate = getFormattedDate();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Live Card Preview
        </span>
        <span className="text-[11px] font-medium text-slate-500">Real-time updates</span>
      </div>

      <motion.div
        layout
        className="relative overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950 p-7 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-pink-500/10"
      >
        {/* Glow Spheres */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-pink-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-purple-500/15 blur-3xl" />

        {/* Top Badge */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center shadow-md shadow-pink-500/20">
              <Heart className="h-4 w-4 text-white fill-white/20" />
            </div>
            <span className="font-heading text-sm font-bold text-slate-200 capitalize">
              {occasion || 'Personalized'} Gift Card
            </span>
          </div>

          <span className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
            Luvora Digital
          </span>
        </div>

        {/* Main Card Content */}
        <div className="text-center py-4">
          <motion.h3
            key={displayName + occasion}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3"
          >
            {getHeadline()}
          </motion.h3>

          {formattedDate && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-800/80 text-pink-300 border border-slate-700/80 mb-4"
            >
              <Calendar className="h-3.5 w-3.5 text-pink-400" />
              <span>{formattedDate}</span>
            </motion.div>
          )}

          <p className="text-xs text-slate-400 max-w-xs mx-auto italic leading-relaxed">
            "Your custom letter, memories, timeline, and interactive surprises will appear here..."
          </p>
        </div>

        {/* Component Icons Placeholder Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-around text-slate-500 text-[11px]">
          <div className="flex items-center gap-1">
            <ImageIcon className="h-3.5 w-3.5 text-pink-400" />
            <span>Photos</span>
          </div>
          <div className="flex items-center gap-1">
            <Music className="h-3.5 w-3.5 text-sky-400" />
            <span>Music</span>
          </div>
          <div className="flex items-center gap-1">
            <Gift className="h-3.5 w-3.5 text-purple-400" />
            <span>Surprises</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
