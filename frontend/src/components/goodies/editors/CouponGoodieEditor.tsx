import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { WizardGoodie } from '../../../context/WizardContext';

interface CouponGoodieEditorProps {
  goodie: WizardGoodie;
  onSave: (id: string, updated: Partial<WizardGoodie>) => void;
  onClose: () => void;
}

export const CouponGoodieEditor: React.FC<CouponGoodieEditorProps> = ({ goodie, onSave, onClose }) => {
  const [couponTitle, setCouponTitle] = useState(goodie.configurationJson?.couponTitle || 'ONE FREE MOVIE NIGHT');
  const [description, setDescription] = useState(
    goodie.configurationJson?.description || 'Redeem for: One movie night + snacks + your choice of movie'
  );
  const [redemptionText, setRedemptionText] = useState(
    goodie.configurationJson?.redemptionText || 'Valid: Whenever you want ❤️'
  );
  const [expirationDate, setExpirationDate] = useState(goodie.configurationJson?.expirationDate || 'Never Expires');
  const [background, setBackground] = useState(goodie.configurationJson?.background || 'romantic_blush');
  const [couponStyle, setCouponStyle] = useState(goodie.configurationJson?.couponStyle || 'ticket');

  const handleSave = () => {
    onSave(goodie.id, {
      title: couponTitle,
      description,
      configurationJson: {
        ...goodie.configurationJson,
        couponTitle,
        description,
        redemptionText,
        expirationDate,
        background,
        couponStyle,
      },
    });
    onClose();
  };

  const STYLES = [
    { id: 'ticket', name: 'Classic Ticket', desc: 'Perforated edge coupon stub' },
    { id: 'vip_pass', name: 'VIP Pass', desc: 'Golden badge theme pass' },
    { id: 'golden_ticket', name: 'Golden Ticket', desc: 'Shimmering metallic gold' },
    { id: 'vintage_stub', name: 'Vintage Stub', desc: 'Retro cinema admission ticket' },
  ];

  const BACKGROUNDS = [
    { id: 'romantic_blush', name: 'Romantic Blush', color: 'from-pink-500 to-rose-600' },
    { id: 'golden_vip', name: 'Golden VIP', color: 'from-amber-400 to-yellow-600' },
    { id: 'dark_satin', name: 'Dark Satin', color: 'from-purple-900 to-slate-950' },
    { id: 'neon_pink', name: 'Neon Glow', color: 'from-fuchsia-500 to-purple-600' },
    { id: 'vintage_paper', name: 'Vintage Parchment', color: 'from-amber-800 to-stone-900' },
  ];

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
              🎟️
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">Digital Coupon Goodie</h3>
              <p className="text-xs text-slate-400">Create a sweet, personalized redeemable gift voucher</p>
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
          {/* Coupon Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Coupon Headline
            </label>
            <input
              type="text"
              value={couponTitle}
              onChange={(e) => setCouponTitle(e.target.value)}
              placeholder="e.g. ONE FREE MOVIE NIGHT"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-extrabold focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Redemption Details / What's Included
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. One movie night + snacks + your choice of movie..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Terms & Expiration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Validity Terms
              </label>
              <input
                type="text"
                value={redemptionText}
                onChange={(e) => setRedemptionText(e.target.value)}
                placeholder="e.g. Valid: Whenever you want ❤️"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Expiration Date
              </label>
              <input
                type="text"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                placeholder="e.g. Never Expires"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Style Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Coupon Ticket Style
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCouponStyle(s.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    couponStyle === s.id
                      ? 'bg-pink-500/20 border-pink-500 text-pink-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white mb-0.5">{s.name}</div>
                  <div className="text-[10px] text-slate-400">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Background Gradient */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Background Color
            </label>
            <div className="flex flex-wrap gap-2">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setBackground(bg.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-gradient-to-r ${bg.color} ${
                    background === bg.id ? 'ring-2 ring-white scale-105 shadow-md' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {bg.name}
                </button>
              ))}
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
            <span>Save Coupon Goodie</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
