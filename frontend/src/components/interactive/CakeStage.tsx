import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Mic, Wind, Scissors, PartyPopper } from 'lucide-react';
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
  const [stage, setStage] = useState<'blow' | 'wish' | 'cut' | 'complete'>('blow');
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [isCakeCut, setIsCakeCut] = useState(false);
  const [micAllowed, setMicAllowed] = useState<boolean | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const frostingColor = config?.frostingColor || '#f472b6';
  const candleCount = config?.candleCount || 3;
  const candleColor = config?.candleColor || '#fbbf24';
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

    setTimeout(() => {
      setStage('cut');
    }, 800);
  };



  const handleCutCake = () => {
    if (isCakeCut) return;
    setIsCakeCut(true);

    setTimeout(() => {
      setStage('complete');
      onCakeComplete();
    }, 1600);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 text-center select-none py-2">
      {/* Header Prompt */}
      <div className="mb-2.5 space-y-1.5 max-w-md">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 shadow-sm">
          <PartyPopper className="h-3 w-3 text-pink-400" />
          {stage === 'blow'
            ? 'Candle Ceremony'
            : stage === 'wish'
            ? 'Make a Wish'
            : 'Cake Cutting'}
        </span>

        <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-white leading-tight">
          {stage === 'blow'
            ? 'Blow Out the Candles! 🕯️'
            : stage === 'wish'
            ? 'Make a Special Wish! ✨'
            : 'Cut the Celebration Cake! 🎂'}
        </h2>

        <p className="text-[11px] sm:text-xs text-slate-300 font-medium">
          {stage === 'blow' && micAllowed === true
            ? 'Blow into your microphone or tap the blow button below'
            : stage === 'blow'
            ? 'Tap the button or candles below to blow out your wish'
            : stage === 'wish'
            ? `All candles extinguished for ${recipientName}!`
            : 'Tap below to cut a delicious slice'}
        </p>
      </div>

      {/* Interactive 2-Layer Birthday Cake & Slice Animation */}
      <div className="relative my-4 flex flex-col items-center justify-center">
        {/* Confetti Sparkles Burst */}
        {candlesBlown && (
          <div className="absolute -top-12 z-40 flex items-center gap-2 pointer-events-none">
            <Sparkles className="h-10 w-10 text-amber-300 animate-bounce" />
            <Heart className="h-8 w-8 text-pink-400 fill-pink-400 animate-pulse" />
            <Sparkles className="h-10 w-10 text-rose-300 animate-bounce" />
          </div>
        )}

        {/* 2-Layer Cake Container */}
        <div className="relative flex flex-col items-center">
          {/* Candles Line on Top Tier */}
          <div className="flex items-center justify-center gap-2.5 mb-1 z-30">
            {Array.from({ length: Math.min(candleCount, 7) }).map((_, idx) => (
              <div key={idx} className="relative flex flex-col items-center cursor-pointer" onClick={handleBlowCandles}>
                {/* Flame */}
                {!candlesBlown ? (
                  <motion.div
                    animate={{
                      scale: [1, 1.25, 0.9, 1.15, 1],
                      rotate: [-4, 4, -2, 3, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="h-5 w-3 rounded-full bg-gradient-to-t from-amber-500 via-orange-400 to-yellow-200 shadow-lg shadow-amber-400/50"
                  />
                ) : (
                  /* Smoke Puff */
                  <motion.div
                    initial={{ opacity: 1, y: 0, scale: 0.5 }}
                    animate={{ opacity: 0, y: -16, scale: 1.5 }}
                    transition={{ duration: 0.8 }}
                    className="h-4 w-3 rounded-full bg-slate-400/60 blur-sm"
                  />
                )}

                {/* Candle Stick */}
                <div
                  className="h-9 w-2 rounded-t-md shadow-md border-x border-white/20"
                  style={{ backgroundColor: candleColor }}
                />
              </div>
            ))}
          </div>

          {/* TOP TIER CAKE */}
          <div
            className="relative w-44 sm:w-52 h-18 rounded-t-2xl shadow-xl flex items-center justify-center border-t-2 border-white/30 overflow-hidden"
            style={{ backgroundColor: frostingColor }}
          >
            {/* Frosting Drips Top Tier */}
            <div className="absolute top-0 inset-x-0 h-4 bg-white/30 rounded-t-2xl border-b border-white/40" />

            {/* Message on Top Tier */}
            <span className="relative z-10 text-xs font-extrabold text-white drop-shadow-md px-2 text-center line-clamp-1">
              {cakeMessage}
            </span>
          </div>

          {/* BOTTOM TIER CAKE */}
          <div
            className="relative w-56 sm:w-64 h-22 rounded-b-2xl shadow-2xl flex items-center justify-center border-t border-white/20 overflow-hidden"
            style={{ backgroundColor: frostingColor, filter: 'brightness(0.92)' }}
          >
            {/* Decorative Sprinkles / Dots */}
            <div className="flex items-center gap-3 text-white/50">
              <span>&bull; &bull; &bull;</span>
              <Heart className="h-4 w-4 fill-white/40 text-white/40" />
              <span>&bull; &bull; &bull;</span>
            </div>

            {/* CUT SLICE OUTWARD ANIMATION */}
            {isCakeCut && (
              <motion.div
                initial={{ y: 0, x: 0, scale: 1 }}
                animate={{ y: -40, x: 60, scale: 1.05 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="absolute top-0 right-8 w-20 h-full bg-amber-100 border-2 border-amber-300 shadow-2xl z-40 flex flex-col items-center justify-center"
                style={{
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  backgroundColor: frostingColor,
                  filter: 'brightness(1.15)',
                }}
              >
                {/* Sponge Layers inside slice */}
                <div className="w-full h-2 bg-amber-900/40 my-1" />
                <div className="w-full h-2 bg-white/60 my-1" />
              </motion.div>
            )}

            {/* Revealed Cut Gap in Cake */}
            {isCakeCut && (
              <div
                className="absolute top-0 right-8 w-20 h-full bg-slate-950/90 border-x border-amber-400/40 z-30"
                style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
              />
            )}
          </div>

          {/* Plate Stand */}
          <div className="w-64 sm:w-72 h-4 rounded-full bg-slate-800 border-t-2 border-slate-700 shadow-2xl mt-1" />
        </div>
      </div>

      {/* Action Button Controls */}
      <div className="mt-4">
        {stage === 'blow' && (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleBlowCandles}
              className="inline-flex items-center gap-2.5 px-8 py-3 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-300"
            >
              <Wind className="h-4 w-4" />
              <span>BLOW OUT CANDLES</span>
            </button>

            {micAllowed === true && (
              <span className="text-[11px] font-semibold text-pink-300 flex items-center gap-1.5 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                <Mic className="h-3 w-3 text-pink-400 animate-pulse" />
                <span>Microphone blow detection active</span>
              </span>
            )}
          </div>
        )}



        {stage === 'cut' && (
          <button
            type="button"
            onClick={handleCutCake}
            className="inline-flex items-center gap-2.5 px-8 py-3 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-pink-600 shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-300"
          >
            <Scissors className="h-4 w-4" />
            <span>CUT CAKE SLICE</span>
          </button>
        )}
      </div>
    </div>
  );
};
