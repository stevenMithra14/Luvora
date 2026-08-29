import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Play, Pause, MapPin, CheckCircle, ArrowLeft, Compass, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { WizardGoodie } from '../../../context/WizardContext';
import { resolveMediaUrl } from '../../../services/giftService';

interface GoodiesExperienceProps {
  goodies: WizardGoodie[];
  recipientName: string;
  onGoodiesComplete?: () => void;
}

const getPlayableAudioUrl = (rawUrl?: string, fallbackUrl: string = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3') => {
  if (!rawUrl || typeof rawUrl !== 'string') return fallbackUrl;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.includes('spotify.com') || trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    return fallbackUrl;
  }
  return resolveMediaUrl(trimmed, fallbackUrl);
};

const getSpotifyEmbedUrl = (rawUrl?: string) => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  if (!rawUrl.includes('spotify.com')) return null;
  const match = rawUrl.match(/track\/([a-zA-Z0-9]+)/);
  if (match && match[1]) {
    return `https://open.spotify.com/embed/track/${match[1]}?utm_source=generator`;
  }
  return null;
};

const getYouTubeEmbedUrl = (rawUrl?: string) => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const match = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
  }
  return null;
};

const getVimeoEmbedUrl = (rawUrl?: string) => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const match = rawUrl.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
  }
  return null;
};

const getPlayableVideoUrl = (rawUrl?: string) => {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  }
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  }
  if (trimmed.startsWith('/uploads')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
    const backendOrigin = apiBase.replace(/\/api\/?$/, '');
    return `${backendOrigin}${trimmed}`;
  }
  return trimmed;
};

