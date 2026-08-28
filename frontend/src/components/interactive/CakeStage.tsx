import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Mic, Wind, Scissors, PartyPopper, CheckCircle } from 'lucide-react';
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

  const frostingColor = config?.frostingColor || '#f472b6';
  const candleCount = Math.min(Math.max(config?.candleCount || 3, 1), 9);
  const candleColor = config?.candleColor || '#fbbf24';
  const cakeMessage = config?.cakeMessage || `Happy Birthday ${recipientName} ❤️`;
  const toppings = config?.toppings || 'sprinkles';
  const cakeStyle = config?.cakeStyle || 'double_tier';

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
    setCuttingStep(1); // Step 1: React / Lift

    setTimeout(() => setCuttingStep(2), 600); // Step 2: Knife Appears
    setTimeout(() => setCuttingStep(3), 1300); // Step 3: Knife Cuts Down
    setTimeout(() => setCuttingStep(4), 2200); // Step 4: Slice Separates
    setTimeout(() => setCuttingStep(5), 3000); // Step 5: Slice Moves Outward
    setTimeout(() => setCuttingStep(6), 3700); // Step 6: Reveal Inner Layers
    setTimeout(() => setCuttingStep(7), 4400); // Step 7: Crumb Particles
    setTimeout(() => setCuttingStep(8), 5000); // Step 8: Celebratory Glow
    setTimeout(() => {
      setCuttingStep(9); // Step 9: Message Reveal & Complete
      setStage('complete');
      setTimeout(() => {
        onCakeComplete();
      }, 2500);
    }, 5800);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 text-center select-none py-2 max-w-full overflow-hidden">
      {/* Header Prompt */}
      <div className="mb-3 space-y-1.5 max-w-md">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 shadow-sm backdrop-blur-md">
          <PartyPopper className="h-3.5 w-3.5 text-pink-400" />
          {stage === 'blow'
            ? 'Candle Ceremony'
            : stage === 'cutting'
            ? 'Cake Cutting Ceremony'
            : 'Birthday Celebration!'}
        </span>

        <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
          {stage === 'blow'
            ? 'Blow Out the Candles! 🕯️'
            : stage === 'cutting'
            ? 'Slicing Your Birthday Cake... 🎂'
            : 'Celebration Complete! ✨'}
        </h2>

        <p className="text-xs text-slate-300 font-medium max-w-xs sm:max-w-sm mx-auto">
          {stage === 'blow' && micAllowed === true
            ? 'Blow into your microphone or tap the blow button below'
            : stage === 'blow'
            ? 'Tap the button or candles below to make your birthday wish'
            : stage === 'cutting'
            ? 'Enjoy this sweet moment made with love...'
            : `All wishes granted for ${recipientName}! ❤️`}
        </p>
      </div>

      {/* 3D PERSPECTIVE CAKE CANVAS */}
      <div
        className="relative my-6 flex flex-col items-center justify-center w-full max-w-md"
        style={{ perspective: '1000px' }}
      >
        {/* Celebration Confetti & Glow Aura when candles blown */}
        {candlesBlown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.2 }}
            transition={{ duration: 0.8 }}
            className="absolute -top-16 z-40 flex items-center justify-center gap-4 pointer-events-none"
          >
            <Sparkles className="h-10 w-10 text-amber-300 animate-bounce" />
            <Heart className="h-9 w-9 text-pink-400 fill-pink-400 animate-pulse" />
            <Sparkles className="h-10 w-10 text-rose-300 animate-bounce" />
          </motion.div>
        )}

        {/* Floating Ambient Sparkles around Cake */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <motion.div
            animate={{
              y: [-10, 10, -10],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-2 left-10 text-amber-300/60 text-xs"
          >
            ✨
          </motion.div>
          <motion.div
            animate={{
              y: [8, -12, 8],
              opacity: [0.4, 0.9, 0.4],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-10 right-12 text-pink-400/60 text-xs"
          >
            💖
          </motion.div>
        </div>

        {/* 3D CAKE CONTAINER */}
        <motion.div
          animate={
            cuttingStep === 1
              ? { y: -8, scale: 1.02 }
              : cuttingStep >= 8
              ? { filter: 'drop-shadow(0 0 25px rgba(244,114,182,0.6))' }
              : {}
          }
          transition={{ duration: 0.5 }}
          className="relative flex flex-col items-center justify-center transition-transform"
          style={{ transformStyle: 'preserve-3d', transform: 'rotateX(10deg)' }}
        >
          {/* KNIFE ANIMATION LAYER (Step 2 & 3) */}
          <AnimatePresence>
            {cuttingStep >= 2 && cuttingStep <= 4 && (
              <motion.div
                initial={{ y: -120, opacity: 0, rotate: -25 }}
                animate={
                  cuttingStep >= 3
                    ? { y: 30, opacity: 1, rotate: 0 }
                    : { y: -60, opacity: 1, rotate: -10 }
                }
                exit={{ opacity: 0, y: 60 }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
                className="absolute z-50 pointer-events-none top-0 right-14 sm:right-20"
              >
                {/* 3D Metallic Knife SVG */}
                <svg width="70" height="140" viewBox="0 0 70 140" fill="none" className="drop-shadow-2xl">
                  {/* Handle */}
                  <rect x="28" y="0" width="14" height="45" rx="4" fill="url(#knifeHandle)" />
                  <rect x="25" y="40" width="20" height="8" rx="2" fill="#d1d5db" />
                  {/* Blade */}
                  <path d="M30 48 L48 135 L33 130 Z" fill="url(#knifeBlade)" stroke="#9ca3af" strokeWidth="1" />
                  {/* Blade Shine Line */}
                  <line x1="33" y1="52" x2="43" y2="120" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                  <defs>
                    <linearGradient id="knifeHandle" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#1f2937" />
                      <stop offset="50%" stopColor="#374151" />
                      <stop offset="100%" stopColor="#111827" />
                    </linearGradient>
                    <linearGradient id="knifeBlade" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f3f4f6" />
                      <stop offset="50%" stopColor="#e5e7eb" />
                      <stop offset="100%" stopColor="#9ca3af" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CANDLES LINE ON TOP TIER */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-1 z-30 relative">
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
                      scale: [1, 1.25, 0.95, 1.15, 1],
                      rotate: [-5, 5, -3, 4, 0],
                    }}
                    transition={{
                      duration: 0.5 + (idx % 3) * 0.1,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="relative flex items-center justify-center mb-0.5"
                  >
                    {/* Flame Outer Glow Aura */}
                    <div className="absolute h-8 w-8 rounded-full bg-amber-400/40 blur-md animate-pulse" />
                    {/* Flame Body */}
                    <div className="h-6 w-3.5 rounded-full bg-gradient-to-t from-orange-600 via-amber-500 to-yellow-200 shadow-lg shadow-amber-400/80 border border-yellow-200/50 relative z-10" />
                    {/* Flame Core */}
                    <div className="absolute bottom-1 h-3 w-1.5 rounded-full bg-white opacity-90 z-20" />
                  </motion.div>
                ) : (
                  /* Smoke Puff Trails */
                  <motion.div
                    initial={{ opacity: 1, y: 0, scale: 0.4 }}
                    animate={{ opacity: 0, y: -24, scale: 1.8 }}
                    transition={{ duration: 1.2, delay: idx * 0.08 }}
                    className="h-5 w-4 rounded-full bg-slate-300/70 blur-xs mb-0.5"
                  />
                )}

                {/* Candle Stick */}
                <div
                  className="h-10 w-2.5 rounded-t-md shadow-lg border-x border-white/30 relative overflow-hidden"
                  style={{ backgroundColor: candleColor }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-black/20" />
                </div>
              </div>
            ))}
          </div>

          {/* TOP TIER CAKE (3D Structure) */}
          <div className="relative z-20 flex flex-col items-center">
            {/* Top Surface Oval Cap */}
            <div
              className="w-44 sm:w-56 h-10 rounded-full border-t-2 border-white/50 shadow-md relative overflow-hidden flex items-center justify-center"
              style={{
                backgroundColor: frostingColor,
                filter: 'brightness(1.1)',
                boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.4)',
              }}
            >
              {/* Decorative Toppings */}
              {toppings === 'sprinkles' && (
                <div className="absolute inset-0 flex items-center justify-around opacity-75">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-200" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-300" />
                </div>
              )}
              {toppings === 'berries' && (
                <div className="absolute inset-0 flex items-center justify-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-rose-600 shadow-md border border-rose-400" />
                  <span className="h-3.5 w-3.5 rounded-full bg-red-600 shadow-md border border-red-400" />
                  <span className="h-3 w-3 rounded-full bg-rose-600 shadow-md border border-rose-400" />
                </div>
              )}
              {toppings === 'sparklers' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-amber-200 animate-spin-slow" />
                </div>
              )}

              <span className="relative z-10 text-[11px] sm:text-xs font-black text-white drop-shadow-md tracking-wide px-2 truncate max-w-[90%]">
                {cakeMessage}
              </span>
            </div>

            {/* Top Tier Body Cylinder */}
            <div
              className="w-44 sm:w-56 h-16 sm:h-20 shadow-2xl relative border-x border-white/20 overflow-hidden flex flex-col justify-between"
              style={{
                backgroundColor: frostingColor,
                backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.15), rgba(255,255,255,0.2) 30%, rgba(0,0,0,0.25))',
              }}
            >
              {/* Dripping Frosting SVG Drips Top */}
              <svg className="w-full h-5 text-white/40 fill-current -mt-0.5" viewBox="0 0 200 25" preserveAspectRatio="none">
                <path d="M0,0 C20,15 30,5 40,18 C55,25 65,10 80,20 C95,28 110,12 125,22 C140,28 155,10 170,18 C185,24 195,5 200,0 L200,0 L0,0 Z" />
              </svg>

              {/* Middle Layer Stripe Texture */}
              <div className="w-full h-2 bg-white/20 my-auto shadow-inner" />
            </div>
          </div>

          {/* BOTTOM TIER CAKE (Only for double_tier or heart/luxury preset) */}
          {cakeStyle !== 'single_tier' && (
            <div className="relative z-10 flex flex-col items-center -mt-2">
              {/* Bottom Tier Top Surface Cap */}
              <div
                className="w-56 sm:w-72 h-12 rounded-full border-t-2 border-white/40 shadow-inner relative overflow-hidden"
                style={{
                  backgroundColor: frostingColor,
                  filter: 'brightness(0.95)',
                }}
              />

              {/* Bottom Tier Body Cylinder */}
              <div
                className="w-56 sm:w-72 h-20 sm:h-24 shadow-2xl relative border-x border-white/20 overflow-hidden flex flex-col justify-between"
                style={{
                  backgroundColor: frostingColor,
                  filter: 'brightness(0.9)',
                  backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.2), rgba(255,255,255,0.15) 30%, rgba(0,0,0,0.3))',
                }}
              >
                {/* Dripping Icing */}
                <svg className="w-full h-6 text-white/30 fill-current -mt-0.5" viewBox="0 0 200 25" preserveAspectRatio="none">
                  <path d="M0,0 C15,20 25,8 40,22 C60,30 70,12 85,25 C105,32 120,15 135,26 C155,32 170,12 185,22 C195,28 198,8 200,0 L200,0 L0,0 Z" />
                </svg>

                {/* Decorative Pearl Dots */}
                <div className="flex justify-around items-center px-4 text-white/40 text-xs">
                  <span>&bull; &bull; &bull;</span>
                  <Heart className="h-3.5 w-3.5 fill-white/30 text-white/30" />
                  <span>&bull; &bull; &bull;</span>
                  <Heart className="h-3.5 w-3.5 fill-white/30 text-white/30" />
                  <span>&bull; &bull; &bull;</span>
                </div>
              </div>
            </div>
          )}

          {/* CUT CAKE SLICE SEPARATION ANIMATION (Steps 4 to 7) */}
          {cuttingStep >= 4 && (
            <motion.div
              initial={{ x: 0, y: 0, rotateY: 0 }}
              animate={{
                x: cuttingStep >= 5 ? 75 : 20,
                y: cuttingStep >= 5 ? 15 : 0,
                rotateY: 25,
                scale: 1.05,
              }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute top-12 right-6 sm:right-10 z-40 w-24 sm:w-28 h-32 sm:h-36 rounded-r-xl shadow-2xl overflow-hidden border-2 border-amber-300/80 flex flex-col justify-between"
              style={{
                backgroundColor: frostingColor,
                filter: 'brightness(1.15)',
              }}
            >
              {/* Cake Slice Internal Layers (Sponge + Cream) */}
              <div className="w-full h-full p-2 flex flex-col justify-between bg-gradient-to-b from-amber-100 via-amber-200 to-amber-100">
                <div className="w-full h-3 rounded bg-pink-400/80 shadow-xs" />
                <div className="w-full h-4 bg-amber-900/60 rounded flex items-center justify-center text-[8px] font-bold text-amber-100">
                  Chocolate
                </div>
                <div className="w-full h-3 rounded bg-pink-400/80 shadow-xs" />
                <div className="w-full h-4 bg-amber-800/60 rounded" />
                <div className="w-full h-3 rounded bg-white/90 shadow-xs" />
              </div>
            </motion.div>
          )}

          {/* REVEALED CUT GAP IN CAKE */}
          {cuttingStep >= 4 && (
            <div
              className="absolute top-12 right-6 sm:right-10 z-30 w-24 sm:w-28 h-32 sm:h-36 bg-slate-950/95 border-x-2 border-amber-400/50 shadow-inner flex flex-col items-center justify-center p-2"
              style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
            >
              {/* Inner Cake Texture Lines */}
              <div className="w-full h-1 bg-amber-500/30 my-1" />
              <div className="w-full h-1 bg-pink-500/30 my-1" />
              <div className="w-full h-1 bg-amber-500/30 my-1" />
            </div>
          )}

          {/* CRUMB PARTICLES (Step 7) */}
          {cuttingStep >= 7 && (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 10 }}
              className="absolute bottom-2 right-4 z-40 flex gap-1.5"
            >
              <span className="h-2 w-2 rounded-full bg-amber-400 shadow-md animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shadow-md" />
              <span className="h-2 w-2 rounded-full bg-amber-600 shadow-md" />
            </motion.div>
          )}

          {/* 3D BASE CERAMIC / GLASS PLATE UNDERNEATH */}
          <div
            className="w-64 sm:w-80 h-8 rounded-[100%] bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 border-t-4 border-slate-600/80 shadow-2xl mt-[-6px] relative overflow-hidden"
            style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}
          >
            <div className="absolute inset-x-8 top-1 h-2 rounded-full bg-white/20 blur-xs" />
          </div>
        </motion.div>

        {/* STEP 9: PERSONALIZED BIRTHDAY MESSAGE BANNER REVEAL */}
        <AnimatePresence>
          {cuttingStep >= 8 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-purple-500/20 border border-pink-500/40 shadow-2xl backdrop-blur-xl max-w-sm text-center space-y-1.5"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-pink-300 flex items-center justify-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                Wish Confirmed!
              </span>
              <p className="text-sm sm:text-base font-extrabold text-white font-heading">
                {cakeMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Button Controls */}
      <div className="mt-2 min-h-[50px] flex items-center justify-center">
        {stage === 'blow' && (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleBlowCandles}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-300"
            >
              <Wind className="h-4 w-4 animate-pulse" />
              <span>BLOW OUT CANDLES</span>
            </button>

            {micAllowed === true && (
              <span className="text-[10px] font-semibold text-pink-300 flex items-center gap-1.5 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                <Mic className="h-3 w-3 text-pink-400 animate-pulse" />
                <span>Microphone blow detection active — blow into mic!</span>
              </span>
            )}
          </div>
        )}

        {stage === 'cutting' && (
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-bold text-pink-300 shadow-lg">
            <Scissors className="h-4 w-4 text-pink-400 animate-spin" />
            <span>Slicing cake... Step {cuttingStep} of 9</span>
          </div>
        )}
      </div>
    </div>
  );
};

