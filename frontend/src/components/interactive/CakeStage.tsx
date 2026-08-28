import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Wind, Scissors, PartyPopper, CheckCircle } from 'lucide-react';
import { CakeConfig } from '../../context/WizardContext';

interface CakeStageProps {
  config?: CakeConfig;
  recipientName?: string;
  onCakeComplete: () => void;
}

export const CakeStage: React.FC<CakeStageProps> = ({
  config,
  recipientName = 'Someone Special',
  onCakeComplete,
}) => {
  const [stage, setStage] = useState<'blow' | 'cutting' | 'complete'>('blow');
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [cuttingStep, setCuttingStep] = useState<number>(0);
  const [micAllowed, setMicAllowed] = useState<boolean | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Customization props (ALWAYS force 3 candles as required)
  const frostingColor = config?.frostingColor || '#f472b6'; // Pink icing
  const candleCount = 3; // ALWAYS EXACTLY 3 CANDLES
  const candleColor = config?.candleColor || '#9333ea'; // Purple candles
  const cakeMessage = config?.cakeMessage || `Happy Birthday ${recipientName} ❤️`;

  // Microphone Blow Detection
  useEffect(() => {
    let isMounted = true;

    async function initMic() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          if (isMounted) setMicAllowed(false);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        setMicAllowed(true);

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioCtxRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let blowCounter = 0;

        const checkAudio = () => {
          if (!isMounted || candlesBlown) return;
          analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;

          if (avg > 55) {
            blowCounter += 1;
            if (blowCounter >= 4) {
              handleBlowCandles();
              return;
            }
          } else {
            blowCounter = Math.max(0, blowCounter - 1);
          }

          animFrameRef.current = requestAnimationFrame(checkAudio);
        };

        animFrameRef.current = requestAnimationFrame(checkAudio);
      } catch (err) {
        if (isMounted) {
          setMicAllowed(false);
        }
      }
    }

    if (stage === 'blow' && !candlesBlown) {
      initMic();
    }

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stage, candlesBlown]);

  const handleBlowCandles = () => {
    if (candlesBlown) return;
    setCandlesBlown(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    // Automatically trigger smooth cutting sequence after candle blowout
    setTimeout(() => {
      startCakeCuttingSequence();
    }, 1200);
  };

  const startCakeCuttingSequence = () => {
    setStage('cutting');
    setCuttingStep(1); // Step 1: Camera focus & knife enters (~500ms)
    setTimeout(() => setCuttingStep(2), 700); // Step 2: Knife presses down & cuts (~1100ms)
    setTimeout(() => setCuttingStep(3), 1800); // Step 3: Knife retracts (~400ms)
    setTimeout(() => setCuttingStep(4), 2300); // Step 4: Slice separates & moves outward (~800ms)
    setTimeout(() => setCuttingStep(5), 3200); // Step 5: Slice settles on plate & crumbs fall (~600ms)
    setTimeout(() => setCuttingStep(6), 4000); // Step 6: Gentle celebration glow (~600ms)
    setTimeout(() => {
      setCuttingStep(7); // Step 7: Personalized message banner reveal & completion
      setStage('complete');
      setTimeout(() => {
        onCakeComplete();
      }, 2500);
    }, 4800);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 text-center select-none py-2 max-w-full overflow-hidden font-sans">
      {/* Header Prompt */}
      <div className="mb-2 space-y-1 max-w-md relative z-30">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm backdrop-blur-md">
          <PartyPopper className="h-3.5 w-3.5 text-purple-400" />
          {stage === 'blow'
            ? 'Birthday Candle Ceremony'
            : stage === 'cutting'
            ? 'Cake Cutting Sequence'
            : 'Birthday Celebration Complete!'}
        </span>

        <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
          {stage === 'blow'
            ? 'Blow Out the Candles! 🕯️'
            : stage === 'cutting'
            ? 'Slicing Your Birthday Cake... 🎂'
            : 'Wishes Granted! ✨'}
        </h2>

        <p className="text-[11px] sm:text-xs text-slate-300 font-medium max-w-xs sm:max-w-sm mx-auto">
          {stage === 'blow' && micAllowed === true
            ? 'Blow into your microphone or tap the button below'
            : stage === 'blow'
            ? 'Tap the button or candles below to make your birthday wish'
            : stage === 'cutting'
            ? 'Enjoy this sweet celebration moment...'
            : `Happy Birthday to ${recipientName}! ❤️`}
        </p>
      </div>

      {/* 3D CANVAS STAGE */}
      <div className="relative my-3 flex flex-col items-center justify-center w-full max-w-md">
        {/* Soft Controlled Celebration Glow Behind Cake (Will NOT overlap text) */}
        {candlesBlown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1.05 }}
            transition={{ duration: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-tr from-purple-600/30 via-pink-500/30 to-amber-400/20 blur-2xl pointer-events-none z-0"
          />
        )}

        {/* 3D CAKE & STAND CONTAINER */}
        <div className="relative flex flex-col items-center justify-center z-10">
          {/* EXACTLY 3 PURPLE CANDLES ON TOP TIER */}
          <div className="flex items-center justify-center gap-4 mb-[-6px] z-30 relative">
            {Array.from({ length: candleCount }).map((_, idx) => (
              <div
                key={idx}
                className="relative flex flex-col items-center cursor-pointer group"
                onClick={handleBlowCandles}
              >
                {/* Flame or Smoke */}
                {!candlesBlown ? (
                  <motion.div
                    animate={{
                      scale: [1, 1.15, 0.95, 1.1, 1],
                      rotate: [-3, 3, -1, 2, 0],
                    }}
                    transition={{
                      duration: 0.5 + idx * 0.1,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="relative flex items-center justify-center mb-0.5"
                  >
                    <div className="absolute h-7 w-7 rounded-full bg-amber-400/40 blur-xs animate-pulse" />
                    <div className="h-5 w-3 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-200 shadow-md shadow-amber-400/70 border border-yellow-100/60 relative z-10" />
                    <div className="absolute bottom-1 h-2.5 w-1 rounded-full bg-white opacity-90 z-20" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 1, y: 0, scale: 0.4 }}
                    animate={{ opacity: 0, y: -20, scale: 1.5 }}
                    transition={{ duration: 1, delay: idx * 0.08 }}
                    className="h-5 w-3 rounded-full bg-slate-300/60 blur-xs mb-0.5"
                  />
                )}

                {/* Candle Stick */}
                <div
                  className="h-10 w-2.5 rounded-t-md shadow-md border-x border-purple-300/40 relative overflow-hidden flex flex-col justify-between items-center"
                  style={{ backgroundColor: candleColor }}
                >
                  <div className="w-full h-full bg-gradient-to-r from-white/30 via-transparent to-black/30" />
                </div>
              </div>
            ))}
          </div>

          {/* MAIN 3D CAKE RENDERING CONTAINER */}
          <div className="relative w-64 sm:w-72 h-44 sm:h-52 flex flex-col items-center justify-end z-20">
            {/* REALISTIC PROPORTIONAL 3D KNIFE */}
            <AnimatePresence>
              {cuttingStep >= 1 && cuttingStep <= 3 && (
                <motion.div
                  initial={{ x: 65, y: -70, opacity: 0, rotate: -25 }}
                  animate={
                    cuttingStep === 2
                      ? { x: 32, y: 15, opacity: 1, rotate: -8 } // Presses into cake
                      : cuttingStep === 3
                      ? { x: 50, y: -30, opacity: 0.8, rotate: -18 } // Retracts
                      : { x: 55, y: -45, opacity: 1, rotate: -20 } // Enters
                  }
                  exit={{ opacity: 0, y: -60 }}
                  transition={{
                    duration: cuttingStep === 2 ? 1.0 : 0.4,
                    ease: [0.25, 0.1, 0.25, 1.0],
                  }}
                  className="absolute z-50 pointer-events-none top-0 right-10"
                >
                  <svg width="45" height="90" viewBox="0 0 45 90" fill="none" className="drop-shadow-xl">
                    {/* Metallic Blade with Gradient */}
                    <path
                      d="M18 35 L38 82 L20 78 Z"
                      fill="url(#knifeBladeGradient)"
                      stroke="#cbd5e1"
                      strokeWidth="0.75"
                    />
                    {/* Knife Blade Spine Highlight */}
                    <path d="M18 35 L20 78" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />

                    {/* Elegant Knife Handle */}
                    <rect x="14" y="2" width="9" height="34" rx="3.5" fill="#2e1065" stroke="#a855f7" strokeWidth="1" />
                    <circle cx="18.5" cy="8" r="1.5" fill="#f59e0b" />
                    <circle cx="18.5" cy="28" r="1.5" fill="#f59e0b" />

                    <defs>
                      <linearGradient id="knifeBladeGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="40%" stopColor="#f1f5f9" />
                        <stop offset="70%" stopColor="#94a3b8" />
                        <stop offset="100%" stopColor="#64748b" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TOP TIER (Upper Layer) */}
            <div className="relative z-20 flex flex-col items-center">
              {/* Top Surface Cap */}
              <div
                className="w-44 sm:w-52 h-8 rounded-full border-t border-white/50 shadow-sm relative flex items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: frostingColor,
                  boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.4)',
                }}
              >
                {/* Round Pink Candy Ornaments */}
                <div className="absolute inset-0 flex items-center justify-around px-4 opacity-90">
                  <span className="h-2.5 w-2.5 rounded-full bg-pink-400 border border-white shadow-xs" />
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-400 border border-white shadow-xs" />
                  <span className="h-2.5 w-2.5 rounded-full bg-pink-400 border border-white shadow-xs" />
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-400 border border-white shadow-xs" />
                </div>
              </div>

              {/* Top Tier Body Cylinder */}
              <div className="w-44 sm:w-52 h-14 sm:h-16 bg-[#4a2614] rounded-b-2xl shadow-lg relative border-x border-[#361a0d] overflow-hidden flex flex-col justify-between">
                {/* Natural Dripping Icing SVG */}
                <svg className="w-full h-6 text-pink-300 fill-current -mt-0.5" viewBox="0 0 200 30" preserveAspectRatio="none">
                  <path d="M0,0 L200,0 L200,8 C185,22 170,10 155,25 C140,30 125,12 110,26 C95,30 80,10 65,24 C50,28 35,8 20,20 C10,24 0,8 0,8 Z" />
                </svg>

                {/* Pink Candy Balls */}
                <div className="flex justify-around items-center px-3 -mt-2.5 z-10">
                  <span className="h-2 w-2 rounded-full bg-pink-400 border border-white shadow-xs" />
                  <span className="h-2 w-2 rounded-full bg-pink-400 border border-white shadow-xs" />
                  <span className="h-2 w-2 rounded-full bg-pink-400 border border-white shadow-xs" />
                  <span className="h-2 w-2 rounded-full bg-pink-400 border border-white shadow-xs" />
                </div>

                {/* Middle Pink Cream Stripe */}
                <div className="w-full h-1.5 bg-pink-300/40 my-auto shadow-inner" />
              </div>
            </div>

            {/* BOTTOM TIER (Lower Layer) */}
            <div className="relative z-10 flex flex-col items-center -mt-2.5">
              {/* Bottom Surface Cap */}
              <div
                className="w-56 sm:w-64 h-9 rounded-full border-t border-white/40 shadow-inner relative flex items-center justify-center"
                style={{ backgroundColor: frostingColor }}
              >
                <div className="flex justify-around w-full px-6">
                  <span className="h-2.5 w-2.5 rounded-full bg-pink-400 border border-white/60 shadow-xs" />
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-400 border border-white/60 shadow-xs" />
                  <span className="h-2.5 w-2.5 rounded-full bg-pink-400 border border-white/60 shadow-xs" />
                </div>
              </div>

              {/* Bottom Tier Body Cylinder */}
              <div className="w-56 sm:w-64 h-18 sm:h-20 bg-[#3f1f10] rounded-b-3xl shadow-xl relative border-x border-[#2c1409] overflow-hidden flex flex-col justify-between">
                {/* Dripping Icing */}
                <svg className="w-full h-7 text-pink-300 fill-current -mt-0.5" viewBox="0 0 200 30" preserveAspectRatio="none">
                  <path d="M0,0 L200,0 L200,10 C185,26 170,12 150,28 C130,32 115,14 95,28 C75,32 60,12 40,24 C20,28 10,10 0,10 Z" />
                </svg>

                {/* Pink Candy Balls */}
                <div className="flex justify-around items-center px-4 -mt-3 z-10">
                  <span className="h-2.5 w-2.5 rounded-full bg-pink-400 border border-white shadow-xs" />
                  <span className="h-2.5 w-2.5 rounded-full bg-pink-400 border border-white shadow-xs" />
                  <span className="h-2.5 w-2.5 rounded-full bg-pink-400 border border-white shadow-xs" />
                  <span className="h-2.5 w-2.5 rounded-full bg-pink-400 border border-white shadow-xs" />
                  <span className="h-2.5 w-2.5 rounded-full bg-pink-400 border border-white shadow-xs" />
                </div>

                {/* Middle Pink Cream Stripe */}
                <div className="w-full h-2 bg-pink-300/40 my-auto shadow-inner" />
              </div>
            </div>

            {/* REVEALED CUT WEDGES INSIDE MAIN CAKE (Step 4+) */}
            {cuttingStep >= 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="absolute right-5 sm:right-7 bottom-2 z-25 w-12 sm:w-14 h-24 sm:h-28 bg-gradient-to-r from-[#2c1409] via-[#3f1f10] to-[#1e0b04] border-l border-pink-400/40 rounded-r-md shadow-inner flex flex-col justify-around p-1"
              >
                {/* Exposed Internal Sponge & Cream Layers */}
                <div className="w-full h-1 bg-pink-300/80 rounded" />
                <div className="w-full h-1 bg-[#4a2614] rounded" />
                <div className="w-full h-1 bg-pink-300/80 rounded" />
                <div className="w-full h-1 bg-[#361a0d] rounded" />
                <div className="w-full h-1 bg-pink-300/80 rounded" />
              </motion.div>
            )}

            {/* SEPARATED 15-20% CAKE SLICE ON PLATE (Steps 4 to 6) */}
            {cuttingStep >= 4 && (
              <motion.div
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.95 }}
                animate={
                  cuttingStep >= 5
                    ? { x: 52, y: 12, opacity: 1, scale: 1 } // Settles smoothly
                    : { x: 35, y: 6, opacity: 0.95, scale: 0.98 } // Separating
                }
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-1 sm:right-3 bottom-0 z-40 flex flex-col items-center"
              >
                {/* 15-20% Slice Body */}
                <div className="w-14 sm:w-16 h-22 sm:h-26 rounded-r-xl bg-[#3f1f10] border border-pink-300/70 shadow-2xl overflow-hidden flex flex-col justify-between relative">
                  {/* Slice Top Pink Frosting */}
                  <div
                    className="w-full h-4 sm:h-5 border-b border-white/40 relative flex items-center justify-center"
                    style={{ backgroundColor: frostingColor }}
                  >
                    <span className="h-2 w-2 rounded-full bg-pink-400 border border-white" />
                  </div>

                  {/* Slice Internal Sponge & Pink Filling Cross-Section */}
                  <div className="w-full flex-1 p-1 flex flex-col justify-around bg-gradient-to-b from-[#4a2614] via-[#3f1f10] to-[#2c1409]">
                    <div className="w-full h-1 bg-[#4a2614] rounded" />
                    <div className="w-full h-1.5 bg-pink-300 rounded shadow-xs" />
                    <div className="w-full h-1.5 bg-[#361a0d] rounded" />
                    <div className="w-full h-1.5 bg-pink-300 rounded shadow-xs" />
                    <div className="w-full h-1 bg-[#2c1409] rounded" />
                  </div>
                </div>

                {/* Dessert Plate Under Slice */}
                <div className="w-18 sm:w-20 h-3 rounded-[100%] bg-gradient-to-r from-purple-300 via-white to-purple-200 border border-purple-300 shadow-md -mt-1" />
              </motion.div>
            )}

            {/* FALLING CRUMBS (Step 5) */}
            {cuttingStep === 5 && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.8 }}
                className="absolute right-12 bottom-3 z-30 flex gap-1 pointer-events-none"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-800 shadow-xs" />
                <span className="h-1 w-1 rounded-full bg-pink-400 shadow-xs" />
                <span className="h-1.5 w-1.5 rounded-full bg-amber-900 shadow-xs" />
              </motion.div>
            )}

            {/* 3D PURPLE CAKE STAND (Pedestal Base + Stem + Top Plate) */}
            <div className="relative z-0 flex flex-col items-center -mt-2 w-full">
              {/* Top Plate */}
              <div
                className="w-64 sm:w-72 h-8 rounded-[100%] bg-gradient-to-r from-purple-700 via-purple-500 to-purple-800 border-t-2 border-purple-300 shadow-xl relative overflow-hidden"
                style={{ boxShadow: '0 12px 28px rgba(0,0,0,0.5)' }}
              >
                <div className="absolute inset-x-8 top-0.5 h-1.5 rounded-full bg-white/30 blur-xs" />
              </div>
              {/* Stem */}
              <div className="w-12 sm:w-14 h-8 bg-gradient-to-b from-purple-600 via-purple-700 to-purple-900 border-x border-purple-400/30 shadow-md -mt-1" />
              {/* Base */}
              <div className="w-36 sm:w-44 h-6 rounded-[100%] bg-gradient-to-r from-purple-800 via-purple-600 to-purple-900 border-t border-purple-300 shadow-xl -mt-1" />
            </div>
          </div>
        </div>

        {/* REVEALED PERSONALIZED BIRTHDAY MESSAGE BANNER */}
        <AnimatePresence>
          {cuttingStep >= 7 && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-4 p-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-purple-700/30 border border-purple-400/50 shadow-2xl backdrop-blur-xl max-w-xs sm:max-w-sm text-center space-y-1 z-30"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300 flex items-center justify-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                Wish Confirmed!
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-white font-heading">
                {cakeMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Controls */}
      <div className="mt-1 min-h-[46px] flex items-center justify-center z-30 relative">
        {stage === 'blow' && (
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={handleBlowCandles}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-300"
            >
              <Wind className="h-4 w-4 animate-pulse" />
              <span>BLOW OUT CANDLES</span>
            </button>

            {micAllowed === true && (
              <span className="text-[10px] font-semibold text-purple-300 flex items-center gap-1 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                <Mic className="h-3 w-3 text-purple-400 animate-pulse" />
                <span>Microphone blow active — blow into mic!</span>
              </span>
            )}
          </div>
        )}

        {stage === 'cutting' && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-bold text-purple-300 shadow-md">
            <Scissors className="h-3.5 w-3.5 text-purple-400 animate-spin" />
            <span>Slicing cake... Step {cuttingStep} of 7</span>
          </div>
        )}
      </div>
    </div>
  );
};
