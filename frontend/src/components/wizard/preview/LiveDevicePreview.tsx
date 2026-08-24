import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Smartphone, Monitor, RotateCcw, Maximize2, X, Sparkles } from 'lucide-react';
import { RecipientGiftView } from './RecipientGiftView';

interface LiveDevicePreviewProps {
  className?: string;
}

export const LiveDevicePreview: React.FC<LiveDevicePreviewProps> = ({ className = '' }) => {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshState = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className={`flex flex-col items-center justify-start w-full ${className}`}>
      {/* 1. Device Preview Toolbar */}
      <div className="w-full flex items-center justify-between p-1.5 px-3 mb-2 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-lg text-xs">
        {/* Mobile / Desktop Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
              deviceMode === 'mobile'
                ? 'bg-pink-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="h-3 w-3" />
            <span>Mobile</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
              deviceMode === 'desktop'
                ? 'bg-pink-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="h-3 w-3" />
            <span>Desktop</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRefreshState}
            className="px-2 py-1 rounded-xl bg-slate-950 border border-slate-800 text-pink-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
            title="Refresh Preview State"
          >
            <RotateCcw className="h-3 w-3 text-pink-400" />
            <span className="hidden sm:inline font-mono">Reset</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="px-2 py-1 rounded-xl bg-slate-950 border border-slate-800 text-pink-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
            title="Fullscreen Preview"
          >
            <Maximize2 className="h-3 w-3 text-pink-400" />
            <span className="hidden sm:inline font-mono">Expand</span>
          </button>
        </div>
      </div>

      {/* 2. Device Frames */}
      {deviceMode === 'mobile' ? (
        /* Mobile Device Frame (Exact 71.8mm x 142.1mm / 2.83" x 5.59" Aspect Ratio) */
        <div className="relative w-[250px] sm:w-[256px] h-[495px] sm:h-[506px] rounded-[36px] p-2 bg-slate-950 border-[5px] border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden">
          {/* Top Notch / Speaker Bar */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 h-3 w-18 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
            <div className="h-0.5 w-4 rounded-full bg-slate-800" />
          </div>

          {/* Phone Screen Canvas Area */}
          <div key={refreshKey} className="w-full h-full rounded-[28px] overflow-y-auto overflow-x-hidden pt-8 pb-3 bg-slate-950 scrollbar-none">
            <RecipientGiftView />
          </div>

          {/* Bottom Home Bar Indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 h-1 w-16 rounded-full bg-slate-700/60" />
        </div>
      ) : (
        /* Desktop Browser Frame */
        <div className="w-full max-w-xl h-[460px] sm:h-[490px] rounded-2xl bg-slate-950 border-4 border-slate-800 shadow-xl overflow-hidden flex flex-col">
          {/* Browser Bar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-rose-500" />
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div className="flex-1 max-w-xs mx-auto px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-center font-mono text-[9px] text-slate-400 truncate">
              https://luvora.app/g/preview
            </div>
          </div>

          {/* Desktop Screen Area */}
          <div key={refreshKey} className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-950">
            <RecipientGiftView />
          </div>
        </div>
      )}

      {/* 3. Fullscreen Overlay Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Sparkles className="h-4 w-4 text-pink-400" />
                <span>Full Interactive Gift Preview</span>
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="h-9 w-9 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Canvas */}
            <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full p-4 sm:p-8">
              <RecipientGiftView />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
