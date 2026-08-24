import React from 'react';
import { useWizard } from '../../../context/WizardContext';
import { Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

export const TypographyControls: React.FC = () => {
  const { data, setCustomization } = useWizard();

  const fonts = [
    { label: 'Playfair Display (Serif)', value: "'Playfair Display', Georgia, serif" },
    { label: 'Plus Jakarta Sans (Sans)', value: "'Plus Jakarta Sans', sans-serif" },
    { label: 'Inter (Modern Sans)', value: "'Inter', sans-serif" },
    { label: 'Cormorant (Antique Serif)', value: "'Cormorant Garamond', serif" },
    { label: 'Dancing Script (Handwritten)', value: "'Dancing Script', cursive" },
  ];

  const fontSizes = [
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
  ];

  return (
    <div className="space-y-5">
      {/* Font Family Selection */}
      <div>
        <label htmlFor="fontFamilySelect" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Font Family
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Type className="h-4 w-4" />
          </div>
          <select
            id="fontFamilySelect"
            value={data.fontFamily}
            onChange={(e) => setCustomization({ fontFamily: e.target.value })}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
          >
            {fonts.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Font Size Selector */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Font Size
        </label>
        <div className="grid grid-cols-3 gap-2">
          {fontSizes.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => setCustomization({ fontSize: size.value as any })}
              className={`p-3 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                data.fontSize === size.value
                  ? 'bg-pink-500/20 border-pink-500 text-pink-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text Alignment */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Alignment
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setCustomization({ textAlign: 'left' })}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all duration-200 ${
              data.textAlign === 'left'
                ? 'bg-pink-500/20 border-pink-500 text-pink-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlignLeft className="h-4 w-4" />
            <span>Left</span>
          </button>

          <button
            type="button"
            onClick={() => setCustomization({ textAlign: 'center' })}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all duration-200 ${
              data.textAlign === 'center'
                ? 'bg-pink-500/20 border-pink-500 text-pink-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlignCenter className="h-4 w-4" />
            <span>Center</span>
          </button>

          <button
            type="button"
            onClick={() => setCustomization({ textAlign: 'right' })}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all duration-200 ${
              data.textAlign === 'right'
                ? 'bg-pink-500/20 border-pink-500 text-pink-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlignRight className="h-4 w-4" />
            <span>Right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
