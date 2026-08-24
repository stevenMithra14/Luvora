import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BirthdayCountdownProps {
  targetDateStr?: string;
  recipientName?: string;
  onSkip?: () => void;
}

export const BirthdayCountdown: React.FC<BirthdayCountdownProps> = ({
  targetDateStr,
  recipientName = 'Steven',
  onSkip,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 327,
    hours: 1,
    minutes: 22,
    seconds: 11,
    milliseconds: 325,
  });

  useEffect(() => {
    let animFrame: number;

    const calculateTime = () => {
      const now = new Date();
      let target = targetDateStr ? new Date(targetDateStr) : null;

      if (!target || isNaN(target.getTime())) {
        // Default target date for demo if not provided
        target = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate() + 15);
      }

      target.setFullYear(now.getFullYear());
      if (target.getTime() < now.getTime()) {
        target.setFullYear(now.getFullYear() + 1);
      }

      const diff = target.getTime() - now.getTime();
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        const milliseconds = Math.floor(diff % 1000);
        setTimeLeft({ days, hours, minutes, seconds, milliseconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
      }

      animFrame = requestAnimationFrame(calculateTime);
    };

    animFrame = requestAnimationFrame(calculateTime);
    return () => cancelAnimationFrame(animFrame);
  }, [targetDateStr]);

  const name = recipientName.trim() || 'Steven';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-[460px] w-full flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl"
    >
      {/* Subtitle */}
      <span className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] text-amber-400 mb-2">
        UNTIL {name.toUpperCase()}'S BIRTHDAY
      </span>

      {/* Main Recipient Name Title */}
      <h1 className="font-serif text-5xl sm:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-400 to-amber-200 mb-8 lowercase">
        {name}
      </h1>

      {/* 5 Countdown Cards: DAYS | HOURS | MIN | SEC | MS */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-lg mx-auto mb-8">
        {/* DAYS */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center min-w-[55px] sm:min-w-[75px]">
          <span className="font-sans text-2xl sm:text-4xl font-extrabold text-white leading-none">
            {timeLeft.days}
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1">
            DAYS
          </span>
        </div>

        {/* HOURS */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center min-w-[55px] sm:min-w-[75px]">
          <span className="font-sans text-2xl sm:text-4xl font-extrabold text-white leading-none">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1">
            HOURS
          </span>
        </div>

        {/* MIN */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center min-w-[55px] sm:min-w-[75px]">
          <span className="font-sans text-2xl sm:text-4xl font-extrabold text-white leading-none">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1">
            MIN
          </span>
        </div>

        {/* SEC */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center min-w-[55px] sm:min-w-[75px]">
          <span className="font-sans text-2xl sm:text-4xl font-extrabold text-white leading-none">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1">
            SEC
          </span>
        </div>

        {/* MS */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center min-w-[55px] sm:min-w-[75px]">
          <span className="font-sans text-2xl sm:text-4xl font-extrabold text-white leading-none font-mono">
            {String(timeLeft.milliseconds).padStart(3, '0')}
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1">
            MS
          </span>
        </div>
      </div>

      {/* Skip Countdown Button */}
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="px-7 py-3 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          Skip countdown
        </button>
      )}
    </motion.div>
  );
};
