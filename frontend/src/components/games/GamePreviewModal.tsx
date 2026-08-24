import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Sparkles } from 'lucide-react';
import { WizardInteractive } from '../../context/WizardContext';
import { GameRenderer } from './GameRenderer';

interface GamePreviewModalProps {
  interactive: WizardInteractive | null;
  photos?: any[];
  recipientName?: string;
  recipientDate?: string;
  onClose: () => void;
}

export const GamePreviewModal: React.FC<GamePreviewModalProps> = ({
  interactive,
  photos = [],
  recipientName = 'Recipient',
  recipientDate,
  onClose,
}) => {
  if (!interactive) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Play className="h-4 w-4 fill-pink-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Interactive Recipient Preview
                </span>
                <h3 className="font-heading text-base font-bold text-white">
                  Testing {interactive.interactiveType.replace('_', ' ')}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Interactive Play Canvas Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center items-center bg-slate-950">
            <GameRenderer
              interactiveType={interactive.interactiveType}
              configJson={interactive.configurationJson}
              photos={photos}
              recipientName={recipientName}
              recipientDate={recipientDate}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
