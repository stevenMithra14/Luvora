import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Disc, Volume2, VolumeX } from 'lucide-react';
import { MusicTrack, SpotifyTrack } from '../../context/WizardContext';
import { resolveMediaUrl } from '../../services/giftService';

interface FloatingCassettePlayerProps {
  tracks?: MusicTrack[];
  singleMusicUrl?: string;
  spotifyTrack?: SpotifyTrack | null;
  autoStart?: boolean;
}

const getPlayableAudioUrl = (rawUrl?: string, spotifyPreviewUrl?: string) => {
  if (spotifyPreviewUrl && spotifyPreviewUrl.startsWith('http')) {
    return spotifyPreviewUrl;
  }
  if (!rawUrl || typeof rawUrl !== 'string') {
    return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  }
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.includes('spotify.com') || trimmed.includes('youtube.com')) {
    return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  }
  return resolveMediaUrl(trimmed, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
};

export const FloatingCassettePlayer: React.FC<FloatingCassettePlayerProps> = ({
  tracks,
  singleMusicUrl,
  spotifyTrack,
  autoStart = true,
}) => {
  const playlist = React.useMemo(() => {
    if (spotifyTrack) {
      return [
        {
          id: `spotify-${spotifyTrack.id}`,
          url: spotifyTrack.previewUrl || spotifyTrack.spotifyUrl || singleMusicUrl || '',
          title: spotifyTrack.name || 'Spotify Track',
          artist: spotifyTrack.artist || 'Spotify Artist',
          albumCoverUrl: spotifyTrack.albumArt || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80',
          isSpotify: true,
          spotifyUrl: spotifyTrack.spotifyUrl || `https://open.spotify.com/track/${spotifyTrack.id}`,
        },
      ];
    }
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
    return [
      {
        id: 'default-1',
        url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3',
        title: 'Romantic Melody',
        artist: 'Luvora Soundtrack',
        albumCoverUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80',
      },
    ];
  }, [tracks, singleMusicUrl, spotifyTrack]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = playlist[0];
  const audioUrl = getPlayableAudioUrl(currentTrack?.url, spotifyTrack?.previewUrl);

  // Attempt autoplay on mount / unboxing
  useEffect(() => {
    if (autoStart && audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay with sound blocked by browser policy
          setIsPlaying(false);
        });
    }
  }, [autoStart, audioUrl]);

  if (!currentTrack) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Playback error:', err);
          // Retry with fallback audio source if necessary
          if (audioRef.current) {
            audioRef.current.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        });
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed top-2.5 right-2.5 sm:top-4 sm:right-4 z-50 select-none">
      <audio
        ref={audioRef}
        src={audioUrl}
        loop
        muted={isMuted}
      />

      {/* VINTAGE COMPACT CASSETTE PLAYER CONTAINER */}
      <motion.div
        initial={{ opacity: 0, y: -15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-2xl bg-slate-950/95 border-2 border-pink-500/40 shadow-2xl backdrop-blur-xl text-white max-w-[280px] sm:max-w-[320px]"
        style={{ boxShadow: isPlaying ? '0 0 20px rgba(236,72,153,0.35)' : '0 10px 25px rgba(0,0,0,0.5)' }}
      >
        {/* Decorative Cassette Corner Screws */}
        <div className="absolute top-1 left-1 h-1.5 w-1.5 rounded-full bg-slate-600 border border-slate-400" />
        <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-slate-600 border border-slate-400" />
        <div className="absolute bottom-1 left-1 h-1.5 w-1.5 rounded-full bg-slate-600 border border-slate-400" />
        <div className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-slate-600 border border-slate-400" />

        {/* Album Artwork Cover in Round Hub */}
        <div
          onClick={togglePlay}
          className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-xl overflow-hidden border border-pink-400/60 shadow-md cursor-pointer shrink-0 group"
        >
          <img
            src={currentTrack.albumCoverUrl}
            alt="Album Cover"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80';
            }}
          />
          <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-transparent transition-colors flex items-center justify-center">
            {!isPlaying ? (
              <Play className="h-4 w-4 text-white fill-white shadow-md" />
            ) : (
              <Pause className="h-4 w-4 text-white fill-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </div>

        {/* Cassette Tape Reels & Track Meta */}
        <div className="flex flex-col min-w-0 flex-1 pl-1">
          {/* Song Title & Artist */}
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-white truncate leading-tight">
              {currentTrack.title}
            </span>
            <span className="text-[9px] font-semibold text-pink-300/80 truncate">
              {currentTrack.artist}
            </span>
          </div>

          {/* Mini Rotating Cassette Reels Visualizer */}
          <div className="flex items-center gap-2 mt-1 px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-800">
            <motion.div
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="h-3 w-3 rounded-full border border-pink-400 flex items-center justify-center shrink-0"
            >
              <Disc className="h-2 w-2 text-pink-300" />
            </motion.div>
            {/* Magnetic Tape Line */}
            <div className="h-0.5 flex-1 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 opacity-60 rounded" />
            <motion.div
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="h-3 w-3 rounded-full border border-pink-400 flex items-center justify-center shrink-0"
            >
              <Disc className="h-2 w-2 text-pink-300" />
            </motion.div>
          </div>
        </div>

        {/* Controls: Direct Play/Pause + Mute */}
        <div className="flex items-center gap-1.5 shrink-0 pl-1">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
            className="h-7 w-7 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5 fill-white" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute music' : 'Mute music'}
            className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="h-3.5 w-3.5 text-rose-400" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

