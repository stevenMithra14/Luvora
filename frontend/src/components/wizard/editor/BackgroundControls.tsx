import React from 'react';
import { useWizard } from '../../../context/WizardContext';
import { Palette, Image as ImageIcon, Sparkles } from 'lucide-react';

export const BackgroundControls: React.FC = () => {
  const { data, setCustomization } = useWizard();

  const bgTypes = [
    { id: 'gradient', label: 'Gradient' },
    { id: 'solid', label: 'Solid Color' },
    { id: 'image', label: 'Custom Image' },
  ];

  const gradientPresets = [
    { id: 'grad-pink', label: 'Rose Blush', value: 'bg-gradient-to-br from-slate-950 via-rose-950/40 to-slate-950' },
    { id: 'grad-indigo', label: 'Cosmic Star', value: 'bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-950' },
    { id: 'grad-amber', label: 'Golden Dusk', value: 'bg-gradient-to-br from-slate-950 via-amber-950/40 to-slate-950' },
    { id: 'grad-purple', label: 'Velvet Dream', value: 'bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950' },
  ];

  const solidPresets = [
    { id: 'solid-obsidian', label: 'Obsidian Black', value: 'bg-slate-950' },
    { id: 'solid-rose', label: 'Deep Crimson', value: 'bg-rose-950' },
    { id: 'solid-navy', label: 'Midnight Blue', value: 'bg-indigo-950' },
    { id: 'solid-amber', label: 'Warm Espresso', value: 'bg-amber-950' },
  ];

  return (
    <div className="space-y-5">
      {/* Background Type Mode Selector */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Background Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {bgTypes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setCustomization({ backgroundType: mode.id as any })}
              className={`p-3 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                data.backgroundType === mode.id
                  ? 'bg-pink-500/20 border-pink-500 text-pink-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Gradients */}
      {data.backgroundType === 'gradient' && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Gradient Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            {gradientPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setCustomization({ customBgValue: preset.value })}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all duration-200 flex items-center gap-2 ${
                  data.customBgValue === preset.value || (!data.customBgValue && preset.id === 'grad-pink')
                    ? 'bg-pink-500/20 border-pink-500 text-pink-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preset Solids */}
      {data.backgroundType === 'solid' && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Solid Color Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            {solidPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setCustomization({ customBgValue: preset.value })}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all duration-200 flex items-center gap-2 ${
                  data.customBgValue === preset.value
                    ? 'bg-pink-500/20 border-pink-500 text-pink-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Palette className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image URL Input */}
      {data.backgroundType === 'image' && (
        <div>
          <label htmlFor="bgImageUrl" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Background Image URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <ImageIcon className="h-4 w-4" />
            </div>
            <input
              id="bgImageUrl"
              type="text"
              value={data.customBgValue}
              onChange={(e) => setCustomization({ customBgValue: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};
