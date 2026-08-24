import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { WizardGoodie } from '../../../context/WizardContext';

interface PlaceGoodieEditorProps {
  goodie: WizardGoodie;
  onSave: (id: string, updated: Partial<WizardGoodie>) => void;
  onClose: () => void;
}

export const PlaceGoodieEditor: React.FC<PlaceGoodieEditorProps> = ({ goodie, onSave, onClose }) => {
  const [title, setTitle] = useState(goodie.title || 'Our Favorite Spot');
  const [placeName, setPlaceName] = useState(goodie.configurationJson?.placeName || 'Our First Coffee Shop');

  const handleSave = () => {
    onSave(goodie.id, {
      title,
      description: placeName,
      configurationJson: {
        ...goodie.configurationJson,
        title,
        placeName,
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
            ADD PLACE
          </h3>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Place Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Place / Location Name
            </label>
            <input
              type="text"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="e.g. Brooklyn Bridge Park, New York"
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
              placeholder="place title (optional)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#8b2626] placeholder:text-slate-400 shadow-xs"
            />
          </div>

          {/* Google Maps Embed Preview */}
          <div className="rounded-xl overflow-hidden border border-slate-300 bg-slate-950 h-32 relative">
            <iframe
              title="Google Maps Location Tracker"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(placeName || 'New York')}&z=14&output=embed`}
              className="w-full h-full border-0 filter contrast-125 saturate-150"
              loading="lazy"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-2">
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
