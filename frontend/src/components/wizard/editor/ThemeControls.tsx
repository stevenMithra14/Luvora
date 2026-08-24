import React from 'react';
import { useWizard } from '../../../context/WizardContext';
import { LUVORA_THEMES } from '../../../utils/themeSystem';
import { Check } from 'lucide-react';

export const ThemeControls: React.FC = () => {
  const { data, setCustomization } = useWizard();

  const themesList = Object.values(LUVORA_THEMES);

  const handleSelectTheme = (themeId: string, fontHeading: string, animationType: 'fade' | 'floating' | 'slide' | 'soft-reveal') => {
    setCustomization({
      themeId: themeId,
      fontFamily: fontHeading,
      animationStyle: animationType,
      backgroundType: 'gradient',
      customBgValue: '' // Reset custom override so selected theme's background immediately applies
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
        Select a Visual Theme Preset
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {themesList.map((theme) => {
          const isSelected = data.themeId === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleSelectTheme(theme.id, theme.fontHeading, theme.animationType)}
              className={`group relative flex flex-col justify-between text-left p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-slate-900 border-pink-500 shadow-lg shadow-pink-500/20 ring-2 ring-pink-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              {/* Theme Gradient Thumbnail */}
              <div className={`h-16 w-full rounded-xl bg-gradient-to-r ${theme.previewGradient} mb-3 flex items-center justify-end p-2.5 shadow-inner`}>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                    isSelected ? 'bg-white text-slate-950 shadow-md' : 'bg-slate-950/40 text-transparent'
                  }`}
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              </div>

              <div>
                <h4 className="font-heading text-sm font-bold text-white mb-1 group-hover:text-pink-200">
                  {theme.name}
                </h4>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {theme.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
