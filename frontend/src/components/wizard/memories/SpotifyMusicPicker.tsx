import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Music, Disc, Play, Pause, Check, Trash2, RefreshCw, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { useWizard, SpotifyTrack } from '../../../context/WizardContext';
import { searchSpotifyApi } from '../../../services/giftService';

interface SpotifyMusicPickerProps {
  onSwitchToUpload?: () => void;
}

const DEFAULT_POPULAR_SEARCHES = ['Perfect', 'Until I Found You', 'Lover', 'Golden Hour', 'As It Was'];

export const SpotifyMusicPicker: React.FC<SpotifyMusicPickerProps> = ({ onSwitchToUpload }) => {
  const { data, setSpotifyTrack } = useWizard();
  const selectedTrack = data.spotifyTrack;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'track' | 'artist' | 'album'>('track');
  const [recentSearches, setRecentSearches] = useState<string[]>(DEFAULT_POPULAR_SEARCHES);

  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [statusState, setStatusState] = useState<'idle' | 'success' | 'unconfigured' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Audio Preview State
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Debounced search trigger
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setStatusState('idle');
      return;
    }

    const timer = setTimeout(() => {
      executeSearch(trimmed, activeFilter);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter]);

  const executeSearch = async (query: string, filterType: 'track' | 'artist' | 'album') => {
    setIsSearching(true);
    setErrorMessage('');
    setStatusState('idle');

    try {
      const res = await searchSpotifyApi(query, filterType);
      if (res.status === 'unconfigured') {
        setStatusState('unconfigured');
        setErrorMessage(res.message || 'Spotify search is not configured on backend.');
        setSearchResults([]);
      } else if (res.status === 'error') {
        setStatusState('error');
        setErrorMessage(res.message || 'Music search is temporarily unavailable. Please try again.');
        setSearchResults([]);
      } else {
        setStatusState('success');
        setSearchResults(res.tracks || []);

        // Add to recent searches if not present
        if (!recentSearches.includes(query)) {
          setRecentSearches((prev) => [query, ...prev.filter((q) => q !== query)].slice(0, 6));
        }
      }
    } catch (err: any) {
      setStatusState('error');
      setErrorMessage('Music search is temporarily unavailable. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setStatusState('idle');
  };

  const handleSelectTrack = (track: SpotifyTrack) => {
    setSpotifyTrack(track);
  };

  const handleRemoveSelectedTrack = () => {
    setSpotifyTrack(null);
  };

  const togglePreview = (track: SpotifyTrack) => {
    if (!track.previewUrl) return;

    if (previewTrackId === track.id && isPlayingPreview) {
      audioRef.current?.pause();
      setIsPlayingPreview(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(track.previewUrl);
      setPreviewTrackId(track.id);
      setIsPlayingPreview(true);
      audioRef.current.play().catch(() => {
        setIsPlayingPreview(false);
      });
      audioRef.current.onended = () => {
        setIsPlayingPreview(false);
      };
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-100">
      <audio ref={audioRef} className="hidden" />

      {/* SELECTED SPOTIFY SONG CARD */}
      {selectedTrack ? (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Disc className="h-4 w-4 animate-spin-slow text-emerald-400" />
              <span>🎧 Selected Spotify Song</span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Spotify Catalogue
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 shadow-lg relative group">
              <img
                src={selectedTrack.albumArt || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80'}
                alt={selectedTrack.name}
                className="w-full h-full object-cover"
              />
              {selectedTrack.previewUrl && (
                <button
                  type="button"
                  onClick={() => togglePreview(selectedTrack)}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {previewTrackId === selectedTrack.id && isPlayingPreview ? (
                    <Pause className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <Play className="h-6 w-6 text-white ml-0.5" />
                  )}
                </button>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-heading text-sm sm:text-base font-bold text-white truncate mb-0.5">
                {selectedTrack.name}
              </h4>
              <p className="text-xs text-slate-300 truncate font-semibold">
                {selectedTrack.artist}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {selectedTrack.album} {selectedTrack.durationFormatted ? `\u2022 ${selectedTrack.durationFormatted}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              {selectedTrack.previewUrl ? (
                <button
                  type="button"
                  onClick={() => togglePreview(selectedTrack)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-emerald-500/30"
                >
                  {previewTrackId === selectedTrack.id && isPlayingPreview ? (
                    <>
                      <Pause className="h-3.5 w-3.5 fill-emerald-300" />
                      <span>Pause Preview</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-emerald-300 ml-0.5" />
                      <span>Preview Song</span>
                    </>
                  )}
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 italic">
                  Preview unavailable &bull; Song attached to gift
                </span>
              )}

              {selectedTrack.spotifyUrl && (
                <a
                  href={selectedTrack.spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs flex items-center gap-1"
                  title="Open on Spotify"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
                </a>
              )}
            </div>

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
                onClick={handleRemoveSelectedTrack}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* SEARCH INPUT BAR */}
      <div className="space-y-3 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Music className="h-4 w-4 text-emerald-400" />
            <span>Search Spotify Song Catalogue</span>
          </span>

          {/* Filter Tabs: Songs | Artists | Albums */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter('track')}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeFilter === 'track' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Songs
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('artist')}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeFilter === 'artist' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Artists
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('album')}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeFilter === 'album' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Albums
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs, artists, or albums on Spotify..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-2.5 p-0.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Recent Searches Tags */}
        {recentSearches.length > 0 && !searchQuery && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Recent Searches
            </span>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSearchQuery(term)}
                  className="px-2.5 py-1 rounded-full bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-800 transition-all cursor-pointer"
                >
                  🔍 {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Unconfigured / Error Warning Banner */}
        {(statusState === 'unconfigured' || statusState === 'error') && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block text-white">Music Search Status</span>
              <span>{errorMessage}</span>
              {onSwitchToUpload && (
                <button
                  type="button"
                  onClick={onSwitchToUpload}
                  className="mt-2 px-3 py-1 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold text-[11px] block cursor-pointer"
                >
                  Switch to Upload Your Own Music 🎵
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isSearching && (
          <div className="py-6 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
            <span>Searching Spotify catalogue...</span>
          </div>
        )}

        {/* Empty Search State */}
        {!isSearching && searchQuery && statusState === 'success' && searchResults.length === 0 && (
          <div className="text-center py-8 rounded-2xl bg-slate-950 border border-dashed border-slate-800 space-y-1">
            <Music className="h-6 w-6 text-slate-500 mx-auto" />
            <p className="text-xs font-bold text-slate-300">No Spotify tracks found for "{searchQuery}"</p>
            <p className="text-[11px] text-slate-500">Try searching another song title or artist name.</p>
          </div>
        )}

        {/* SEARCH RESULTS LIST */}
        {!isSearching && searchResults.length > 0 && (
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {searchResults.map((track) => {
              const isSelected = selectedTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Album Cover */}
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 relative group">
                    <img
                      src={track.albumArt || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80'}
                      alt={track.name}
                      className="w-full h-full object-cover"
                    />
                    {track.previewUrl && (
                      <button
                        type="button"
                        onClick={() => togglePreview(track)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        {previewTrackId === track.id && isPlayingPreview ? (
                          <Pause className="h-4 w-4 text-emerald-400 fill-emerald-400" />
                        ) : (
                          <Play className="h-4 w-4 text-white fill-white ml-0.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Track Metadata */}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-heading text-xs sm:text-sm font-bold text-white truncate">
                      {track.name}
                    </h5>
                    <p className="text-[11px] text-slate-300 truncate">
                      {track.artist} &bull; <span className="text-slate-400">{track.album}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {track.durationFormatted && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {track.durationFormatted}
                        </span>
                      )}
                      {!track.previewUrl && (
                        <span className="text-[10px] text-amber-400/80 italic">
                          Preview unavailable &bull; Can still be added
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {track.previewUrl && (
                      <button
                        type="button"
                        onClick={() => togglePreview(track)}
                        className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                          previewTrackId === track.id && isPlayingPreview
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        }`}
                        title="Preview Track"
                      >
                        {previewTrackId === track.id && isPlayingPreview ? (
                          <Pause className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
                        ) : (
                          <Play className="h-3.5 w-3.5 text-slate-300 fill-slate-300 ml-0.5" />
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSelectTrack(track)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-white" />
                          <span>Added</span>
                        </>
                      ) : (
                        <span>+ Add</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
