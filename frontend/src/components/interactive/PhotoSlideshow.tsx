import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { WizardPhoto } from '../../context/WizardContext';

interface PhotoSlideshowProps {
  photos: WizardPhoto[];
  intervalMs?: number;
}

export const PhotoSlideshow: React.FC<PhotoSlideshowProps> = ({
  photos,
  intervalMs = 4000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || photos.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, photos.length, intervalMs]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (photos.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-500 italic">
        Upload photos in Step 4 to activate the automatic Photo Slideshow.
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <ImageIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-white">Memory Slideshow</h3>
            <p className="text-xs text-slate-400">Auto-cycling photo gallery</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5 text-pink-400" /> : <Play className="h-3.5 w-3.5 text-pink-400" />}
          <span>{isPlaying ? 'Pause' : 'Autoplay'}</span>
        </button>
      </div>

      {/* Main Slideshow Frame */}
      <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group shadow-inner">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentPhoto.id}
            src={currentPhoto.fileUrl}
            alt={currentPhoto.caption || 'Memory Photo'}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full w-full object-cover"
          />
        </AnimatePresence>

        {/* Caption Overlay */}
        {currentPhoto.caption && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4">
            <p className="text-xs font-semibold text-slate-100 text-center">
              {currentPhoto.caption}
            </p>
          </div>
        )}

        {/* Previous & Next Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-slate-950/70 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-slate-950/70 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {photos.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {photos.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'w-6 bg-pink-500' : 'w-2 bg-slate-800 hover:bg-slate-700'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
