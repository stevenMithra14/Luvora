import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Gift, Sparkles } from 'lucide-react';

interface WheelSlice {
  label: string;
  color?: string;
}

interface SurpriseWheelProps {
  config: {
    title?: string;
    slices?: WheelSlice[];
  };
}

export const SurpriseWheelPlayable: React.FC<SurpriseWheelProps> = ({ config }) => {
  const slices = config.slices || [
    { label: 'Get a giant warm hug ❤️', color: '#ec4899' },
    { label: 'Pick our next movie 🎬', color: '#8b5cf6' },
    { label: 'Make a birthday wish ✨', color: '#f59e0b' },
    { label: 'Open secret message 🎁', color: '#10b981' },
    { label: 'Free dessert on me 🍦', color: '#3b82f6' }
  ];

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedSlice, setSelectedSlice] = useState<WheelSlice | null>(null);

  const handleSpin = () => {
    if (isSpinning || slices.length === 0) return;
    setIsSpinning(true);
    setSelectedSlice(null);

    const randomIndex = Math.floor(Math.random() * slices.length);
    const degreesPerSlice = 360 / slices.length;
    const randomRotations = 5 * 360; // 5 full spins
    const targetDegree = randomRotations + (slices.length - randomIndex - 0.5) * degreesPerSlice;

    setRotation(targetDegree);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedSlice(slices[randomIndex]);
    }, 3500);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-950 border border-emerald-500/30 shadow-2xl text-center space-y-6">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          Surprise Wheel
        </span>
        <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
          {config?.title || 'Spin the Surprise Wheel'}
        </h3>
        <p className="text-xs text-slate-400">
          Press SPIN to unlock your special surprise gift!
        </p>
      </div>

      {/* Wheel Canvas Container */}
      <div className="relative h-64 w-64 mx-auto flex items-center justify-center">
        {/* Top Pointer Arrow */}
        <div className="absolute -top-3 z-30 w-0 h-0 border-l-8 border-r-8 border-t-[16px] border-l-transparent border-r-transparent border-t-pink-500 drop-shadow-md" />

        {/* Animated Rotating Wheel */}
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 3.5, ease: [0.15, 0.99, 0.35, 1] }}
          className="h-full w-full rounded-full border-4 border-slate-800 shadow-2xl relative overflow-hidden flex items-center justify-center bg-slate-900"
        >
          {slices.map((slice, idx) => {
            const angle = (360 / slices.length) * idx;
            return (
              <div
                key={idx}
                style={{
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: '50% 50%',
                }}
                className="absolute inset-0 flex items-start justify-center pt-3"
              >
                <span
                  style={{ color: slice.color || '#ec4899' }}
                  className="text-[11px] font-extrabold max-w-[80px] truncate drop-shadow"
                >
                  {slice.label}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* Center Spin Trigger Button */}
        <button
          type="button"
          onClick={handleSpin}
          disabled={isSpinning}
          className="absolute z-20 h-16 w-16 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white font-extrabold text-xs shadow-xl border-2 border-white flex flex-col items-center justify-center hover:scale-105 active:scale-95 cursor-pointer transition-all"
        >
          <RotateCw className={`h-4 w-4 mb-0.5 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>SPIN</span>
        </button>
      </div>

      {/* Result Modal / Notification */}
      <AnimatePresence>
        {selectedSlice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 space-y-2 shadow-xl"
          >
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400">
              <Gift className="h-4 w-4" />
              <span>Surprise Unlocked!</span>
            </div>
            <h4 className="font-heading text-lg font-bold text-white">
              "{selectedSlice.label}"
            </h4>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
