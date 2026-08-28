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

  // Customization props (ALWAYS force 3 candles as required)
  const frostingColor = config?.frostingColor || '#f472b6'; // Pink icing
  const candleCount = 3; // ALWAYS EXACTLY 3 CANDLES
  const candleColor = config?.candleColor || '#a855f7'; // Purple candles
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
    setCuttingStep(1); // Step 1: React / Knife Appears
    setTimeout(() => setCuttingStep(2), 700); // Step 2: Knife Slices
    setTimeout(() => setCuttingStep(3), 1500); // Step 3: Slice Separates
    setTimeout(() => setCuttingStep(4), 2300); // Step 4: Slice Moves Out
    setTimeout(() => setCuttingStep(5), 3100); // Step 5: Inner Cake Texture Revealed
    setTimeout(() => setCuttingStep(6), 3900); // Step 6: Crumb particles & glow
    setTimeout(() => {
      setCuttingStep(7); // Step 7: Message Revealed & Complete
      setStage('complete');
      setTimeout(() => {
        onCakeComplete();
      }, 2500);
    }, 4700);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 text-center select-none py-2 max-w-full overflow-hidden font-sans">
      {/* Header Prompt */}
      <div className="mb-3 space-y-1.5 max-w-md">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm backdrop-blur-md">
          <PartyPopper className="h-3.5 w-3.5 text-purple-400" />
          {stage === 'blow'
            ? 'Birthday Candle Ceremony'
            : stage === 'cutting'
            ? 'Cake Cutting Sequence'
            : 'Birthday Celebration Complete!'}
        </span>

        <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
          {stage === 'blow'
            ? 'Blow Out the Candles! 🕯️'
            : stage === 'cutting'
            ? 'Slicing Your Birthday Cake... 🎂'
            : 'Wishes Granted! ✨'}
        </h2>

        <p className="text-xs text-slate-300 font-medium max-w-xs sm:max-w-sm mx-auto">
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
      <div
        className="relative my-4 flex flex-col items-center justify-center w-full max-w-md"
        style={{ perspective: '1000px' }}
      >
        {/* Celebration Aura */}
        {candlesBlown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.2 }}
            transition={{ duration: 0.8 }}
            className="absolute -top-14 z-40 flex items-center justify-center gap-4 pointer-events-none"
          >
            <Sparkles className="h-10 w-10 text-amber-300 animate-bounce" />
            <Heart className="h-9 w-9 text-purple-400 fill-purple-400 animate-pulse" />
            <Sparkles className="h-10 w-10 text-pink-300 animate-bounce" />
          </motion.div>
        )}

        {/* 3D CAKE & STAND CONTAINER */}
        <motion.div
          animate={
            cuttingStep === 1
              ? { y: -6, scale: 1.02 }
              : cuttingStep >= 6
              ? { filter: 'drop-shadow(0 0 30px rgba(168,85,247,0.5))' }
              : {}
          }
          transition={{ duration: 0.5 }}
          className="relative flex flex-col items-center justify-center transition-transform"
          style={{ transformStyle: 'preserve-3d', transform: 'rotateX(8deg)' }}
        >
          {/* KNIFE ANIMATION (Steps 1 & 2) */}
          <AnimatePresence>
            {cuttingStep >= 1 && cuttingStep <= 3 && (
              <motion.div
                initial={{ x: 120, y: -80, opacity: 0, rotate: -35 }}
                animate={
                  cuttingStep >= 2
                    ? { x: 30, y: 10, opacity: 1, rotate: -5 }
                    : { x: 80, y: -40, opacity: 1, rotate: -25 }
                }
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="absolute z-50 pointer-events-none top-4 right-8 sm:right-14"
              >
                <svg width="80" height="150" viewBox="0 0 80 150" fill="none" className="drop-shadow-2xl">
                  <rect x="32" y="0" width="16" height="50" rx="5" fill="#3b0764" stroke="#a855f7" strokeWidth="1.5" />
                  <path d="M34 50 L56 145 L38 140 Z" fill="url(#knifeBladeGrad)" stroke="#cbd5e1" strokeWidth="1" />
                  <defs>
                    <linearGradient id="knifeBladeGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="50%" stopColor="#e2e8f0" />
                      <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* EXACTLY 3 CANDLES ON TOP TIER */}
          <div className="flex items-center justify-center gap-4 mb-[-6px] z-30 relative">
            {Array.from({ length: candleCount }).map((_, idx) => (
              <div
                key={idx}
                className="relative flex flex-col items-center cursor-pointer group"
                onClick={handleBlowCandles}
              >
                {/* Candle Flame / Smoke */}
                {!candlesBlown ? (
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 0.95, 1.15, 1],
                      rotate: [-4, 4, -2, 3, 0],
                    }}
                    transition={{
                      duration: 0.5 + idx * 0.1,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="relative flex items-center justify-center mb-0.5"
                  >
                    {/* Outer Glow */}
                    <div className="absolute h-9 w-9 rounded-full bg-amber-400/50 blur-md animate-pulse" />
                    {/* Flame Body */}
                    <div className="h-6 w-3.5 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-200 shadow-lg shadow-amber-400/80 border border-yellow-100/60 relative z-10" />
                    {/* Core */}
                    <div className="absolute bottom-1 h-3 w-1.5 rounded-full bg-white opacity-90 z-20" />
                  </motion.div>
                ) : (
                  /* Smoke puff */
                  <motion.div
                    initial={{ opacity: 1, y: 0, scale: 0.4 }}
                    animate={{ opacity: 0, y: -26, scale: 1.8 }}
                    transition={{ duration: 1.2, delay: idx * 0.1 }}
                    className="h-6 w-4 rounded-full bg-slate-300/70 blur-xs mb-0.5"
                  />
                )}

                {/* Candle Stick (Purple Cylindrical Candle) */}
                <div
                  className="h-11 w-3 rounded-t-md shadow-lg border-x border-purple-300/40 relative overflow-hidden flex flex-col justify-between items-center"
                  style={{ backgroundColor: candleColor }}
                >
                  <div className="w-full h-full bg-gradient-to-r from-white/30 via-transparent to-black/30" />
                </div>
              </div>
            ))}
          </div>

          {/* TOP TIER (Upper Layer) */}
          <div className="relative z-20 flex flex-col items-center">
            {/* Top Surface Cap */}
            <div
              className="w-44 sm:w-56 h-10 rounded-full border-t-2 border-white/50 shadow-md relative flex items-center justify-center overflow-hidden"
              style={{
                backgroundColor: frostingColor,
                boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.4)',
              }}
            >
              {/* Pink Round Candies Decorating Top Tier Surface */}
              <div className="absolute inset-0 flex items-center justify-around px-3 opacity-90">
                <span className="h-3 w-3 rounded-full bg-pink-500 border border-white/60 shadow-sm" />
                <span className="h-3 w-3 rounded-full bg-purple-500 border border-white/60 shadow-sm" />
                <span className="h-3 w-3 rounded-full bg-pink-500 border border-white/60 shadow-sm" />
                <span className="h-3 w-3 rounded-full bg-purple-500 border border-white/60 shadow-sm" />
              </div>
            </div>

            {/* Top Tier Body Cylinder (Chocolate base + dripping pink icing) */}
            <div className="w-44 sm:w-56 h-16 sm:h-20 bg-[#4a2614] rounded-b-2xl shadow-xl relative border-x border-[#361a0d] overflow-hidden flex flex-col justify-between">
              {/* Natural Dripping Icing SVG */}
              <svg className="w-full h-8 text-pink-300 fill-current -mt-0.5" viewBox="0 0 200 30" preserveAspectRatio="none">
                <path d="M0,0 L200,0 L200,8 C185,22 170,10 155,25 C140,30 125,12 110,26 C95,30 80,10 65,24 C50,28 35,8 20,20 C10,24 0,8 0,8 Z" />
              </svg>

              {/* Decorative Round Pink Berries on Dripping Edge */}
              <div className="flex justify-around items-center px-2 -mt-3 z-10">
                <span className="h-2.5 w-2.5 rounded-full bg-pink-400 border border-white shadow-xs" />
                <span className="h-2.5 w-2.5 rounded-full bg-pink-400 border border-white shadow-xs" />
                <span className="h-2.5 w-2.5 rounded-full bg-pink-400 border border-white shadow-xs" />
                <span className="h-2.5 w-2.5 rounded-full bg-pink-400 border border-white shadow-xs" />
              </div>

              {/* Middle Layer Frosting Stripe */}
              <div className="w-full h-2 bg-pink-300/40 my-auto shadow-inner" />
            </div>
          </div>

          {/* BOTTOM TIER (Lower Layer) */}
          <div className="relative z-10 flex flex-col items-center -mt-3">
            {/* Bottom Tier Surface Cap */}
            <div
              className="w-56 sm:w-72 h-12 rounded-full border-t-2 border-white/40 shadow-inner relative flex items-center justify-center"
              style={{ backgroundColor: frostingColor }}
            >
              {/* Perimeter Candies */}
              <div className="flex justify-around w-full px-6">
                <span className="h-3 w-3 rounded-full bg-pink-500 border border-white/60 shadow-xs" />
                <span className="h-3 w-3 rounded-full bg-purple-500 border border-white/60 shadow-xs" />
                <span className="h-3 w-3 rounded-full bg-pink-500 border border-white/60 shadow-xs" />
              </div>
            </div>

            {/* Bottom Tier Body Cylinder (Chocolate base + dripping pink icing) */}
            <div className="w-56 sm:w-72 h-20 sm:h-24 bg-[#3f1f10] rounded-b-3xl shadow-2xl relative border-x border-[#2c1409] overflow-hidden flex flex-col justify-between">
              {/* Dripping Icing */}
              <svg className="w-full h-9 text-pink-300 fill-current -mt-0.5" viewBox="0 0 200 30" preserveAspectRatio="none">
                <path d="M0,0 L200,0 L200,10 C185,26 170,12 150,28 C130,32 115,14 95,28 C75,32 60,12 40,24 C20,28 10,10 0,10 Z" />
              </svg>

              {/* Round Pink Candy Ornaments */}
              <div className="flex justify-around items-center px-4 -mt-4 z-10">
                <span className="h-3 w-3 rounded-full bg-pink-400 border border-white shadow-xs" />
                <span className="h-3 w-3 rounded-full bg-pink-400 border border-white shadow-xs" />
                <span className="h-3 w-3 rounded-full bg-pink-400 border border-white shadow-xs" />
                <span className="h-3 w-3 rounded-full bg-pink-400 border border-white shadow-xs" />
                <span className="h-3 w-3 rounded-full bg-pink-400 border border-white shadow-xs" />
              </div>

              {/* Middle Layer Frosting Stripe */}
              <div className="w-full h-2.5 bg-pink-300/40 my-auto shadow-inner" />
            </div>
          </div>

          {/* CUT CAKE SLICE ANIMATION (Steps 3 to 6) */}
          {cuttingStep >= 3 && (
            <motion.div
              initial={{ x: 0, y: 0, rotateY: 0 }}
              animate={{
                x: cuttingStep >= 4 ? 75 : 25,
                y: cuttingStep >= 4 ? 12 : 0,
                rotateY: 20,
                scale: 1.05,
              }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute top-10 right-4 sm:right-8 z-40 w-24 sm:w-28 h-32 sm:h-36 rounded-r-xl shadow-2xl overflow-hidden border-2 border-pink-300 flex flex-col justify-between bg-[#3f1f10]"
            >
              {/* Internal Layer Textures (Chocolate Sponge + Pink Cream Filling) */}
              <div className="w-full h-full p-2 flex flex-col justify-between bg-gradient-to-b from-[#4a2614] via-[#3f1f10] to-[#361a0d]">
                <div className="w-full h-2.5 rounded bg-pink-400 shadow-xs" />
                <div className="w-full h-3 bg-[#2c1409] rounded flex items-center justify-center text-[8px] font-bold text-amber-200">
                  Rich Chocolate
                </div>
                <div className="w-full h-2.5 rounded bg-pink-400 shadow-xs" />
                <div className="w-full h-3 bg-[#2c1409] rounded" />
                <div className="w-full h-2.5 rounded bg-white shadow-xs" />
              </div>
            </motion.div>
          )}

          {/* REVEALED CUT GAP IN CAKE */}
          {cuttingStep >= 3 && (
            <div className="absolute top-10 right-4 sm:right-8 z-30 w-24 sm:w-28 h-32 sm:h-36 bg-[#1a0b04] border-x-2 border-pink-400/60 shadow-inner flex flex-col items-center justify-center p-2">
              <div className="w-full h-1 bg-pink-400/40 my-1" />
              <div className="w-full h-1 bg-amber-600/40 my-1" />
              <div className="w-full h-1 bg-pink-400/40 my-1" />
            </div>
          )}

          {/* CRUMB PARTICLES (Step 6) */}
          {cuttingStep >= 6 && (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 8 }}
              className="absolute bottom-6 right-6 z-40 flex gap-1.5"
            >
              <span className="h-2 w-2 rounded-full bg-amber-700 shadow-md animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shadow-md" />
              <span className="h-2 w-2 rounded-full bg-amber-900 shadow-md" />
            </motion.div>
          )}

          {/* 3D PURPLE CAKE STAND (Pedestal Base + Curved Stem + Top Plate) */}
          <div className="relative z-0 flex flex-col items-center -mt-2">
            {/* Top Plate */}
            <div
              className="w-64 sm:w-80 h-9 rounded-[100%] bg-gradient-to-r from-purple-700 via-purple-500 to-purple-800 border-t-4 border-purple-300 shadow-2xl relative overflow-hidden"
              style={{ boxShadow: '0 15px 35px rgba(0,0,0,0.6)' }}
            >
              <div className="absolute inset-x-8 top-1 h-2 rounded-full bg-white/30 blur-xs" />
            </div>
            {/* Pedestal Stem */}
            <div className="w-14 sm:w-16 h-10 bg-gradient-to-b from-purple-600 via-purple-700 to-purple-900 border-x border-purple-400/30 shadow-lg -mt-1" />
            {/* Round Pedestal Base */}
            <div className="w-40 sm:w-48 h-7 rounded-[100%] bg-gradient-to-r from-purple-800 via-purple-600 to-purple-900 border-t-2 border-purple-300 shadow-2xl -mt-1" />
          </div>
        </motion.div>

        {/* REVEALED PERSONALIZED BIRTHDAY MESSAGE BANNER */}
        <AnimatePresence>
          {cuttingStep >= 7 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-purple-700/30 border border-purple-400/50 shadow-2xl backdrop-blur-xl max-w-sm text-center space-y-1.5"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300 flex items-center justify-center gap-1">
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

      {/* Action Controls */}
      <div className="mt-2 min-h-[50px] flex items-center justify-center">
        {stage === 'blow' && (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleBlowCandles}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-300"
            >
              <Wind className="h-4 w-4 animate-pulse" />
              <span>BLOW OUT CANDLES</span>
            </button>

            {micAllowed === true && (
              <span className="text-[10px] font-semibold text-purple-300 flex items-center gap-1.5 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                <Mic className="h-3 w-3 text-purple-400 animate-pulse" />
                <span>Microphone blow detection active — blow into mic!</span>
              </span>
            )}
          </div>
        )}

        {stage === 'cutting' && (
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-bold text-purple-300 shadow-lg">
            <Scissors className="h-4 w-4 text-purple-400 animate-spin" />
            <span>Slicing cake... Step {cuttingStep} of 7</span>
          </div>
        )}
      </div>
    </div>
  );
};
