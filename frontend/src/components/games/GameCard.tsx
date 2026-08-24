import React from 'react';
import { GameDefinition } from '../../utils/gameCatalog';
import { Plus, Check, Sparkles } from 'lucide-react';

interface GameCardProps {
  game: GameDefinition;
  isRecommended?: boolean;
  isAdded?: boolean;
  onAdd: (game: GameDefinition) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isRecommended = false,
  isAdded = false,
  onAdd,
}) => {
  const IconComp = game.icon;

  return (
    <div
      className={`group relative flex flex-col justify-between p-5 rounded-3xl border transition-all duration-300 ${
        isAdded
          ? 'bg-slate-900/90 border-pink-500/50 shadow-lg shadow-pink-500/10'
          : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-md'
      }`}
    >
      <div>
        {/* Header Icon & Badges */}
        <div className="flex items-center justify-between mb-3">
          <div
            className={`h-11 w-11 rounded-2xl flex items-center justify-center text-white bg-gradient-to-tr ${game.color} shadow-md group-hover:scale-105 transition-transform`}
          >
            <IconComp className="h-5 w-5" />
          </div>

          {isRecommended && (
            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-pink-400" />
              Recommended
            </span>
          )}
        </div>

        <h4 className="font-heading text-base font-bold text-white mb-1 group-hover:text-pink-300 transition-colors">
          {game.name}
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {game.description}
        </p>
      </div>

      {/* Add / Added Button */}
      <button
        type="button"
        onClick={() => onAdd(game)}
        disabled={isAdded}
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
          isAdded
            ? 'bg-pink-500/10 text-pink-300 border border-pink-500/30 cursor-default'
            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 active:scale-95'
        }`}
      >
        {isAdded ? (
          <>
            <Check className="h-3.5 w-3.5 text-pink-400 stroke-[3]" />
            <span>Added ✓</span>
          </>
        ) : (
          <>
            <Plus className="h-3.5 w-3.5 text-pink-400" />
            <span>Add Game</span>
          </>
        )}
      </button>
    </div>
  );
};
