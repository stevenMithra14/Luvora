import React from 'react';
import { Gift, Sparkles, Palette, Layers, Heart } from 'lucide-react';
import { useWizard, GiftBoxConfig } from '../../../context/WizardContext';

export const GiftBoxConfigurator: React.FC = () => {
  const { data, setGiftBoxConfig } = useWizard();
  const config = data.giftBoxConfig;

  const presets: { id: GiftBoxConfig['preset']; label: string; boxColor: string; ribbonColor: string; pattern: GiftBoxConfig['pattern'] }[] = [
    { id: 'birthday', label: 'Birthday', boxColor: '#ec4899', ribbonColor: '#f43f5e', pattern: 'stars' },
    { id: 'romantic', label: 'Romantic', boxColor: '#e11d48', ribbonColor: '#f472b6', pattern: 'hearts' },
    { id: 'luxury', label: 'Luxury Gold', boxColor: '#d97706', ribbonColor: '#fbbf24', pattern: 'stripes' },
    { id: 'cute', label: 'Cute Pastel', boxColor: '#c084fc', ribbonColor: '#f472b6', pattern: 'dots' },
    { id: 'classic', label: 'Classic Red', boxColor: '#dc2626', ribbonColor: '#ffffff', pattern: 'none' },
    { id: 'minimal', label: 'Minimal Black', boxColor: '#1e293b', ribbonColor: '#ec4899', pattern: 'none' },
    { id: 'surprise', label: 'Surprise Purple', boxColor: '#9333ea', ribbonColor: '#38bdf8', pattern: 'stars' },
  ];

  const handleSelectPreset = (presetObj: typeof presets[0]) => {
    setGiftBoxConfig({
      preset: presetObj.id,
      boxColor: presetObj.boxColor,
      ribbonColor: presetObj.ribbonColor,
      pattern: presetObj.pattern,
    });
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-2">
          <Gift className="h-4 w-4" />
          Gift Box Customization
        </span>
        <span className="text-[10px] text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20 font-mono font-bold">
          Stage 1 Reveal
        </span>
      </div>

      {/* 1. Preset Style Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-pink-400" />
          <span>Gift Box Style Presets</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presets.map((p) => {
            const isSelected = config.preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-pink-500/15 border-pink-500 text-white ring-2 ring-pink-500/30 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div
                  className="h-5 w-5 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: p.boxColor }}
                />
                <span className="text-xs font-bold truncate">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Color Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Palette className="h-3 w-3" />
            <span>Box Color</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.boxColor}
              onChange={(e) => setGiftBoxConfig({ boxColor: e.target.value })}
              className="h-8 w-10 rounded bg-slate-950 border border-slate-800 cursor-pointer"
            />
            <input
              type="text"
              value={config.boxColor}
              onChange={(e) => setGiftBoxConfig({ boxColor: e.target.value })}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Palette className="h-3 w-3" />
            <span>Ribbon Color</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.ribbonColor}
              onChange={(e) => setGiftBoxConfig({ ribbonColor: e.target.value })}
              className="h-8 w-10 rounded bg-slate-950 border border-slate-800 cursor-pointer"
            />
            <input
              type="text"
              value={config.ribbonColor}
              onChange={(e) => setGiftBoxConfig({ ribbonColor: e.target.value })}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. Pattern & Ribbon Style Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Layers className="h-3 w-3" />
            <span>Box Pattern</span>
          </label>
          <select
            value={config.pattern}
            onChange={(e) => setGiftBoxConfig({ pattern: e.target.value as any })}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
          >
            <option value="none">Solid Color (None)</option>
            <option value="stars">Magical Stars</option>
            <option value="dots">Cute Polka Dots</option>
            <option value="hearts">Romantic Hearts</option>
            <option value="stripes">Luxury Diagonal Stripes</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Heart className="h-3 w-3" />
            <span>Ribbon Style</span>
          </label>
          <select
            value={config.ribbonStyle}
            onChange={(e) => setGiftBoxConfig({ ribbonStyle: e.target.value as any })}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
          >
            <option value="satin">Smooth Satin Ribbon</option>
            <option value="glowing">Glowing Neon Ribbon</option>
            <option value="classic">Classic Matte Ribbon</option>
            <option value="dotted">Dotted Ribbon</option>
          </select>
        </div>
      </div>

      {/* 4. Opening Header Message */}
      <div className="space-y-1 pt-1">
        <label className="text-xs font-bold text-slate-300">
          Unboxing Header Message
        </label>
        <input
          type="text"
          value={config.openingMessage}
          onChange={(e) => setGiftBoxConfig({ openingMessage: e.target.value })}
          placeholder="Short unboxing text shown before opening..."
          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
        />
      </div>
    </div>
  );
};
