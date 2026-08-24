import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import { WizardGoodie, MusicTrack } from '../../../context/WizardContext';
import { uploadAudioApi } from '../../../services/giftService';

interface SongGoodieEditorProps {
  goodie: WizardGoodie;
  existingTracks: MusicTrack[];
  onSave: (id: string, updated: Partial<WizardGoodie>) => void;
  onClose: () => void;
}

export const SongGoodieEditor: React.FC<SongGoodieEditorProps> = ({ goodie, onSave, onClose }) => {
  const [songTitle, setSongTitle] = useState(goodie.configurationJson?.songTitle || 'Perfect');
  const [artist, setArtist] = useState(goodie.configurationJson?.artist || 'Ed Sheeran');
  const [audioUrl, setAudioUrl] = useState(goodie.mediaUrl || goodie.configurationJson?.audioUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    try {
      const res = await uploadAudioApi(file, file.name);
      setAudioUrl(res.url);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload audio file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    onSave(goodie.id, {
      title: songTitle || 'A Song For You',
      description: `${songTitle} - ${artist}`,
      mediaUrl: audioUrl,
      configurationJson: {
        ...goodie.configurationJson,
        title: songTitle || 'A Song For You',
        songTitle,
        artist,
        audioUrl,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#faf8f5] border border-amber-900/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-slate-900 font-mono relative"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-900 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="space-y-1">
          <h3 className="font-mono text-sm font-extrabold tracking-widest text-[#8b2626] uppercase">
            ADD SONG
          </h3>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Song Link / Audio Upload */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Song link (Spotify, Apple Music, Audio File...)
            </label>
            <input
              type="text"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://open.spotify.com/track/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#8b2626] placeholder:text-slate-400 shadow-xs"
            />
          </div>

          {/* Song Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Title
            </label>
            <input
              type="text"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              placeholder="song title (optional)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#8b2626] placeholder:text-slate-400 shadow-xs"
            />
          </div>

          {/* Artist */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Artist Name
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="artist name (optional)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#8b2626] placeholder:text-slate-400 shadow-xs"
            />
          </div>

          {/* Or File Upload Trigger */}
          <div className="pt-1">
            <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white border border-dashed border-slate-300 hover:border-[#8b2626] cursor-pointer transition-all text-[11px] text-slate-600">
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#8b2626]" />
              ) : (
                <Upload className="h-4 w-4 text-[#8b2626]" />
              )}
              <span>{audioUrl ? 'Audio selected' : 'Upload MP3 / Audio file'}</span>
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </label>
            {uploadError && <p className="text-[10px] text-rose-600 mt-1">{uploadError}</p>}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-3">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#f5ede4] border border-[#8b2626]/40 text-[#8b2626] font-mono text-xs font-bold shadow-xs hover:bg-[#ede2d7] transition-all cursor-pointer text-center"
          >
            Add to package
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-slate-700 font-mono text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer text-center"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};
