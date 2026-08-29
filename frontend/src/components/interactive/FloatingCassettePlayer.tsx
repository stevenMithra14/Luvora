import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Disc, Volume2, VolumeX, ExternalLink, Music2 } from 'lucide-react';
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
          title: spotifyTrack.name || 'Spotify Track',
          artist: spotifyTrack.artist || 'Spotify Artist',
          albumCoverUrl: spotifyTrack.albumArt || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80',
          isSpotify: true,
          spotifyUrl: spotifyTrack.spotifyUrl || `https://open.spotify.com/track/${spId}`,
          spotifyId: spId,
        },
      ];
    }
    if (tracks && tracks.length > 0) return tracks;
    if (singleMusicUrl && singleMusicUrl.trim()) {
      const spId = parseSpotifyTrackId(singleMusicUrl);
      if (spId) {
        return [
          {
            id: `spotify-${spId}`,
            url: singleMusicUrl,
            title: 'Spotify Track',
            artist: 'Spotify Artist',
            albumCoverUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80',
            isSpotify: true,
            spotifyUrl: singleMusicUrl,
            spotifyId: spId,
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
  const [isMuted, setIsMuted] = useState(false);
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
      setShowSpotifyEmbed((prev) => !prev);
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

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed top-2.5 right-2.5 sm:top-4 sm:right-4 z-50 select-none">
      {!isSpotifyTrack && audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          loop={!currentTrack?.trimEnd}
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
        />
      )}

      {/* COMPACT CASSETTE PLAYER CONTAINER */}
      <motion.div
        initial={{ opacity: 0, y: -15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative flex flex-col p-1.5 pl-2 pr-2.5 rounded-2xl bg-slate-950/95 border border-pink-500/40 shadow-2xl backdrop-blur-xl text-white w-[160px] sm:w-[260px]"
        style={{ boxShadow: isPlaying ? '0 0 15px rgba(236,72,153,0.3)' : '0 8px 20px rgba(0,0,0,0.5)' }}
      >
        <div className="flex items-center gap-1.5 w-full">
          {/* Album Artwork Cover */}
          <div
            onClick={togglePlay}
            className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-xl overflow-hidden border border-pink-400/60 shadow-md cursor-pointer shrink-0 group"
          >
            <img
              src={currentTrack.albumCoverUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80'}
              alt="Album Cover"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80';
              }}
            />
            <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-transparent transition-colors flex items-center justify-center">
              {isSpotifyTrack ? (
                <Music2 className="h-3.5 w-3.5 text-emerald-400 shadow-md" />
              ) : !isPlaying ? (
                <Play className="h-3.5 w-3.5 text-white fill-white shadow-md" />
              ) : (
                <Pause className="h-3.5 w-3.5 text-white fill-white shadow-md" />
              )}
            </div>
          </div>

          {/* Song Meta */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between gap-0.5">
              <span className="text-[10px] sm:text-[11px] font-bold text-white truncate leading-tight">
                {currentTrack.title}
              </span>
            </div>
            <span className="text-[8px] sm:text-[9px] font-semibold text-pink-300/80 truncate">
              {currentTrack.artist}
            </span>

            {/* Mini Rotating Cassette Reels (Hidden on small mobile screens to save space) */}
            <div className="hidden sm:flex items-center gap-1.5 mt-1 px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-800">
              <motion.div
                animate={isPlaying || showSpotifyEmbed ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="h-2.5 w-2.5 rounded-full border border-pink-400 flex items-center justify-center shrink-0"
              >
                <Disc className="h-1.5 w-1.5 text-pink-300" />
              </motion.div>
              <div className="h-0.5 flex-1 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 opacity-60 rounded" />
              <motion.div
                animate={isPlaying || showSpotifyEmbed ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="h-2.5 w-2.5 rounded-full border border-pink-400 flex items-center justify-center shrink-0"
              >
                <Disc className="h-1.5 w-1.5 text-pink-300" />
              </motion.div>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {isSpotifyTrack ? (
              <button
                type="button"
                onClick={() => setShowSpotifyEmbed((prev) => !prev)}
                className="px-2 py-0.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-[9px] sm:text-[10px] font-extrabold text-white flex items-center gap-0.5 shadow-md cursor-pointer transition-all"
                title="Toggle Spotify player"
              >
                <span>Spotify</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause music' : 'Play music'}
                  className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="h-3 w-3 fill-white" />
                  ) : (
                    <Play className="h-3 w-3 fill-white ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute music' : 'Mute music'}
                  className="hidden sm:block p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted ? (
                    <VolumeX className="h-3 w-3 text-rose-400" />
                  ) : (
                    <Volume2 className="h-3 w-3 text-emerald-400" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Embedded Spotify Widget (Collapsible - Hidden by Default on Mobile) */}
        {showSpotifyEmbed && isSpotifyTrack && spotifyTrackId && (
          <div className="mt-1.5 pt-1 border-t border-slate-800">
            <iframe
              title="Spotify Embedded Player"
              src={`https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator&theme=0`}
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl border border-slate-800 bg-black"
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};
