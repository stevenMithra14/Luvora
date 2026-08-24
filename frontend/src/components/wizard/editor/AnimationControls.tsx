import React from 'react';
import { useWizard } from '../../../context/WizardContext';
import { Sparkles, Move, Eye, Flame } from 'lucide-react';

export const AnimationControls: React.FC = () => {
  const { data, setCustomization } = useWizard();

  const animations = [
    {
      id: 'fade',
      name: 'Smooth Fade',
      description: 'Elegant subtle fade in for text and memories.',
      icon: <Eye className="h-4 w-4 text-emerald-400" />,
    },
    {
      id: 'floating',
      name: 'Floating Hearts / Particles',
      description: 'Dreamy ambient floating rhythm.',
      icon: <Sparkles className="h-4 w-4 text-pink-400" />,
    },
    {
      id: 'slide',
      name: 'Slide & Rise',
      description: 'Dynamic upward sliding transition.',
      icon: <Move className="h-4 w-4 text-amber-400" />,
    },
    {
      id: 'soft-reveal',
      name: 'Soft Reveal',
      description: 'Luxury gradual blur-to-sharp reveal.',
      icon: <Flame className="h-4 w-4 text-purple-400" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
        Select Entrance & Idle Animation Style
      </div>

      <div className="space-y-2">
        {animations.map((anim) => (
          <button
            key={anim.id}
            type="button"
            onClick={() => setCustomization({ animationStyle: anim.id as any })}
            className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition-all duration-200 ${
              data.animationStyle === anim.id
                ? 'bg-pink-500/20 border-pink-500 text-pink-200 shadow-md shadow-pink-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
              {anim.icon}
            </div>
            <div>
              <div className="text-xs font-bold text-white mb-0.5">{anim.name}</div>
              <div className="text-[11px] text-slate-400">{anim.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
