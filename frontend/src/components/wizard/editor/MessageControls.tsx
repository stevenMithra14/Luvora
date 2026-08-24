import React from 'react';
import { useWizard } from '../../../context/WizardContext';
import { Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

export const MessageControls: React.FC = () => {
  const { data, setCustomization } = useWizard();

  return (
    <div className="space-y-5">
      {/* Main Message Heading */}
      <div>
        <label htmlFor="messageHeading" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Main Heading
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Type className="h-4 w-4" />
          </div>
          <input
            id="messageHeading"
            type="text"
            value={data.title}
            onChange={(e) => setCustomization({ title: e.target.value })}
            placeholder="e.g. Turn Your Feelings Into Memories"
            maxLength={80}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
          />
        </div>
      </div>

      {/* Personalized Message Body */}
      <div>
        <label htmlFor="messageBody" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Personalized Message
        </label>
        <div className="relative">
          <textarea
            id="messageBody"
            rows={5}
            value={data.message}
            onChange={(e) => setCustomization({ message: e.target.value })}
            placeholder="Write your heartfelt message here..."
            className="w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 leading-relaxed resize-none"
          />
        </div>
      </div>

      {/* Text Alignment */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Text Alignment
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
