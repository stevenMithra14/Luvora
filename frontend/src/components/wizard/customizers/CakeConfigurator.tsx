import React from 'react';
import { PartyPopper, Sparkles, Palette, Flame, Layers } from 'lucide-react';
import { useWizard, CakeConfig } from '../../../context/WizardContext';

export const CakeConfigurator: React.FC = () => {
  const { data, setCakeConfig } = useWizard();
  const config = data.cakeConfig;

  const presets: { id: CakeConfig['preset']; label: string; frostingColor: string; candleColor: string }[] = [
    { id: 'classic_birthday', label: 'Classic Pink', frostingColor: '#f472b6', candleColor: '#fbbf24' },
    { id: 'chocolate', label: 'Rich Chocolate', frostingColor: '#78350f', candleColor: '#f59e0b' },
    { id: 'strawberry', label: 'Strawberry Delight', frostingColor: '#fb7185', candleColor: '#ffffff' },
    { id: 'elegant', label: 'Elegant Purple', frostingColor: '#c084fc', candleColor: '#f43f5e' },
    { id: 'luxury', label: 'Golden Luxury', frostingColor: '#d97706', candleColor: '#fef08a' },
    { id: 'cute', label: 'Cute Mint', frostingColor: '#34d399', candleColor: '#ec4899' },
    { id: 'rainbow', label: 'Rainbow Fun', frostingColor: '#38bdf8', candleColor: '#f43f5e' },
  ];

  const handleSelectPreset = (p: typeof presets[0]) => {
    setCakeConfig({
      preset: p.id,
      frostingColor: p.frostingColor,
      candleColor: p.candleColor,
    });
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <PartyPopper className="h-4 w-4" />
          Birthday Cake Customization
        </span>
        <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono font-bold">
          Stage 2 & 3 Reveal
        </span>
      </div>

      {/* 1. Cake Preset Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Cake Flavor & Theme Presets</span>
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
                    ? 'bg-amber-500/15 border-amber-500 text-white ring-2 ring-amber-500/30 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div
                  className="h-5 w-5 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: p.frostingColor }}
                />
                <span className="text-xs font-bold truncate">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Color & Candle Count Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Palette className="h-3 w-3" />
            <span>Frosting Color</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.frostingColor}
              onChange={(e) => setCakeConfig({ frostingColor: e.target.value })}
              className="h-8 w-10 rounded bg-slate-950 border border-slate-800 cursor-pointer"
            />
            <input
              type="text"
              value={config.frostingColor}
              onChange={(e) => setCakeConfig({ frostingColor: e.target.value })}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Palette className="h-3 w-3" />
            <span>Candle Color</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.candleColor}
              onChange={(e) => setCakeConfig({ candleColor: e.target.value })}
              className="h-8 w-10 rounded bg-slate-950 border border-slate-800 cursor-pointer"
            />
            <input
              type="text"
              value={config.candleColor}
              onChange={(e) => setCakeConfig({ candleColor: e.target.value })}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Flame className="h-3 w-3 text-amber-400" />
            <span>Candle Count</span>
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={config.candleCount}
            onChange={(e) => setCakeConfig({ candleCount: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
          />
        </div>
      </div>

      {/* 3. Cake Style & Toppings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Layers className="h-3 w-3" />
            <span>Cake Tier Structure</span>
          </label>
          <select
            value={config.cakeStyle}
            onChange={(e) => setCakeConfig({ cakeStyle: e.target.value as any })}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
          >
            <option value="double_tier">Double Tier Deluxe</option>
            <option value="single_tier">Single Tier Classic</option>
            <option value="heart">Heart Shaped Cake</option>
            <option value="cupcake_stack">Cupcake Tower Stack</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>Decorations & Toppings</span>
          </label>
          <select
            value={config.toppings}
            onChange={(e) => setCakeConfig({ toppings: e.target.value as any })}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
          >
            <option value="sprinkles">Rainbow Sprinkles</option>
            <option value="berries">Fresh Strawberry Topping</option>
            <option value="sparklers">Sparkler Candles</option>
            <option value="candles_only">Candles Only</option>
          </select>
        </div>
      </div>

      {/* 4. Cake Message */}
      <div className="space-y-1 pt-1">
        <label className="text-xs font-bold text-slate-300">
          Message Written on Cake
        </label>
        <input
          type="text"
          value={config.cakeMessage}
          onChange={(e) => setCakeConfig({ cakeMessage: e.target.value })}
          placeholder="Text displayed on cake top..."
          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>
    </div>
  );
};
