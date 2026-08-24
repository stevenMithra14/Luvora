import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';

interface BoxItem {
  boxNumber: number;
  title: string;
  rewardMessage: string;
}

interface MysteryBoxProps {
  config: {
    title?: string;
    boxes?: BoxItem[];
  };
}

export const MysteryBoxPlayable: React.FC<MysteryBoxProps> = ({ config }) => {
  const boxes = config.boxes || [
    { boxNumber: 1, title: 'Mystery Gift #1', rewardMessage: 'You unlocked a free lunch date on me! 🍕' },
    { boxNumber: 2, title: 'Mystery Gift #2', rewardMessage: 'You unlocked an extra big warm hug! ❤️' },
    { boxNumber: 3, title: 'Mystery Gift #3', rewardMessage: 'You unlocked full control of the TV remote for a week! 📺' }
  ];

  const [selectedBox, setSelectedBox] = useState<BoxItem | null>(null);

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-950 border border-amber-500/30 shadow-2xl text-center space-y-6">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
          <Gift className="h-3.5 w-3.5 text-amber-400" />
          Mystery Box Surprise
        </span>
        <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
          {config?.title || 'Choose a Mystery Box'}
        </h3>
        <p className="text-xs text-slate-400">
          Pick a gift box to reveal your hidden surprise reward!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {boxes.map((box) => {
          const isChosen = selectedBox?.boxNumber === box.boxNumber;

          return (
            <motion.button
              key={box.boxNumber}
              type="button"
              onClick={() => setSelectedBox(box)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-6 rounded-2xl border text-center flex flex-col items-center justify-between min-h-[160px] cursor-pointer transition-all ${
                isChosen
                  ? 'bg-amber-950/80 border-amber-500 ring-2 ring-amber-500/30 shadow-xl'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white transition-all ${
                isChosen ? 'bg-amber-500 shadow-lg shadow-amber-500/30' : 'bg-slate-800 text-amber-400'
              }`}>
                <Gift className="h-7 w-7" />
              </div>

              <span className="font-heading text-sm font-bold text-white mt-2">
                Box #{box.boxNumber}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedBox && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="p-5 rounded-2xl bg-amber-950/90 border border-amber-500/40 text-amber-200 space-y-2 shadow-2xl"
          >
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400">
              <Sparkles className="h-4 w-4" />
              <span>Box #{selectedBox.boxNumber} Unlocked!</span>
            </div>
            <h4 className="font-heading text-lg font-bold text-white leading-relaxed">
              "{selectedBox.rewardMessage}"
            </h4>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
