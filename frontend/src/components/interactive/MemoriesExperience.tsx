import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Heart,
  Calendar,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  RotateCcw,
  Film,
  Camera
} from 'lucide-react';
import { WizardMemoryItem, MemoryConfig } from '../../context/WizardContext';

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
    return 'https://vjs.zencdn.net/v/oceans.mp4';
  }
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return 'https://vjs.zencdn.net/v/oceans.mp4';
  }
  if (trimmed.startsWith('/uploads')) {
    return `http://127.0.0.1:8000${trimmed}`;
  }
  return trimmed;
};

interface MemoriesExperienceProps {
  memories?: WizardMemoryItem[];
  config?: MemoryConfig;
  photosFallback?: { id: string; fileUrl: string; caption: string }[];
  recipientName?: string;
  onMemoriesComplete?: () => void;
}

export const MemoriesExperience: React.FC<MemoriesExperienceProps> = ({
  memories,
  config,
  photosFallback,
  onMemoriesComplete,
}) => {
  const items: WizardMemoryItem[] = React.useMemo(() => {
    if (memories && memories.length > 0) return memories;
    if (photosFallback && photosFallback.length > 0) {
      return photosFallback.map((p, idx) => ({
        id: p.id,
        type: 'photo',
        fileUrl: p.fileUrl,
        caption: p.caption,
        displayOrder: idx,
      }));
    }
    return [
      {
        id: 'demo-1',
        type: 'photo',
        fileUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80',
        title: 'Our Special Day',
        caption: 'That day we could not stop laughing 😂',
        date: '2023',
        location: 'Favorite Beach Spot',
        frameStyle: 'polaroid',
        displayOrder: 0,
      },
      {
        id: 'demo-2',
        type: 'photo',
        fileUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
        title: 'Unforgettable Moments',
        caption: 'One of my absolute favorite memories with you ❤️',
        date: '2024',
        location: 'Sunset Viewpoint',
        frameStyle: 'scrapbook',
        displayOrder: 1,
      },
    ];
  }, [memories, photosFallback]);

  const introText = config?.introText || 'Some moments I never want to forget...';
  const endingText = config?.endingText || 'Some memories fade, but the moments we shared never will. ❤️';
  const defaultPhotoFrame = config?.frameStyle || 'polaroid';
  const presentationStyle = config?.presentationStyle || 'polaroid';
  const autoPlayInterval = config?.autoPlayInterval || 5;

  const [phase, setPhase] = useState<'intro' | 'active' | 'ending'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(config?.autoPlay ?? false);

  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [zoomedPhoto, setZoomedPhoto] = useState<WizardMemoryItem | null>(null);
  const [fullscreenVideo, setFullscreenVideo] = useState<WizardMemoryItem | null>(null);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const currentItem = items[currentIndex] || items[0];

  const currentDuration = currentItem?.type === 'photo' && autoPlayInterval <= 2 ? 1.5 : autoPlayInterval;

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (phase === 'active' && isAutoPlaying && !zoomedPhoto && !fullscreenVideo && !isPlayingVideo) {
      timer = setTimeout(() => {
        handleNext();
      }, currentDuration * 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [phase, currentIndex, isAutoPlaying, zoomedPhoto, fullscreenVideo, isPlayingVideo, currentDuration]);

  useEffect(() => {
    let animId: number | null = null;
    const updateProgress = () => {
      if (videoRef.current && !videoRef.current.paused && videoRef.current.duration) {
        setVideoProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
        animId = requestAnimationFrame(updateProgress);
      }
    };
    if (isPlayingVideo) {
      animId = requestAnimationFrame(updateProgress);
    }
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlayingVideo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'active') return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, currentIndex]);

  const handleNext = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlayingVideo(false);
    }
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setPhase('ending');
    }
  };

  const handlePrev = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlayingVideo(false);
    }
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      handleNext();
    }
    if (touchEndX.current - touchStartX.current > 50) {
      handlePrev();
    }
  };

  const togglePlayVideo = () => {
    if (!videoRef.current) return;
    if (isPlayingVideo) {
      videoRef.current.pause();
      setIsPlayingVideo(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlayingVideo(true);
      }).catch((err) => {
        console.error('Video play error:', err);
      });
    }
  };

  const toggleMuteVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const renderPortraitLayers = (item: WizardMemoryItem) => {
    return (
      <div className="relative w-full max-w-xs mx-auto perspective-1000">
        <div className="absolute top-4 inset-x-2 h-64 rounded-3xl bg-pink-500/20 border border-pink-500/30 transform rotate-6 scale-95 blur-xs" />
        <div className="absolute top-2 inset-x-1 h-64 rounded-3xl bg-slate-900 border border-slate-800 transform -rotate-3 scale-98 shadow-xl" />

        <div className="relative p-3 rounded-3xl bg-white shadow-2xl border border-slate-200 text-slate-950 font-sans z-10">
          <div className="relative overflow-hidden rounded-2xl bg-slate-950 h-64 aspect-[3/4] group cursor-pointer" onClick={() => setZoomedPhoto(item)}>
            <img src={item.fileUrl} alt={item.caption || 'Portrait Layer'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="h-4 w-4" />
            </div>
          </div>
          {(item.title || item.caption) && (
            <div className="mt-2.5 px-1 text-center space-y-0.5">
              {item.title && <h4 className="font-heading text-xs font-bold text-slate-900 truncate">{item.title}</h4>}
              {item.caption && <p className="font-serif text-[11px] italic text-slate-700 line-clamp-1">"{item.caption}"</p>}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPhotoFrame = (item: WizardMemoryItem) => {
    if (presentationStyle === 'portrait_layers') {
      return renderPortraitLayers(item);
    }

    const frame = item.frameStyle || defaultPhotoFrame;

    switch (frame) {
      case 'polaroid':
        return (
          <div className="p-3 pt-4 pb-5 rounded-2xl bg-white shadow-2xl border border-slate-200 text-slate-950 max-w-sm mx-auto font-sans">
            <div className="relative overflow-hidden rounded-lg bg-slate-950 max-h-[220px] sm:max-h-[250px] aspect-[4/3] group cursor-pointer" onClick={() => setZoomedPhoto(item)}>
              <img src={item.fileUrl} alt={item.caption || 'Memory Photo'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-4 w-4" />
              </div>
            </div>
            {(item.title || item.caption || item.date) && (
              <div className="mt-3 px-1 text-center space-y-0.5">
                {item.title && <h4 className="font-heading text-sm font-bold text-slate-900 truncate">{item.title}</h4>}
                {item.caption && <p className="font-serif text-xs italic text-slate-700 line-clamp-2">"{item.caption}"</p>}
                {item.date && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200 mt-1">
                    <Calendar className="h-3 w-3" />
                    {item.date}
                  </span>
                )}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-2xl max-w-sm mx-auto space-y-2">
            <div className="relative overflow-hidden rounded-xl border border-white/20 max-h-[220px] sm:max-h-[250px] aspect-[4/3] cursor-pointer group" onClick={() => setZoomedPhoto(item)}>
              <img src={item.fileUrl} alt={item.caption || 'Classic Photo'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            {item.caption && (
              <p className="text-center font-serif text-xs text-slate-200 italic line-clamp-2">
                "{item.caption}"
              </p>
            )}
          </div>
        );
    }
  };

  const renderVideoFrame = (item: WizardMemoryItem) => {
    const rawVideoUrl = item.fileUrl || (item as any).videoUrl;
    const ytEmbed = getYouTubeEmbedUrl(rawVideoUrl);
    const vimeoEmbed = getVimeoEmbedUrl(rawVideoUrl);

    if (ytEmbed) {
      return (
        <div className="relative w-full max-w-md mx-auto space-y-2">
          <div className="rounded-2xl overflow-hidden border border-pink-500/30 bg-black shadow-2xl aspect-video w-full max-h-[260px]">
            <iframe
              title="YouTube Video Embed"
              src={ytEmbed}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {(item.title || item.caption) && (
            <div className="mt-2 text-center space-y-0.5 px-2">
              {item.title && <h4 className="font-heading text-sm font-bold text-white truncate">{item.title}</h4>}
              {item.caption && <p className="font-serif text-xs italic text-slate-300 line-clamp-1">"{item.caption}"</p>}
            </div>
          )}
        </div>
      );
    }

    if (vimeoEmbed) {
      return (
        <div className="relative w-full max-w-md mx-auto space-y-2">
          <div className="rounded-2xl overflow-hidden border border-pink-500/30 bg-black shadow-2xl aspect-video w-full max-h-[260px]">
            <iframe
              title="Vimeo Video Embed"
              src={vimeoEmbed}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
          {(item.title || item.caption) && (
            <div className="mt-2 text-center space-y-0.5 px-2">
              {item.title && <h4 className="font-heading text-sm font-bold text-white truncate">{item.title}</h4>}
              {item.caption && <p className="font-serif text-xs italic text-slate-300 line-clamp-1">"{item.caption}"</p>}
            </div>
          )}
        </div>
      );
    }

    const playableUrl = getPlayableVideoUrl(rawVideoUrl);

    return (
      <div className="relative w-full max-w-md mx-auto">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black border border-pink-500/30">
          <video
            key={playableUrl}
            ref={videoRef}
            src={playableUrl}
            controls
            autoPlay
            playsInline
            preload="auto"
            muted={isMuted}
            poster={item.thumbnailUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80'}
            onLoadedData={(e) => {
              e.currentTarget.play().then(() => setIsPlayingVideo(true)).catch(() => {});
            }}
            onPlay={() => setIsPlayingVideo(true)}
            onPause={() => setIsPlayingVideo(false)}
            onEnded={() => {
              setIsPlayingVideo(false);
              setVideoProgress(100);
            }}
            className="w-full h-auto max-h-[240px] sm:max-h-[260px] object-contain mx-auto"
          >
            <source src={playableUrl} type="video/mp4" />
            <source src={playableUrl} type="video/webm" />
            Your browser does not support HTML5 video playback.
          </video>

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2.5 flex flex-col gap-1.5 z-20">
            <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
              <div className="bg-pink-500 h-full" style={{ width: `${videoProgress}%` }} />
            </div>

            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlayVideo}
                  className="p-1.5 rounded-full bg-pink-500 text-white"
                >
                  {isPlayingVideo ? <Pause className="h-3.5 w-3.5 fill-white" /> : <Play className="h-3.5 w-3.5 fill-white ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={toggleMuteVideo}
                  className="p-1 rounded-full bg-slate-800/80 text-white"
                >
                  {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setFullscreenVideo(item)}
                className="p-1 rounded-full bg-slate-800/80 text-white"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {(item.title || item.caption) && (
          <div className="mt-2 text-center space-y-0.5 px-2">
            {item.title && <h4 className="font-heading text-sm font-bold text-white truncate">{item.title}</h4>}
            {item.caption && <p className="font-serif text-xs italic text-slate-300 line-clamp-1">"{item.caption}"</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col justify-between py-2 px-2 text-slate-100 select-none relative max-w-2xl mx-auto max-h-[480px] overflow-hidden">
      {/* 1. MEMORY INTRO PHASE */}
      {phase === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4 my-auto"
        >
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-lg">
            <Camera className="h-6 w-6" />
          </div>

          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
            <Sparkles className="h-3 w-3 text-pink-400" />
            Digital Memory Album
          </span>

          <h2 className="font-heading text-lg sm:text-2xl font-extrabold text-white leading-tight max-w-sm">
            "{introText}"
          </h2>

          <button
            type="button"
            onClick={() => setPhase('active')}
            className="px-7 py-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-xs font-extrabold text-white shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
            OPEN MEMORIES ALBUM
          </button>
        </motion.div>
      )}

      {/* 2. ACTIVE MEMORIES CAROUSEL PHASE */}
      {phase === 'active' && (
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between p-2 px-4 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] backdrop-blur-xl">
            <div className="flex items-center gap-1.5">
              <Film className="h-3.5 w-3.5 text-pink-400" />
              <span className="font-bold text-white font-mono">
                Memory {currentIndex + 1} of {items.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAutoPlaying((prev) => !prev)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                  isAutoPlaying
                    ? 'bg-pink-500 text-white border-pink-400 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                {isAutoPlaying ? `⏸ ${autoPlayInterval <= 2 ? 'Fast Auto' : 'Auto Play'}` : '▶ Auto Play'}
              </button>
            </div>
          </div>

          <div
            className="relative flex-1 flex items-center justify-center my-1"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {currentItem.type === 'video' ? renderVideoFrame(currentItem) : renderPhotoFrame(currentItem)}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-slate-800 bg-slate-900 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>

            <div className="flex items-center gap-1">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx ? 'w-5 bg-pink-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1 px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-xs font-bold text-white shadow-md hover:scale-105 cursor-pointer"
            >
              <span>{currentIndex === items.length - 1 ? 'Finish' : 'Next'}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. MEMORY ENDING PHASE */}
      {phase === 'ending' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4 my-auto max-w-sm mx-auto"
        >
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-lg">
            <Heart className="h-6 w-6 fill-white/20 animate-pulse" />
          </div>

          <h3 className="font-heading text-base sm:text-xl font-extrabold text-white leading-tight">
            "{endingText}"
          </h3>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setCurrentIndex(0);
                setPhase('active');
              }}
              className="px-4 py-2 rounded-full border border-slate-800 bg-slate-900 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Replay</span>
            </button>

            {onMemoriesComplete && (
              <button
                type="button"
                onClick={onMemoriesComplete}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-xs font-bold text-white shadow-md hover:scale-105"
              >
                CONTINUE
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* PHOTO ZOOM LIGHTBOX MODAL */}
      <AnimatePresence>
        {zoomedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4">
            <button
              type="button"
              onClick={() => setZoomedPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 cursor-pointer z-50"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="max-w-3xl max-h-[85vh] flex flex-col items-center justify-center p-2 text-center space-y-3">
              <img src={zoomedPhoto.fileUrl} alt={zoomedPhoto.caption || 'Zoomed Photo'} className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl" />
              {zoomedPhoto.caption && <p className="font-serif text-sm text-slate-200 italic">"{zoomedPhoto.caption}"</p>}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* VIDEO FULLSCREEN MODAL */}
      <AnimatePresence>
        {fullscreenVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4">
            <button
              type="button"
              onClick={() => setFullscreenVideo(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 cursor-pointer z-50"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="w-full max-w-3xl flex flex-col items-center justify-center p-2">
              <video
                src={fullscreenVideo.fileUrl}
                controls
                autoPlay
                className="w-full max-h-[75vh] object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
