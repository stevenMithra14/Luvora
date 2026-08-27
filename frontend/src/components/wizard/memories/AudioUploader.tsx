import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Upload, Loader2, AlertCircle, Link as LinkIcon, Plus, Disc, MoveUp, MoveDown, Image as ImageIcon } from 'lucide-react';
import { useWizard, MusicTrack } from '../../../context/WizardContext';
import { uploadAudioFile } from '../../../services/uploadService';

import { SpotifyMusicPicker } from './SpotifyMusicPicker';

export const AudioUploader: React.FC = () => {
  const { data, setMusicTracks } = useWizard();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tracks = data.musicTracks || [];
  const [musicTab, setMusicTab] = useState<'custom' | 'spotify'>(data.musicSource === 'spotify' || data.spotifyTrack ? 'spotify' : 'custom');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Form for adding a new track by Link or Upload
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('');
  const [newTrackUrl, setNewTrackUrl] = useState('');
  const [newTrackCoverUrl, setNewTrackCoverUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAudioUpload = async (file: File) => {
    if (!file) return;
    setErrorMessage('');
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const res = await uploadAudioFile(file, (percent) => {
        setUploadProgress(percent);
      });

      const newTrack: MusicTrack = {
        id: `track-${Date.now()}`,
        title: newTrackTitle.trim() || file.name.replace(/\.[^/.]+$/, ''),
        artist: newTrackArtist.trim() || 'Custom Gift Song',
        url: res.url,
        albumCoverUrl: newTrackCoverUrl.trim() || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80',
      };

      const updated = [...tracks, newTrack];
      setMusicTracks(updated);
      setNewTrackTitle('');
      setNewTrackArtist('');
      setNewTrackUrl('');
      setNewTrackCoverUrl('');
      setShowAddForm(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload audio file.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAddTrackByUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const trimmedUrl = newTrackUrl.trim();
    if (!trimmedUrl) {
      setErrorMessage('Please enter a valid song audio URL.');
      return;
    }

    const newTrack: MusicTrack = {
      id: `track-${Date.now()}`,
      title: newTrackTitle.trim() || 'Special Track',
      artist: newTrackArtist.trim() || 'Luvora Collection',
      url: trimmedUrl,
      albumCoverUrl: newTrackCoverUrl.trim() || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80',
    };

    const updated = [...tracks, newTrack];
    setMusicTracks(updated);
    setNewTrackTitle('');
    setNewTrackArtist('');
    setNewTrackUrl('');
    setNewTrackCoverUrl('');
    setShowAddForm(false);
  };

  const handleRemoveTrack = (id: string) => {
    const updated = tracks.filter((t) => t.id !== id);
    setMusicTracks(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...tracks];
    const temp = items[index - 1];
    items[index - 1] = items[index];
    items[index] = temp;
    setMusicTracks(items);
  };

  const handleMoveDown = (index: number) => {
    if (index === tracks.length - 1) return;
    const items = [...tracks];
    const temp = items[index + 1];
    items[index + 1] = items[index];
    items[index] = temp;
    setMusicTracks(items);
  };

  return (
    <div className="space-y-5 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
      {/* 1. MUSIC SELECTION MODE SWITCHER BAR */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
            <Disc className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <h4 className="font-heading text-sm font-bold text-white">Gift Background Music</h4>
            <p className="text-[11px] text-slate-400">Select music from Spotify or upload custom MP3 tracks</p>
          </div>
        </div>

        {/* 2 Tabs: Upload Your Music vs Search Spotify */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setMusicTab('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              musicTab === 'custom'
                ? 'bg-pink-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎵 Upload Music</span>
          </button>
          <button
            type="button"
            onClick={() => setMusicTab('spotify')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              musicTab === 'spotify'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎧 Search Spotify</span>
          </button>
        </div>
      </div>

      {/* 2. SPOTIFY MUSIC PICKER TAB */}
      {musicTab === 'spotify' && (
        <SpotifyMusicPicker onSwitchToUpload={() => setMusicTab('custom')} />
      )}

      {/* 3. CUSTOM MUSIC PLAYLIST TAB */}
      {musicTab === 'custom' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Custom Music Playlist ({tracks.length})</span>
            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-xs font-extrabold text-white flex items-center gap-1 shadow-md hover:scale-105 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Add Custom Song</span>
            </button>
          </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/aac,audio/m4a"
        className="hidden"
        onChange={(e) => e.target.files && e.target.files[0] && handleAudioUpload(e.target.files[0])}
      />

      {/* Add New Song Form Modal / Collapsible */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-slate-950 border border-pink-500/30 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-pink-300">Add New Song Track</span>
            <span className="text-[11px] text-slate-400">Audio File or URL Link</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              value={newTrackTitle}
              onChange={(e) => setNewTrackTitle(e.target.value)}
              placeholder="Song Title (e.g. Our Favorite Melody)"
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
            <input
              type="text"
              value={newTrackArtist}
              onChange={(e) => setNewTrackArtist(e.target.value)}
              placeholder="Artist Name (e.g. Taylor Swift)"
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="relative">
              <input
                type="url"
                value={newTrackUrl}
                onChange={(e) => setNewTrackUrl(e.target.value)}
                placeholder="Direct Song Audio URL (https://...)"
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
              <LinkIcon className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            <div className="relative">
              <input
                type="url"
                value={newTrackCoverUrl}
                onChange={(e) => setNewTrackCoverUrl(e.target.value)}
                placeholder="Album Cover Image URL (https://...)"
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
              <ImageIcon className="h-3.5 w-3.5 text-pink-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleAddTrackByUrl}
              className="px-5 py-2 rounded-xl bg-pink-500 text-xs font-bold text-white shadow-md hover:bg-pink-600 transition-colors cursor-pointer"
            >
              Save Link Track
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5 text-sky-400" />
              <span>Or Upload MP3 File</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="w-full">
          <div className="flex items-center justify-between text-xs text-pink-300 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-pink-400" />
              Uploading track...
            </span>
            <span className="font-mono">{uploadProgress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* List of Tracks in Playlist */}
      <div className="space-y-2.5 pt-1">
        {tracks.map((track, idx) => (
          <div
            key={track.id || idx}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 shadow-md"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Album Cover Thumbnail */}
              <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0 relative">
                <img
                  src={track.albumCoverUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80'}
                  alt="Album Cover"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{track.title}</div>
                <div className="text-[10px] text-slate-400 truncate">{track.artist} &bull; Song #{idx + 1}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleMoveUp(idx)}
                disabled={idx === 0}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <MoveUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(idx)}
                disabled={idx === tracks.length - 1}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <MoveDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleRemoveTrack(track.id)}
                className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
        </div>
      )}
    </div>
  );
};
