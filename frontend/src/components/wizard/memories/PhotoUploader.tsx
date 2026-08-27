import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, Trash2, ArrowUp, ArrowDown, Loader2, AlertCircle } from 'lucide-react';
import { useWizard } from '../../../context/WizardContext';
import { uploadPhotoFile } from '../../../services/uploadService';
import { resolveMediaUrl } from '../../../services/giftService';

export const PhotoUploader: React.FC = () => {
  const { data, setPhotos, setMemories } = useWizard();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFiles = async (filesList: FileList | File[]) => {
    if (!filesList || filesList.length === 0) return;
    setErrorMessage('');
    setIsUploading(true);
    setUploadProgress(15);

    const filesArray = Array.from(filesList);
    let completedCount = 0;

    try {
      const uploadPromises = filesArray.map(async (file, idx) => {
        const res = await uploadPhotoFile(file, (percent) => {
          completedCount = Math.max(completedCount, Math.round(((idx + percent / 100) / filesArray.length) * 100));
          setUploadProgress(completedCount);
        });

        const photoId = 'photo-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 7);
        return {
          photo: {
            id: photoId,
            fileUrl: res.url,
            caption: file.name.split('.')[0] || '',
          },
          memory: {
            id: photoId,
            type: 'photo' as const,
            fileUrl: res.url,
            title: file.name.split('.')[0] || 'Photo Memory',
            caption: '',
            date: '',
            frameStyle: data.memoryConfig?.frameStyle || 'polaroid',
            displayOrder: (data.memories || []).length + idx,
          }
        };
      });

      const results = await Promise.all(uploadPromises);
      const addedPhotos = results.map(r => r.photo);
      const addedMemories = results.map(r => r.memory);

      setPhotos([...data.photos, ...addedPhotos]);
      setMemories([...(data.memories || []), ...addedMemories]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload photo.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleCaptionChange = (id: string, caption: string) => {
    const updated = data.photos.map((p) => (p.id === id ? { ...p, caption } : p));
    setPhotos(updated);
  };

  const handleDelete = (id: string) => {
    const updated = data.photos.filter((p) => p.id !== id);
    setPhotos(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === data.photos.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...data.photos];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);
    setPhotos(updated);
  };

  return (
    <div className="space-y-6">
      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all duration-300 backdrop-blur-xl ${
          isDragging
            ? 'border-pink-500 bg-pink-500/10 scale-[1.01]'
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-rose-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-4 shadow-lg shadow-pink-500/10">
          <UploadCloud className="h-7 w-7" />
        </div>

        <h3 className="font-heading text-lg font-bold text-white mb-1">
          Drag & drop your photos here
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          Upload cherished memories to include in your gift. Supports JPG, PNG, WEBP (up to 10MB each).
        </p>

        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-semibold text-pink-300">
          Browse Files
        </span>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="w-full max-w-xs mt-4">
            <div className="flex items-center justify-between text-xs text-pink-300 mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-pink-400" />
                Uploading...
              </span>
              <span className="font-mono">{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Uploaded Photo Gallery List */}
      {data.photos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-pink-400" />
              Uploaded Photos ({data.photos.length})
            </span>
            <span className="text-[11px] text-slate-500">Drag or reorder photos below</span>
          </div>

          <AnimatePresence>
            {data.photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl"
              >
                {/* Image Thumbnail */}
                <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                  <img
                    src={resolveMediaUrl(photo.fileUrl)}
                    alt={photo.caption || 'Memory Photo'}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Caption Input */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={photo.caption}
                    onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                    placeholder="Add a photo caption..."
                    maxLength={100}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Reorder & Delete Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === data.photos.length - 1}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(photo.id)}
                    className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                    title="Delete Photo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
