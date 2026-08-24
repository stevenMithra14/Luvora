import React from 'react';
import { Heart } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Heart className="w-5 h-5 text-white fill-white/20" />
          </div>
          <span className="text-xl font-bold font-heading bg-gradient-to-r from-white via-slate-200 to-pink-300 bg-clip-text text-transparent">
            Luvora
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            100% Free Platform
          </span>
        </div>
      </div>
    </header>
  );
};
