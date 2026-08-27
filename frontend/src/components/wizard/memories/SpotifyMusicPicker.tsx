import React, { useState } from 'react';
import { Music, Check, Trash2, RefreshCw, AlertCircle, Link as LinkIcon, ExternalLink, Loader2 } from 'lucide-react';
import { useWizard, SpotifyTrack } from '../../../context/WizardContext';
import { fetchSpotifyOEmbed } from '../../../services/giftService';

export const parseSpotifyTrackId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Pattern 1: https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT or with region /intl-xx/track/
  const matchWeb = trimmed.match(/open\.spotify\.com\/(?:[a-zA-Z0-9_-]+\/)?track\/([a-zA-Z0-9]+)/i);
  if (matchWeb && matchWeb[1]) {
    return matchWeb[1];
  }

  // Pattern 2: spotify:track:4cOdK2wGLETKBW3PvgPWqT
  const matchUri = trimmed.match(/spotify:track:([a-zA-Z0-9]+)/i);
  if (matchUri && matchUri[1]) {
    return matchUri[1];
  }

  return null;
};

interface SpotifyMusicPickerProps {
  onSwitchToUpload?: () => void;
}

export const SpotifyMusicPicker: React.FC<SpotifyMusicPickerProps> = () => {
  const { data, setSpotifyTrack } = useWizard();
  const selectedTrack = data.spotifyTrack;

  const [inputUrl, setInputUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSpotifySong = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trackId = parseSpotifyTrackId(inputUrl);
    if (!trackId) {
      setErrorMessage('Please enter a valid Spotify song link (e.g. https://open.spotify.com/track/...).');
      return;
    }

    setIsLoading(true);

    const cleanSpotifyUrl = `https://open.spotify.com/track/${trackId}`;
    const embedUrl = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;

    // Optionally fetch metadata from Spotify's public oEmbed (requires NO credentials)
    const oembed = await fetchSpotifyOEmbed(cleanSpotifyUrl);

    const newSpotifyTrack: SpotifyTrack = {
      id: trackId,
      name: oembed?.title || 'Spotify Track',
      artist: oembed?.artist || 'Spotify Artist',
      album: 'Spotify Catalogue',
      albumArt: oembed?.thumbnail_url || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80',
      spotifyUrl: cleanSpotifyUrl,
      embedUrl: embedUrl,
      uri: `spotify:track:${trackId}`,
    };

    setSpotifyTrack(newSpotifyTrack);
    setInputUrl('');
    setIsLoading(false);
  };

  const handleRemoveTrack = () => {
    setSpotifyTrack(null);
    setErrorMessage('');
  };

  return (
    <div className="space-y-4 font-sans text-slate-100">
      {/* 1. SELECTED SPOTIFY SONG CARD WITH OFFICIAL EMBED */}
      {selectedTrack ? (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-2xl space-y-4 max-w-full overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Music className="h-4 w-4 text-emerald-400" />
              <span>🎧 Selected Spotify Song</span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Link Attached
            </span>
          </div>

          {/* Official Spotify Embed iFrame */}
          <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner w-full">
            <iframe
              src={selectedTrack.embedUrl || `https://open.spotify.com/embed/track/${selectedTrack.id}?utm_source=generator`}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Official Spotify Track Player"
              className="w-full rounded-2xl"
            />
          </div>

          {/* Action Control Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
            {selectedTrack.spotifyUrl && (
              <a
                href={selectedTrack.spotifyUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open in Spotify</span>
              </a>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSpotifyTrack(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Change Song</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveTrack}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2. PASTE SPOTIFY LINK INPUT FORM */
        <form onSubmit={handleAddSpotifySong} className="space-y-3 p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl max-w-full overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Music className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Paste Spotify Song Link</span>
            </span>
            <span className="text-[10px] text-slate-400">No login or API key required</span>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="https://open.spotify.com/track/..."
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
              <LinkIcon className="h-4 w-4 text-emerald-400 absolute left-3 top-3" />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="w-full py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-xs font-extrabold text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Validating Spotify Song...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Add Song to Gift</span>
                </>
              )}
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
            💡 Tip: Open Spotify, click <strong>"..." → Share → Copy Song Link</strong>, and paste it here.
          </p>
        </form>
      )}
    </div>
  );
};
