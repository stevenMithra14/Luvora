import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Loader2, Camera } from 'lucide-react';
import { WizardGoodie, WizardPhoto } from '../../../context/WizardContext';
import { uploadPhotoApi } from '../../../services/giftService';

interface PhotoGoodieEditorProps {
  goodie: WizardGoodie;
  existingPhotos: WizardPhoto[];
  onSave: (id: string, updated: Partial<WizardGoodie>) => void;
  onClose: () => void;
}

export const PhotoGoodieEditor: React.FC<PhotoGoodieEditorProps> = ({ goodie, onSave, onClose }) => {
  const defaultTitles = ['A Special Photo', 'Photo', 'Personal Photo'];
  const [title, setTitle] = useState(goodie.title && !defaultTitles.includes(goodie.title) ? goodie.title : '');
  const [photoUrl, setPhotoUrl] = useState(goodie.mediaUrl || goodie.configurationJson?.photoUrl || '');
  const [caption, setCaption] = useState(goodie.configurationJson?.caption || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    try {
      const res = await uploadPhotoApi(file, file.name);
      setPhotoUrl(res.url);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (photoUrl.startsWith('blob:')) {
      setUploadError('Temporary browser blob URLs cannot be saved. Please upload the photo file.');
      return;
    }

    const finalTitle = title.trim() || 'A Special Photo';
    onSave(goodie.id, {
      title: finalTitle,
      description: caption || 'Photo memory',
      mediaUrl: photoUrl,
      configurationJson: {
        ...goodie.configurationJson,
        title: finalTitle,
        photoUrl,
        caption,
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
          <h3 className="font-mono text-sm font-extrabold tracking-widest text-[#8b2626] uppercase flex items-center gap-2">
            <Camera className="h-4 w-4 text-[#8b2626]" />
            <span>ADD PHOTO</span>
          </h3>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Photo Link / File Upload */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Photo Image URL or File
            </label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#8b2626] placeholder:text-slate-400 shadow-xs"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A Special Photo"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#8b2626] placeholder:text-slate-400 shadow-xs"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Caption
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. A beautiful moment we shared ❤️"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#8b2626] placeholder:text-slate-400 shadow-xs"
            />
          </div>

          {/* Upload File */}
          <div className="pt-1">
            <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white border border-dashed border-slate-300 hover:border-[#8b2626] cursor-pointer transition-all text-[11px] text-slate-600">
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#8b2626]" />
              ) : (
                <Upload className="h-4 w-4 text-[#8b2626]" />
              )}
              <span>{photoUrl ? 'Photo selected' : 'Upload photo image file'}</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
            {uploadError && <p className="text-[10px] text-rose-600 mt-1">{uploadError}</p>}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#8b2626] text-white font-mono text-xs font-bold shadow-md hover:bg-[#731e1e] active:scale-95 transition-all cursor-pointer text-center"
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