export const GoodiesExperience: React.FC<GoodiesExperienceProps> = ({
  goodies,
  recipientName,
  onGoodiesComplete,
}) => {
  const [activeGoodie, setActiveGoodie] = useState<WizardGoodie | null>(null);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [redeemedCouponIds, setRedeemedCouponIds] = useState<Set<string>>(new Set());
  const [isBoxUnboxed, setIsBoxUnboxed] = useState(false);

  // 3D Gift Box Cursor Tilt Motion
  const [boxTiltX, setBoxTiltX] = useState(0);
  const [boxTiltY, setBoxTiltY] = useState(0);

  const handleBoxMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    const rX = -(mouseY / (rect.height / 2)) * 16;
    const rY = (mouseX / (rect.width / 2)) * 16;
    setBoxTiltX(rX);
    setBoxTiltY(rY);
  };

  const handleBoxMouseLeave = () => {
    setBoxTiltX(0);
    setBoxTiltY(0);
  };

  // Goodie specific player states
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [confettiActive, setConfettiActive] = useState(false);

  void audioProgress;
  void confettiActive;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasConfettiRef = useRef<HTMLCanvasElement | null>(null);

  const enabledGoodies = goodies.filter((g) => g.isEnabled !== false);

  const activeIndex = enabledGoodies.findIndex((g) => g.id === activeGoodie?.id);

  const handleNextGoodie = () => {
    if (activeIndex >= 0 && activeIndex < enabledGoodies.length - 1) {
      setActiveGoodie(enabledGoodies[activeIndex + 1]);
    }
  };

  const handlePrevGoodie = () => {
    if (activeIndex > 0) {
      setActiveGoodie(enabledGoodies[activeIndex - 1]);
    }
  };

  useEffect(() => {
    if (activeGoodie) {
      setViewedIds((prev) => new Set(prev).add(activeGoodie.id));
      setIsPlayingAudio(false);
      setAudioProgress(0);

      // Trigger confetti if surprise goodie
      if (activeGoodie.goodieType === 'surprise' && activeGoodie.configurationJson?.enableConfetti) {
        fireConfetti();
      }
    }
  }, [activeGoodie]);

  // Confetti Animation Canvas Effect
  const fireConfetti = () => {
    setConfettiActive(true);
    const canvas = canvasConfettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{ x: number; y: number; r: number; d: number; color: string; tilt: number; tiltAngle: number; tiltAngleIncremental: number }> = [];
    const colors = ['#ec4899', '#f43f5e', '#fbbf24', '#a855f7', '#38bdf8', '#34d399'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 8 + 4,
        d: Math.random() * 80 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngle: 0,
        tiltAngleIncremental: Math.random() * 0.07 + 0.05,
      });
    }

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 1 + p.r / 2) / 2;
        p.tilt = Math.sin(p.tiltAngle) * 15;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
        ctx.stroke();

        if (p.y > canvas.height) {
          p.x = Math.random() * canvas.width;
          p.y = -20;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setConfettiActive(false);
    }, 4000);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'note': return '💌';
      case 'photo': return '📸';
      case 'video': return '🎥';
      case 'song': return '🎵';
      case 'voice': return '🎙️';
      case 'drawing': return '🎨';
      case 'place': return '📍';
      case 'coupon': return '🎟️';
      case 'custom_card': return '📰';
      case 'surprise': return '✨';
      default: return '🎁';
    }
  };

  if (enabledGoodies.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 relative overflow-x-hidden selection:bg-pink-500/30">
      {/* Canvas for Confetti Explosion */}
      <canvas
        ref={canvasConfettiRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* 3D GIFT BOX INTERACTIVE INTRO (IMAGE 1 / IMAGE 5 MATCH) */}
      {!isBoxUnboxed ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center min-h-[460px] py-10 text-center space-y-8 bg-[#0d0d12] rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden"
        >
          {/* Header Text */}
          <div className="space-y-1">
            <h2 className="font-serif italic text-3xl sm:text-4xl text-pink-200 font-normal tracking-wide">
              you've got a gift box
            </h2>
            <p className="text-xs text-slate-400 font-mono">Move your cursor to tilt & tap the box to open ❤️</p>
          </div>

          {/* 3D Interactive Cursor Tilt Gift Box (Image 1 / Image 5 Match) */}
          <div
            className="perspective-1000 my-4"
            onMouseMove={handleBoxMouseMove}
            onMouseLeave={handleBoxMouseLeave}
          >
            <motion.button
              type="button"
              onClick={() => {
                fireConfetti();
                setIsBoxUnboxed(true);
              }}
              style={{
                transform: `rotateX(${boxTiltX}deg) rotateY(${boxTiltY}deg)`,
                transformStyle: 'preserve-3d',
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative cursor-pointer group w-72 sm:w-80 h-72 sm:h-80 rounded-3xl bg-[#1d141e] border-2 border-pink-500/30 shadow-[0_30px_70px_-15px_rgba(236,72,153,0.35)] flex items-center justify-center overflow-hidden transition-transform duration-75 select-none"
            >
              {/* Subtle Polka Dot Pattern Background */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ec4899_1.5px,transparent_1.5px)] [background-size:16px_16px]" />

              {/* Vertical Satin Ribbon */}
              <div className="absolute inset-y-0 w-16 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 shadow-2xl border-x border-pink-300/40 z-10" />

              {/* Horizontal Satin Ribbon */}
              <div className="absolute inset-x-0 h-16 bg-gradient-to-b from-pink-600 via-rose-500 to-pink-600 shadow-2xl border-y border-pink-300/40 z-10" />

              {/* Center Tied Satin Ribbon Bow */}
              <div className="relative z-20 flex flex-col items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                {/* Bow Loops */}
                <div className="flex items-center justify-center -space-x-3">
                  <div className="w-14 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 border-2 border-white shadow-xl transform -rotate-12 shadow-pink-500/50" />
                  <div className="w-14 h-10 rounded-full bg-gradient-to-tl from-pink-500 to-rose-400 border-2 border-white shadow-xl transform rotate-12 shadow-pink-500/50" />
                </div>
                {/* Knot */}
                <div className="w-8 h-8 rounded-full bg-pink-400 border-2 border-white shadow-2xl -mt-5 z-30" />
                {/* Ribbon Tails */}
                <div className="flex justify-center gap-2 -mt-2">
                  <div className="w-4 h-11 bg-rose-500 border-l border-pink-200 transform -rotate-12 origin-top rounded-b-sm shadow-md" />
                  <div className="w-4 h-11 bg-rose-500 border-r border-pink-200 transform rotate-12 origin-top rounded-b-sm shadow-md" />
                </div>
              </div>
            </motion.button>
          </div>

          {/* Subtitle Motion Action */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                fireConfetti();
                setIsBoxUnboxed(true);
              }}
              className="font-mono text-sm sm:text-base text-pink-300 tracking-widest lowercase hover:text-white transition-colors cursor-pointer animate-pulse"
            >
              tap box to open ✨
            </button>
          </div>
        </motion.div>
      ) : (
        /* Main Goodies Discovery Grid Section (ALL ITEMS FLOATING IN AIR) */
        <div className="space-y-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
              <Sparkles className="h-3.5 w-3.5 text-pink-400 shrink-0" />
              Digital Goodies & Surprises
            </span>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              "A few little things I wanted you to have..."
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-serif italic max-w-lg mx-auto">
              Tap any floating gift item in the air to reveal your personalized surprises crafted just for {recipientName} ❤️
            </p>
          </motion.div>

          {/* Floating Goodies Mid-Air Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 pt-4">
            {enabledGoodies.map((item, idx) => {
              const isOpened = viewedIds.has(item.id);
              const icon = getIconForType(item.goodieType);

              return (
                <motion.div
                  key={item.id}
                  animate={{
                    y: [0, -12, 0],
                    rotate: [0, idx % 2 === 0 ? 1.5 : -1.5, 0],
                  }}
                  transition={{
                    duration: 3.5 + (idx % 3) * 0.4,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                    delay: idx * 0.2,
                  }}
                  className="w-full"
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.06, y: -6 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    onClick={() => setActiveGoodie(item)}
                    className={`group relative p-5 sm:p-6 rounded-3xl border text-center transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center justify-between min-h-[180px] w-full shadow-2xl ${isOpened
                        ? 'bg-slate-900/70 border-slate-800 text-slate-300'
                        : 'bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-pink-950/40 border-pink-500/40 text-white shadow-pink-500/10 hover:border-pink-400'
                      }`}
                  >
                    {/* Glowing Aura Light Accent */}
                    <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-pink-500/20 blur-xl group-hover:bg-pink-500/40 transition-all duration-500" />

                    {/* Opened Badge */}
                    {isOpened && (
                      <span className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 z-10">
                        <CheckCircle className="h-3 w-3" />
                        Opened
                      </span>
                    )}

                    {/* Goodie Real Photo Icon floating in mid-air */}
                    <div className="h-16 w-16 rounded-2xl bg-slate-950/90 border border-pink-500/30 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300 relative overflow-hidden shrink-0">
                      {item.goodieType === 'note' && <img src="/assets/goodies/typewriter.jpg" alt="Typewriter" className="w-full h-full object-cover" onError={(e) => (e.target as HTMLElement).style.display = 'none'} />}
                      {item.goodieType === 'photo' && <img src="/assets/goodies/camera.jpg" alt="Camera" className="w-full h-full object-cover" onError={(e) => (e.target as HTMLElement).style.display = 'none'} />}
                      {item.goodieType === 'song' && <img src="/assets/goodies/song.jpg" alt="Song CD" className="w-full h-full object-cover" onError={(e) => (e.target as HTMLElement).style.display = 'none'} />}
                      {item.goodieType === 'video' && <img src="/assets/goodies/video.jpg" alt="Video Camcorder" className="w-full h-full object-cover" onError={(e) => (e.target as HTMLElement).style.display = 'none'} />}
                      {item.goodieType === 'voice' && <img src="/assets/goodies/voice.jpg" alt="Voice Recorder" className="w-full h-full object-cover" onError={(e) => (e.target as HTMLElement).style.display = 'none'} />}
                      {item.goodieType === 'drawing' && <img src="/assets/goodies/drawing.jpg" alt="Palette" className="w-full h-full object-cover" onError={(e) => (e.target as HTMLElement).style.display = 'none'} />}
                      {item.goodieType === 'place' && <img src="/assets/goodies/place.jpg" alt="Google Maps Pin" className="w-full h-full object-cover" onError={(e) => (e.target as HTMLElement).style.display = 'none'} />}
                      {item.goodieType === 'surprise' && <img src="/assets/goodies/surprise.jpg" alt="Surprise Box" className="w-full h-full object-cover" onError={(e) => (e.target as HTMLElement).style.display = 'none'} />}
                      <span className="absolute inset-0 flex items-center justify-center text-2xl drop-shadow-md">{icon}</span>
                    </div>

                    {/* Goodie Name */}
                    <div className="mt-3 space-y-1">
                      <h4 className="font-heading text-sm font-bold text-white group-hover:text-pink-300 transition-colors line-clamp-1">
                        {item.title || 'Digital Goodie'}
                      </h4>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-pink-400 uppercase block">
                        {isOpened ? 'Opened ❤️' : 'Tap to Reveal'}
                      </span>
                    </div>
                  </motion.button>
                </motion.div>
              );
            })}
          </div>

          {/* Completion Message & Continue Button */}
          {onGoodiesComplete && (
            <div className="pt-8 text-center space-y-3">
              <p className="text-xs font-serif italic text-pink-300">
                There's still more waiting for you... ❤️
              </p>

              <button
                type="button"
                onClick={onGoodiesComplete}
                className="px-9 py-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-sm font-extrabold text-white shadow-2xl shadow-pink-500/35 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:ring-2 focus:ring-pink-500 focus:outline-none"
              >
                CONTINUE TO MEMORIES ALBUM ✨
              </button>
            </div>
          )}
        </div>
      )}

      {/* IMMERSIVE GOODIE MODAL OPENING VIEW */}
      <AnimatePresence>
        {activeGoodie && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl bg-[#faf3e0] border-4 border-[#b89b72]/80 rounded-3xl p-4 sm:p-8 shadow-2xl space-y-5 sm:space-y-6 my-4 sm:my-8 text-[#3e2723] relative overflow-hidden max-h-[88vh] overflow-y-auto font-serif select-none max-w-[calc(100vw-1.5rem)]"
            >
              {/* Coffee Stain Ring & Splatter Graphic Overlays */}
              <svg className="absolute -top-10 -left-10 w-48 h-48 pointer-events-none opacity-20 text-[#6d4c2b]" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" strokeDasharray="14 6" />
                <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="3" />
              </svg>
              <svg className="absolute -bottom-10 -right-10 w-56 h-56 pointer-events-none opacity-25 text-[#5c3a21]" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" strokeDasharray="22 8" />
                <circle cx="48" cy="52" r="34" stroke="currentColor" strokeWidth="4" />
              </svg>

              {/* Vintage Close Button */}
              <button
                type="button"
                onClick={() => setActiveGoodie(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#e6d5b8] border border-[#a0825c] text-[#5c3a21] hover:text-[#3e2723] hover:bg-[#dcc7a5] cursor-pointer z-30 shadow-sm transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* 1. NOTE GOODIE VIEW */}
              {activeGoodie.goodieType === 'note' && (
                <motion.div
                  initial={{ rotateX: 90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6 text-center py-4"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6d5b8] text-[#5c3a21] text-3xl border border-[#a0825c]">
                    💌
                  </div>

                  <div className="p-8 sm:p-10 rounded-3xl border-2 border-[#b89b72]/60 bg-[#eedfc4] text-[#3e2723] text-center space-y-5 shadow-inner relative font-serif">
                    <h3 className="font-heading text-2xl font-bold text-[#3e2723]">
                      {activeGoodie.title || 'A Personal Note'}
                    </h3>

                    <p className="text-lg font-serif leading-relaxed italic whitespace-pre-wrap text-[#4a2c11]">
                      "{activeGoodie.configurationJson?.message || activeGoodie.description}"
                    </p>

                    {activeGoodie.configurationJson?.signature && (
                      <p className="text-base font-bold text-[#8b2626] pt-2 font-serif">
                        {activeGoodie.configurationJson.signature}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 2. PHOTO GOODIE VIEW */}
              {activeGoodie.goodieType === 'photo' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-6 text-center py-4"
                >
                  <div className="p-4 pt-6 pb-8 rounded-3xl bg-white text-slate-950 shadow-2xl max-w-md mx-auto space-y-4">
                    <div className="rounded-2xl overflow-hidden bg-slate-950 max-h-72 aspect-[4/3]">
                      <img
                        src={resolveMediaUrl(activeGoodie.mediaUrl || activeGoodie.configurationJson?.photoUrl)}
                        alt="Memory"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-heading text-lg font-bold text-slate-900">
                        {activeGoodie.title}
                      </h3>
                      {activeGoodie.configurationJson?.caption && (
                        <p className="font-serif text-xs italic text-slate-700">
                          "{activeGoodie.configurationJson.caption}"
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 3. VIDEO GOODIE VIEW (Cinema Player with YouTube & MP4 Support) */}
              {activeGoodie.goodieType === 'video' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 text-center py-2"
                >
                  <h3 className="font-heading text-xl font-bold text-white">
                    {activeGoodie.title || 'A Special Video'}
                  </h3>

                  {getYouTubeEmbedUrl(activeGoodie.mediaUrl || activeGoodie.configurationJson?.videoUrl) ? (
                    <div className="rounded-2xl overflow-hidden border border-pink-500/30 bg-black shadow-2xl aspect-video w-full max-h-[380px]">
                      <iframe
                        title="YouTube Video Embed"
                        src={getYouTubeEmbedUrl(activeGoodie.mediaUrl || activeGoodie.configurationJson?.videoUrl)!}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : getVimeoEmbedUrl(activeGoodie.mediaUrl || activeGoodie.configurationJson?.videoUrl) ? (
                    <div className="rounded-2xl overflow-hidden border border-pink-500/30 bg-black shadow-2xl aspect-video w-full max-h-[380px]">
                      <iframe
                        title="Vimeo Video Embed"
                        src={getVimeoEmbedUrl(activeGoodie.mediaUrl || activeGoodie.configurationJson?.videoUrl)!}
                        className="w-full h-full border-0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl overflow-hidden border border-pink-500/30 bg-black shadow-2xl">
                      <video
                        key={activeGoodie.mediaUrl || activeGoodie.configurationJson?.videoUrl}
                        ref={videoRef}
                        src={getPlayableVideoUrl(activeGoodie.mediaUrl || activeGoodie.configurationJson?.videoUrl)}
                        controls
                        autoPlay
                        playsInline
                        preload="auto"
                        poster={activeGoodie.configurationJson?.posterUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80'}
                        onLoadedData={(e) => {
                          e.currentTarget.play().catch(() => {});
                        }}
                        className="w-full max-h-[380px] object-contain mx-auto"
                      >
                        <source
                          src={getPlayableVideoUrl(activeGoodie.mediaUrl || activeGoodie.configurationJson?.videoUrl)}
                          type="video/mp4"
                        />
                        <source
                          src={getPlayableVideoUrl(activeGoodie.mediaUrl || activeGoodie.configurationJson?.videoUrl)}
                          type="video/webm"
                        />
                        Your browser does not support video playback.
                      </video>
                    </div>
                  )}

                  {activeGoodie.configurationJson?.caption && (
                    <p className="text-sm text-slate-300 italic font-serif">
                      "{activeGoodie.configurationJson.caption}"
                    </p>
                  )}
                </motion.div>
              )}

              {/* 4. SONG GOODIE VIEW (IMAGE 4 RED SPOTIFY CARD MATCH) */}
              {activeGoodie.goodieType === 'song' && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-6 text-center py-4"
                >
                  {/* Outer White Card Backdrop */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-md mx-auto relative overflow-hidden space-y-4">
                    {/* Spotify Embed Player (If Spotify Link pasted) */}
                    {getSpotifyEmbedUrl(activeGoodie.mediaUrl || activeGoodie.configurationJson?.audioUrl) ? (
                      <div className="rounded-2xl overflow-hidden border border-slate-300 shadow-md">
                        <iframe
                          title="Spotify Embed Track"
                          src={getSpotifyEmbedUrl(activeGoodie.mediaUrl || activeGoodie.configurationJson?.audioUrl)!}
                          width="100%"
                          height="152"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          className="rounded-2xl"
                        />
                      </div>
                    ) : (
                      /* Inner Dark Crimson Spotify Style Card */
                      <div className="bg-[#800000] p-6 rounded-2xl shadow-xl text-white text-left relative flex flex-col sm:flex-row items-center gap-4">
                        {/* Left: Square Album Art */}
                        <div className="h-24 w-24 rounded-xl overflow-hidden bg-slate-900 shrink-0 shadow-lg border border-white/20">
                          <img
                            src={activeGoodie.configurationJson?.posterUrl || '/assets/goodies/song.jpg'}
                            alt="Album Art"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Right: Details & Play Action */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-base text-white leading-tight line-clamp-1">
                              {activeGoodie.configurationJson?.songTitle || activeGoodie.title || 'Happy Birthday To You Ji'}
                            </h4>
                            {/* Spotify Logo Icon */}
                            <div className="h-6 w-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold shrink-0">
                              🎵
                            </div>
                          </div>

                          <p className="text-xs text-rose-200 font-medium">
                            {activeGoodie.configurationJson?.artist || 'Mimi Teddy'}
                          </p>

                          <div className="pt-2 space-y-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (!audioRef.current) return;
                                if (isPlayingAudio) {
                                  audioRef.current.pause();
                                  setIsPlayingAudio(false);
                                } else {
                                  const targetUrl = getPlayableAudioUrl(activeGoodie.mediaUrl || activeGoodie.configurationJson?.audioUrl, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
                                  audioRef.current.src = targetUrl;
                                  audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {
                                    const a = new Audio(targetUrl);
                                    a.play().then(() => setIsPlayingAudio(true)).catch(() => {});
                                  });
                                }
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#800000] font-bold text-xs shadow-md hover:scale-105 transition-all cursor-pointer font-mono"
                            >
                              {isPlayingAudio ? (
                                <>
                                  <Pause className="h-4 w-4 fill-[#800000]" />
                                  <span>Pause Song</span>
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 fill-[#800000] ml-0.5" />
                                  <span>+ Save on Spotify</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Standard HTML Audio Player for guaranteed browser audio playback */}
                    <div className="pt-1">
                      <audio
                        ref={audioRef}
                        src={getPlayableAudioUrl(activeGoodie.mediaUrl || activeGoodie.configurationJson?.audioUrl, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')}
                        onPlay={() => setIsPlayingAudio(true)}
                        onPause={() => setIsPlayingAudio(false)}
                        onEnded={() => setIsPlayingAudio(false)}
                        controls
                        className="w-full h-8 rounded-lg accent-[#800000] opacity-90 hover:opacity-100 transition-opacity"
                      />
                    </div>

                    {activeGoodie.configurationJson?.message && (
                      <p className="text-xs text-slate-700 italic font-serif pt-2 text-center">
                        "{activeGoodie.configurationJson.message}"
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 5. VOICE MESSAGE GOODIE VIEW (Waveform Player) */}
              {activeGoodie.goodieType === 'voice' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center py-4"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-300 text-3xl border border-rose-500/30">
                    🎙️
                  </div>

                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-6 max-w-md mx-auto">
                    <h3 className="font-heading text-lg font-bold text-white">
                      {activeGoodie.title || 'Voice Message'}
                    </h3>

                    {/* Animated Waveform Bars */}
                    <div className="flex items-center justify-center gap-1.5 h-12">
                      {[12, 24, 40, 18, 32, 48, 20, 36, 14, 28, 44, 16].map((h, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: isPlayingAudio ? [h, h * 0.4, h] : h }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.05 }}
                          className="w-1.5 rounded-full bg-gradient-to-t from-pink-500 to-rose-400"
                        />
                      ))}
                    </div>

                    {getPlayableAudioUrl(activeGoodie.mediaUrl || activeGoodie.configurationJson?.audioUrl, '') ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (!audioRef.current) return;
                            if (isPlayingAudio) {
                              audioRef.current.pause();
                              setIsPlayingAudio(false);
                            } else {
                              const targetUrl = getPlayableAudioUrl(activeGoodie.mediaUrl || activeGoodie.configurationJson?.audioUrl, '');
                              if (!targetUrl) return;
                              audioRef.current.src = targetUrl;
                              audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {
                                const a = new Audio(targetUrl);
                                a.play().then(() => setIsPlayingAudio(true)).catch(() => {});
                              });
                            }
                          }}
                          className="h-14 w-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 hover:scale-105 transition-all mx-auto cursor-pointer"
                        >
                          {isPlayingAudio ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-white" />}
                        </button>

                        <audio
                          ref={audioRef}
                          src={getPlayableAudioUrl(activeGoodie.mediaUrl || activeGoodie.configurationJson?.audioUrl, '')}
                          onPlay={() => setIsPlayingAudio(true)}
                          onPause={() => setIsPlayingAudio(false)}
                          onEnded={() => setIsPlayingAudio(false)}
                          controls
                          className="w-full h-8 rounded-lg accent-rose-500 opacity-90 hover:opacity-100 transition-opacity"
                        />
                      </>
                    ) : (
                      <p className="text-xs text-rose-300 font-mono py-2">
                        (No voice recording uploaded)
                      </p>
                    )}

                    <p className="text-xs text-slate-300 italic font-serif">
                      "{activeGoodie.configurationJson?.caption || activeGoodie.description}"
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 6. DRAWING GOODIE VIEW (Artwork Reveal) */}
              {activeGoodie.goodieType === 'drawing' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 text-center py-2"
                >
                  <h3 className="font-heading text-xl font-bold text-white">
                    {activeGoodie.title || 'Handmade Doodle'}
                  </h3>

                  <div className="p-3 bg-white rounded-3xl shadow-2xl max-w-lg mx-auto">
                    <img
                      src={activeGoodie.configurationJson?.drawingDataUrl || activeGoodie.mediaUrl}
                      alt="Handmade Drawing"
                      className="w-full max-h-[380px] rounded-2xl object-contain bg-white shadow-inner"
                    />
                  </div>

                  {activeGoodie.configurationJson?.caption && (
                    <p className="text-xs text-slate-300 italic font-serif">
                      "{activeGoodie.configurationJson.caption}"
                    </p>
                  )}
                </motion.div>
              )}

              {/* 7. SPECIAL PLACE GOODIE VIEW (Map Card Pin) */}
              {activeGoodie.goodieType === 'place' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5 text-center py-2"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 text-3xl border border-amber-500/30">
                    📍
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4 max-w-lg mx-auto text-left">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-6 w-6 text-pink-400 shrink-0 animate-bounce" />
                      <div>
                        <h4 className="font-heading text-lg font-bold text-white">
                          {activeGoodie.configurationJson?.placeName || activeGoodie.title}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono">
                          Lat: {activeGoodie.configurationJson?.latitude}, Long: {activeGoodie.configurationJson?.longitude}
                        </p>
                      </div>
                    </div>

                    {/* Live Google Maps Tracker Embed */}
                    <div className="w-full h-52 rounded-2xl overflow-hidden border-2 border-pink-500/40 bg-slate-900 relative">
                      <iframe
                        title="Google Maps Location Tracker"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(activeGoodie.configurationJson?.placeName || 'New York')}&z=14&output=embed`}
                        className="w-full h-full border-0 filter contrast-125 saturate-150"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-slate-950/90 border border-slate-800 text-[10px] font-bold text-emerald-400 flex items-center gap-1 backdrop-blur-md">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>Google Maps Live</span>
                      </div>
                    </div>

                    {activeGoodie.mediaUrl && (
                      <div className="rounded-2xl overflow-hidden max-h-48 border border-slate-800">
                        <img src={activeGoodie.mediaUrl} alt="Place" className="w-full h-48 object-cover" />
                      </div>
                    )}

                    <p className="text-sm text-slate-200 leading-relaxed font-serif italic">
                      "{activeGoodie.configurationJson?.description || activeGoodie.description}"
                    </p>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeGoodie.configurationJson?.placeName || 'location')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-lg shadow-pink-500/25 hover:scale-105 transition-all cursor-pointer"
                    >
                      <Compass className="h-4 w-4" />
                      <span>Open Location on Google Maps</span>
                    </a>
                  </div>
                </motion.div>
              )}

              {/* 8. COUPON GOODIE VIEW (Ticket Unfolding & Redeem) */}
              {activeGoodie.goodieType === 'coupon' && (
                <motion.div
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6 text-center py-4"
                >
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-pink-500 via-rose-600 to-purple-700 text-white shadow-2xl space-y-6 border-2 border-dashed border-white/40 max-w-md mx-auto relative overflow-hidden">
                    {/* Perforated Edge Dots */}
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900" />
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900" />

                    <div className="text-xs uppercase font-extrabold tracking-widest text-pink-200">
                      Personal Digital Gift Coupon
                    </div>

                    <h3 className="font-heading text-2xl font-black tracking-tight uppercase">
                      🎟️ {activeGoodie.title || activeGoodie.configurationJson?.couponTitle}
                    </h3>

                    <p className="text-sm text-pink-100 font-serif leading-relaxed">
                      {activeGoodie.configurationJson?.description || activeGoodie.description}
                    </p>

                    <div className="pt-2 border-t border-white/20 text-xs font-bold text-pink-200">
                      {activeGoodie.configurationJson?.redemptionText || 'Valid Whenever You Want ❤️'}
                    </div>

                    {/* Redeem Action */}
                    <div className="pt-2">
                      {redeemedCouponIds.has(activeGoodie.id) ? (
                        <div className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-white text-emerald-600 font-black text-xs uppercase tracking-wider shadow-lg">
                          <CheckCircle className="h-4 w-4" />
                          <span>REDEEMED! ❤️</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setRedeemedCouponIds((prev) => new Set(prev).add(activeGoodie.id));
                            fireConfetti();
                          }}
                          className="px-6 py-2.5 rounded-full bg-white text-pink-600 font-extrabold text-xs shadow-xl hover:scale-105 active:scale-95 cursor-pointer transition-all uppercase tracking-wider"
                        >
                          REDEEM NOW ❤️
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 9. CUSTOM CARD GOODIE VIEW */}
              {activeGoodie.goodieType === 'custom_card' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 text-center py-2"
                >
                  <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4 max-w-md mx-auto">
                    <h3 className="font-heading text-2xl font-bold text-white">
                      ✨ {activeGoodie.title}
                    </h3>

                    {activeGoodie.mediaUrl && (
                      <div className="rounded-2xl overflow-hidden max-h-48">
                        <img src={activeGoodie.mediaUrl} alt="Card" className="w-full h-48 object-cover" />
                      </div>
                    )}

                    <p className="text-base text-slate-200 font-serif leading-relaxed italic">
                      "{activeGoodie.configurationJson?.message || activeGoodie.description}"
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 10. SURPRISE GOODIE VIEW (Mystery Box Reveal) */}
              {activeGoodie.goodieType === 'surprise' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-6 text-center py-4"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-400 to-pink-500 text-white text-3xl shadow-xl shadow-pink-500/25">
                    🎁
                  </div>

                  <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-purple-950/60 to-slate-950 border border-purple-500/40 shadow-2xl space-y-5 max-w-md mx-auto">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                      Hidden Surprise Unlocked!
                    </span>

                    <h3 className="font-heading text-2xl font-extrabold text-white">
                      {activeGoodie.title}
                    </h3>

                    <p className="text-xl font-serif text-pink-200 italic">
                      "{activeGoodie.configurationJson?.hiddenMessage || 'I love you ❤️'}"
                    </p>

                    {activeGoodie.configurationJson?.hiddenPhotoUrl && (
                      <div className="rounded-2xl overflow-hidden border border-slate-800">
                        <img
                          src={activeGoodie.configurationJson.hiddenPhotoUrl}
                          alt="Surprise"
                          className="w-full max-h-48 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* GOODIE COMPLETION & NAVIGATION */}
              <div className="pt-4 border-t border-[#b89b72]/40 text-center space-y-4 font-serif">
                <p className="text-xs font-bold text-[#8b2626] italic">
                  ❤️ That's one little surprise.
                </p>

                <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
                  {activeIndex > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevGoodie}
                      aria-label="Previous Goodie"
                      className="min-h-[44px] px-4 py-2 rounded-full bg-[#f2e4cb] border border-[#a88a62] text-xs font-bold text-[#4a321a] hover:bg-[#e6d4b6] cursor-pointer flex items-center gap-1.5 transition-all shadow-sm font-serif"
                    >
                      <ChevronLeft className="h-4 w-4 text-[#8b2626]" />
                      <span>Prev Goodie</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveGoodie(null)}
                    aria-label="Back to Goodies Grid"
                    className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#e6d5b8] border-2 border-[#8c6d46] text-xs font-bold text-[#3e2723] hover:bg-[#dcc7a5] transition-all cursor-pointer flex items-center gap-1.5 shadow-md font-serif"
                  >
                    <ArrowLeft className="h-4 w-4 text-[#8b2626]" />
                    <span>Back to Goodies</span>
                  </button>

                  {activeIndex >= 0 && activeIndex < enabledGoodies.length - 1 && (
                    <button
                      type="button"
                      onClick={handleNextGoodie}
                      aria-label="Next Goodie"
                      className="min-h-[44px] px-4 py-2 rounded-full bg-[#f2e4cb] border border-[#a88a62] text-xs font-bold text-[#4a321a] hover:bg-[#e6d4b6] cursor-pointer flex items-center gap-1.5 transition-all shadow-sm font-serif"
                    >
                      <span>Next Goodie</span>
                      <ChevronRight className="h-4 w-4 text-[#8b2626]" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
