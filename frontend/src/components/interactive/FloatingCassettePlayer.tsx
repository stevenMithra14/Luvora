import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Disc, Volume2, VolumeX } from 'lucide-react';
import { MusicTrack } from '../../context/WizardContext';

interface FloatingCassettePlayerProps {
  tracks?: MusicTrack[];
  singleMusicUrl?: string;
  autoStart?: boolean;
}

const getPlayableAudioUrl = (rawUrl?: string) => {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  }
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.includes('spotify.com') || trimmed.includes('youtube.com')) {
    return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  }
  if (trimmed.startsWith('/uploads')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
    const backendOrigin = apiBase.replace(/\/api\/?$/, '');
    return `${backendOrigin}${trimmed}`;
  }
  return trimmed;
};

export const FloatingCassettePlayer: React.FC<FloatingCassettePlayerProps> = ({
  tracks,
  singleMusicUrl,
  autoStart = false,
}) => {
  const playlist: MusicTrack[] = React.useMemo(() => {
    if (tracks && tracks.length > 0) return tracks;
    if (singleMusicUrl) {
      return [
        {
          id: 'single-1',
          url: singleMusicUrl,
          title: 'Special Gift Soundtrack',
          artist: 'Luvora Collection',
          albumCoverUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80',
        },
      ];
    }
    return [];
  }, [tracks, singleMusicUrl]);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = playlist[currentTrackIndex] || playlist[0];

  const currentAudioUrl = getPlayableAudioUrl(currentTrack?.url);

  useEffect(() => {
    if (autoStart && currentAudioUrl && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [autoStart, currentAudioUrl]);

  if (!playlist.length || !currentTrack?.url) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current.src !== currentAudioUrl) {
        audioRef.current.src = currentAudioUrl;
      }
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Audio play error, retrying with soundhelix:', err);
        const fallback = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
        fallback.play().then(() => setIsPlaying(true)).catch(() => {});
      });
    }
  };

  const handleNextTrack = () => {
    if (playlist.length <= 1) return;
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    if (playlist.length <= 1) return;
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 select-none">
      <audio
        ref={audioRef}
        src={currentAudioUrl}
        autoPlay={isPlaying}
        muted={isMuted}
        onEnded={handleNextTrack}
      />

      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex items-center gap-2 p-1.5 pl-2 pr-3.5 rounded-full bg-slate-950/90 border border-pink-500/40 shadow-2xl backdrop-blur-xl text-white"
      >
        <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-pink-400 shadow-md cursor-pointer group shrink-0">
          <img
            src={currentTrack.albumCoverUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80'}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80';
            }}
            alt="Album Cover"
            className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'animate-spin-slow' : ''}`}
            style={{ animationDuration: '8s' }}
          />
          <div className="absolute inset-0 m-auto h-3 w-3 rounded-full bg-slate-950 border border-pink-300 flex items-center justify-center">
            <Disc className="h-2 w-2 text-pink-400" />
          </div>
        </div>

        <div className="flex flex-col max-w-[130px] sm:max-w-[160px] min-w-0">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-[11px] font-bold text-white truncate leading-tight">
              {currentTrack.title || 'Special Song'}
            </span>
          </div>
          <span className="text-[9px] font-semibold text-pink-300/80 truncate">
            {currentTrack.artist || 'Luvora Track'} {playlist.length > 1 ? `(${currentTrackIndex + 1}/${playlist.length})` : ''}
          </span>
        </div>

        <div className="flex items-center gap-1 ml-1">
          {playlist.length > 1 && (
            <button
              type="button"
              onClick={handlePrevTrack}
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Previous Song"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={togglePlay}
            className="h-7 w-7 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title={isPlaying ? 'Pause Music' : 'Play Music'}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5 fill-white" /> : <Play className="h-3.5 w-3.5 fill-white ml-0.5" />}
          </button>

          {playlist.length > 1 && (
            <button
              type="button"
              onClick={handleNextTrack}
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Next Song"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={toggleMute}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
