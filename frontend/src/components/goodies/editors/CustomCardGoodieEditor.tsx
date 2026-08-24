import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Upload, Loader2 } from 'lucide-react';
import { WizardGoodie } from '../../../context/WizardContext';
import { uploadPhotoApi } from '../../../services/giftService';

interface CustomCardGoodieEditorProps {
  goodie: WizardGoodie;
  onSave: (id: string, updated: Partial<WizardGoodie>) => void;
  onClose: () => void;
}

export const CustomCardGoodieEditor: React.FC<CustomCardGoodieEditorProps> = ({ goodie, onSave, onClose }) => {
  const [title, setTitle] = useState(goodie.title || 'A Little Reminder');
  const [message, setMessage] = useState(
    goodie.configurationJson?.message || goodie.description || 'You are more loved than you realize.'
  );
  const [imageUrl, setImageUrl] = useState(goodie.mediaUrl || goodie.configurationJson?.imageUrl || '');
  const [background, setBackground] = useState(goodie.configurationJson?.background || 'gradient');
  const [font, setFont] = useState(goodie.configurationJson?.font || 'serif');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>(goodie.configurationJson?.alignment || 'center');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadPhotoApi(file);
      setImageUrl(res.url);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    onSave(goodie.id, {
      title,
      description: message.substring(0, 100),
      mediaUrl: imageUrl,
      configurationJson: {
        ...goodie.configurationJson,
        title,
        message,
        imageUrl,
        background,
        font,
        alignment,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 my-8 text-white max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center text-xl border border-pink-500/30">
              📰
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">Custom Card Goodie</h3>
              <p className="text-xs text-slate-400">Design a completely custom greeting card</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Card Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. A Little Reminder"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Card Message
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. You are more loved than you realize..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-pink-500 font-serif leading-relaxed"
            />
          </div>

          {/* Optional Card Image */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Optional Card Image
            </label>
            <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-pink-500/50 cursor-pointer transition-all text-xs text-slate-400">
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-pink-400" />
              ) : (
                <Upload className="h-4 w-4 text-pink-400" />
              )}
              <span>{imageUrl ? 'Change card image' : 'Upload photo for card'}</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            {imageUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-32 flex justify-center items-center">
                <img src={imageUrl} alt="Card" className="max-h-32 object-cover rounded-lg" />
              </div>
            )}
          </div>

          {/* Style Controls */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Background
              </label>
              <select
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-pink-500"
              >
                <option value="gradient">Gradient Glow</option>
                <option value="solid_dark">Solid Dark</option>
                <option value="blush">Blush Pink</option>
                <option value="glass">Glassmorphic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Font
              </label>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-pink-500"
              >
                <option value="serif">Classic Serif</option>
                <option value="sans">Modern Sans</option>
                <option value="handwritten">Cursive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Alignment
              </label>
              <select
                value={alignment}
                onChange={(e) => setAlignment(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-pink-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-lg shadow-pink-500/25 hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="h-4 w-4" />
            <span>Save Custom Card</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
