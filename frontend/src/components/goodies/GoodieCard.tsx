import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { GoodieDefinition } from './goodieCatalog';

interface GoodieCardProps {
  goodie: GoodieDefinition;
  isAdded: boolean;
  count?: number;
  onAdd: (goodie: GoodieDefinition) => void;
}

export const GoodieCard: React.FC<GoodieCardProps> = ({ goodie, isAdded, count = 0, onAdd }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const shortName = goodie.name
    .replace('Personal ', '')
    .replace(' Memory', '')
    .replace(' Message', '')
    .replace(' Clip', '')
    .replace('Hand ', '')
    .replace('Hidden ', '');

  const displayTitle = shortName === 'Surprise' ? 'Gift' : shortName;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={() => onAdd(goodie)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="p-2.5 sm:p-4 rounded-2xl bg-white border border-slate-300 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-center justify-between text-center relative font-mono cursor-pointer select-none group h-full min-h-[175px] sm:min-h-[220px]"
    >
      {/* Visual Image Container with Red Marker Circle Overlay */}
      <div className="relative h-16 sm:h-24 w-full flex items-center justify-center p-1 sm:p-2 mb-1 sm:mb-2">
        {/* RED HAND-DRAWN MARKER CIRCLE OVERLAY ON CURSOR HOVER ONLY */}
        {isHovered && (
          <motion.svg
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: isHovered ? 1 : 0.7 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="absolute inset-0 w-full h-full pointer-events-none z-20 text-rose-700 overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="none"
          >
            {/* Double Loop Red Ink Marker Ellipse */}
            <path
              d="M 12 50 C 10 20, 45 6, 85 15 C 98 35, 95 75, 80 90 C 50 98, 12 92, 8 60 C 5 25, 48 8, 88 12 C 96 32, 92 78, 76 88"
              stroke="#b91c1c"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="filter drop-shadow-xs"
            />
          </motion.svg>
        )}

        {/* Goodie Image */}
        {goodie.imageUrl ? (
          <img
            src={goodie.imageUrl}
            alt={goodie.name}
            className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform"
          />
        ) : (
          <span className="text-2xl sm:text-4xl">{goodie.icon}</span>
        )}

        {/* Count Badge */}
        {count > 1 && (
          <span className="absolute top-0 right-0 bg-rose-600 text-white font-mono font-bold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full shadow-md z-30">
            x{count}
          </span>
        )}
      </div>

      {/* Item Title */}
      <div className="space-y-0.5 w-full">
        <h4 className="font-mono text-[11px] sm:text-xs font-bold text-slate-900 tracking-tight leading-tight">
          + {displayTitle}
        </h4>
        <p className="text-[9px] sm:text-[10px] text-slate-500 font-sans line-clamp-2 leading-tight">
          {goodie.description}
        </p>
      </div>

      {/* Action Button */}
      <div className="pt-2 sm:pt-3 w-full mt-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(goodie);
          }}
          aria-label={`Tuck ${displayTitle}`}
          className={`w-full min-h-[34px] sm:min-h-[38px] py-1 sm:py-1.5 px-1.5 sm:px-3 rounded-xl text-[10px] sm:text-[11px] font-bold font-mono transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer focus:ring-2 focus:ring-rose-500 focus:outline-none ${
            isAdded
              ? 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
              : 'bg-slate-900 text-white hover:bg-black shadow-sm'
          }`}
        >
          <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" />
          <span>{count > 0 ? `Tuck (${count})` : '+ Tuck Inside'}</span>
        </button>
      </div>
    </motion.div>
  );
};
