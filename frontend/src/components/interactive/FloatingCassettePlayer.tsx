import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { MusicTrack, SpotifyTrack } from '../../context/WizardContext';
import { resolveMediaUrl } from '../../services/giftService';

interface FloatingCassettePlayerProps {
  tracks?: MusicTrack[];
  singleMusicUrl?: string;
  spotifyTrack?: SpotifyTrack | null;
  autoStart?: boolean;
}

export const parseSpotifyTrackId = (url?: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/track[\/:]([a-zA-Z0-9]{22})/);
  return match ? match[1] : null;
};

const getPlayableAudioUrl = (rawUrl?: string): string | null => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.includes('spotify.com') || trimmed.includes('youtube.com')) {
    return null;
  }
  return resolveMediaUrl(trimmed);
};

export const FloatingCassettePlayer: React.FC<FloatingCassettePlayerProps> = ({
  tracks,
  singleMusicUrl,
  spotifyTrack,
  autoStart = true,
}) => {
  const playlist = React.useMemo<(MusicTrack & { isSpotify?: boolean; spotifyUrl?: string; spotifyId?: string })[]>(() => {
    if (spotifyTrack) {
      const spId = spotifyTrack.id || parseSpotifyTrackId(spotifyTrack.spotifyUrl) || '';
      return [
        {
          id: `spotify-${spId || Date.now()}`,
          url: spotifyTrack.previewUrl || spotifyTrack.spotifyUrl || '',
          title: spotifyTrack.name || 'Tum Jo Aaye',
          artist: spotifyTrack.artist || 'Rahat Fateh Ali Khan',
          albumCoverUrl: spotifyTrack.albumArt || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80',
          isSpotify: true,
          spotifyUrl: spotifyTrack.spotifyUrl || (spId ? `https://open.spotify.com/track/${spId}` : ''),
          spotifyId: spId,
        },
      ];
    }
    if (tracks && tracks.length > 0) return tracks;
    if (singleMusicUrl && singleMusicUrl.trim()) {
      const spId = parseSpotifyTrackId(singleMusicUrl);
      if (spId || singleMusicUrl.includes('spotify.com')) {
        return [
          {
            id: `spotify-${spId || 'track'}`,
            url: singleMusicUrl,
            title: 'Spotify Track',
            artist: 'Spotify Artist',
            albumCoverUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80',
            isSpotify: true,
            spotifyUrl: singleMusicUrl,
            spotifyId: spId || '',
          },
        ];
      }

      const playable = getPlayableAudioUrl(singleMusicUrl);
      if (playable) {
        return [
          {
            id: 'single-1',
            url: playable,
            title: 'Special Gift Soundtrack',
            artist: 'Luvora Collection',
            albumCoverUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80',
          },
        ];
      }
    }
    return [];
  }, [tracks, singleMusicUrl, spotifyTrack]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showSpotifyEmbed, setShowSpotifyEmbed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = playlist[0];
  const isSpotifyTrack = Boolean(currentTrack?.isSpotify || (currentTrack?.url && currentTrack.url.includes('spotify.com')));
  const spotifyTrackId = currentTrack?.spotifyId || parseSpotifyTrackId(currentTrack?.spotifyUrl || currentTrack?.url);
  const audioUrl = !isSpotifyTrack ? getPlayableAudioUrl(currentTrack?.url) : null;

  // Attempt autoplay for custom uploaded audio
  useEffect(() => {
    if (!isSpotifyTrack && audioUrl && autoStart && audioRef.current) {
      if (currentTrack?.trimStart) {
        audioRef.current.currentTime = currentTrack.trimStart;
      }
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, [autoStart, audioUrl, isSpotifyTrack, currentTrack?.trimStart]);

  // Return null if NO music configured
  if (!currentTrack || (!audioUrl && !isSpotifyTrack)) {
    return null;
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current || !currentTrack) return;
    const trimStart = currentTrack.trimStart || 0;
    const trimEnd = currentTrack.trimEnd;
    if (trimEnd !== undefined && trimEnd > trimStart) {
      if (audioRef.current.currentTime >= trimEnd) {
        audioRef.current.pause();
        audioRef.current.currentTime = trimStart;
        setIsPlaying(false);
      }
    }
  };

  const togglePlay = () => {
    if (isSpotifyTrack) {
      if (spotifyTrackId) {
        setShowSpotifyEmbed((prev) => !prev);
      } else if (currentTrack.spotifyUrl) {
        window.open(currentTrack.spotifyUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const trimStart = currentTrack?.trimStart || 0;
      const trimEnd = currentTrack?.trimEnd;
      if (trimEnd !== undefined && (audioRef.current.currentTime < trimStart || audioRef.current.currentTime >= trimEnd)) {
        audioRef.current.currentTime = trimStart;
      }
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  return (
    <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 select-none">
      {!isSpotifyTrack && audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          loop={!currentTrack?.trimEnd}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* COMPACT SPOTIFY-STYLE CARD BACKGROUND MUSIC PLAYER (MATCHES SCREENSHOT 3) */}
      <motion.div
        initial={{ opacity: 0, y: -15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative flex flex-col p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-[#800000] via-[#900000] to-[#700000] border border-white/20 shadow-2xl backdrop-blur-md text-white w-[230px] sm:w-[300px]"
      >
        <div className="flex items-center gap-2.5 w-full">
          {/* Left: Square Album Artwork */}
          <div
            onClick={togglePlay}
            className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-xl overflow-hidden bg-slate-900 border border-white/20 shadow-md cursor-pointer shrink-0 group"
          >
            <img
              src={currentTrack.albumCoverUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80'}
              alt="Album Cover"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80';
              }}
            />
          </div>

          {/* Middle: Title, Artist & Save on Spotify */}
          <div className="flex flex-col min-w-0 flex-1 justify-center">
            <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight">
              {currentTrack.title}
            </h4>
            <p className="text-[10px] sm:text-xs text-rose-200 truncate font-medium mt-0.5">
              {currentTrack.artist}
            </p>

            {/* "+ Save on Spotify" Action Link */}
            {isSpotifyTrack && currentTrack.spotifyUrl && (
              <a
                href={currentTrack.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-white/90 hover:text-white mt-1 cursor-pointer"
              >
                <span className="h-3 w-3 rounded-full border border-white flex items-center justify-center text-[9px] font-bold leading-none">+</span>
                <span>Save on Spotify</span>
              </a>
            )}
          </div>

          {/* Right: Spotify Logo & Circular White Play Button */}
          <div className="flex flex-col items-end justify-between h-11 sm:h-12 shrink-0">
            {/* Spotify Brand Logo */}
            <svg className="h-4 w-4 text-white opacity-90" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.18-1.14-.66-.12-.48.18-1.02.66-1.14 4.38-1.38 9.841-.72 13.561 1.56.36.18.54.78.12 1.32zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72.96.42 1.5-.3.54-.96.72-1.5.42z"/>
            </svg>

            {/* Circular White Play Button with Red Icon */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white text-[#800000] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5 fill-[#800000]" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-[#800000] ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Embedded Collapsible Spotify Player Widget */}
        {showSpotifyEmbed && isSpotifyTrack && spotifyTrackId && (
          <div className="mt-2 pt-2 border-t border-white/20">
            <iframe
              title="Spotify Embedded Player"
              src={`https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator&theme=0`}
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl border border-white/10 bg-black"
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};
