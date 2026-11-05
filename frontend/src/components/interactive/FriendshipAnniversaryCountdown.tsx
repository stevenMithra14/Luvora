import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, Calendar, ArrowRight, PartyPopper } from 'lucide-react';
import {
  calculateFriendshipAnniversary,
  FriendshipCountdownResult,
  formatFirstMetDate,
} from '../../utils/occasionUtils';

interface FriendshipAnniversaryCountdownProps {
  firstMetDateStr?: string;
  recipientName?: string;
  onContinue?: () => void;
  className?: string;
}

export const FriendshipAnniversaryCountdown: React.FC<FriendshipAnniversaryCountdownProps> = ({
  firstMetDateStr,
  recipientName = 'My Best Friend',
  onContinue,
  className = '',
}) => {
  const [countdown, setCountdown] = useState<FriendshipCountdownResult>(() =>
    calculateFriendshipAnniversary(firstMetDateStr)
  );

  useEffect(() => {
    // Initial compute
    setCountdown(calculateFriendshipAnniversary(firstMetDateStr));

    // Update every second automatically
    const interval = setInterval(() => {
      setCountdown(calculateFriendshipAnniversary(firstMetDateStr));
    }, 1000);

    return () => clearInterval(interval);
  }, [firstMetDateStr]);

  const name = recipientName?.trim() || 'My Best Friend';
  const formattedFirstMet = formatFirstMetDate(firstMetDateStr);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative w-full max-w-2xl mx-auto rounded-3xl border border-purple-500/30 bg-gradient-to-b from-slate-950 via-purple-950/30 to-slate-950 p-6 sm:p-10 text-center text-white shadow-2xl shadow-purple-500/10 backdrop-blur-2xl overflow-hidden ${className}`}
    >
      {/* Decorative Glow Background Spheres */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-pink-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />

      {/* Top Badge */}
      <div className="flex justify-center mb-4">
        {countdown.isAnniversaryToday ? (
          <span className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-pink-500/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-pink-500/10 animate-bounce">
            <PartyPopper className="h-4 w-4 text-amber-400" />
            TODAY IS OUR FRIENDSHIP ANNIVERSARY!
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            Friendship Celebration
          </span>
        )}
      </div>

      {/* Header Heading */}
      <h2 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-rose-300 mb-2">
        OUR FRIENDSHIP ANNIVERSARY
      </h2>

      {/* Subtitle / First Met Label */}
      {formattedFirstMet ? (
        <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-purple-200/90 mb-6 px-3 py-1 rounded-xl bg-purple-900/30 border border-purple-500/20">
          <Calendar className="h-3.5 w-3.5 text-pink-400" />
          <span>When We First Met: <strong className="text-white font-bold">{formattedFirstMet}</strong></span>
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          Celebrating the eternal bond with {name}
        </p>
      )}

      {/* MAIN CONTENT AREA */}
      {countdown.isAnniversaryToday ? (
        /* TODAY IS THE ANNIVERSARY CELEBRATION CARD */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-rose-500/20 border-2 border-pink-400/50 shadow-2xl mb-8 space-y-4"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-xl shadow-pink-500/30">
            <PartyPopper className="h-8 w-8 animate-pulse text-amber-200" />
          </div>

          <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
            Happy Friendship Anniversary, {name}! 🎉
          </h3>

          <p className="text-base sm:text-xl font-serif italic text-pink-200 max-w-lg mx-auto leading-relaxed">
            "Every year, another beautiful chapter of our friendship."
          </p>

          {countdown.yearsKnown && countdown.yearsKnown > 0 && (
            <div className="inline-block px-4 py-1.5 rounded-full bg-slate-900/80 border border-purple-400/30 text-xs font-semibold text-purple-300">
              Celebrating {countdown.yearsKnown} {countdown.yearsKnown === 1 ? 'Year' : 'Years'} of Unbreakable Friendship
            </div>
          )}
        </motion.div>
      ) : countdown.isMissingOrInvalid ? (
        /* MISSING DATE FALLBACK CARD */
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-purple-500/20 mb-8 space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-300">
            <Users className="h-6 w-6" />
          </div>
          <p className="text-base sm:text-lg font-serif italic text-pink-200 max-w-lg mx-auto">
            "Every year, another beautiful chapter of our friendship."
          </p>
          <p className="text-xs text-slate-400">
            Every single day is a special celebration of having you in my life, {name}!
          </p>
        </div>
      ) : (
        /* ACTIVE LIVE COUNTDOWN TIMER */
        <div className="space-y-6 mb-8">
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-purple-300 uppercase">
            COUNTING DOWN TO OUR NEXT YEARLY MILESTONE
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-lg mx-auto">
            {/* DAYS */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-xl flex flex-col items-center justify-center">
              <span className="font-sans text-3xl sm:text-5xl font-black text-white leading-none">
                {countdown.days}
              </span>
              <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-purple-300 uppercase mt-2">
                DAYS
              </span>
            </div>

            {/* HOURS */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-xl flex flex-col items-center justify-center">
              <span className="font-sans text-3xl sm:text-5xl font-black text-white leading-none">
                {String(countdown.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-purple-300 uppercase mt-2">
                HOURS
              </span>
            </div>

            {/* MINUTES */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-xl flex flex-col items-center justify-center">
              <span className="font-sans text-3xl sm:text-5xl font-black text-white leading-none">
                {String(countdown.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-purple-300 uppercase mt-2">
                MINUTES
              </span>
            </div>

            {/* SECONDS */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-xl flex flex-col items-center justify-center">
              <span className="font-sans text-3xl sm:text-5xl font-black text-pink-400 leading-none">
                {String(countdown.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-pink-300 uppercase mt-2">
                SECONDS
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-base font-serif italic text-pink-200/90 max-w-md mx-auto pt-2">
            "Every year, another beautiful chapter of our friendship."
          </p>
        </div>
      )}

      {/* Continue Button for Interactive Sequences */}
      {onContinue && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-sm font-extrabold text-white shadow-xl shadow-pink-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span>EXPLORE OUR SURPRISES & MEMORIES</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};
