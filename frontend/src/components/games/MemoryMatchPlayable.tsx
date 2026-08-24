import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, RotateCcw } from 'lucide-react';

interface PhotoItem {
  id: string;
  fileUrl: string;
  caption?: string;
}

interface MemoryMatchProps {
  photos?: PhotoItem[];
  config?: { title?: string; description?: string };
}

interface CardTile {
  uid: string;
  photoId: string;
  fileUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryMatchPlayable: React.FC<MemoryMatchProps> = ({ photos = [], config }) => {
  const [cards, setCards] = useState<CardTile[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    initializeCards();
  }, [photos]);

  const initializeCards = () => {
    let sourcePhotos = photos;
    // Fallback demonstration photos if creator hasn't uploaded photos yet
    if (sourcePhotos.length === 0) {
      sourcePhotos = [
        { id: '1', fileUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300' },
        { id: '2', fileUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300' },
        { id: '3', fileUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=300' },
      ];
    }

    // Limit to top 4 photos (8 matching tiles total) for easy playing
    const gamePhotos = sourcePhotos.slice(0, 4);
    const doubled: CardTile[] = [];

    gamePhotos.forEach((photo) => {
      doubled.push({
        uid: `${photo.id}-a`,
        photoId: photo.id,
        fileUrl: photo.fileUrl,
        isFlipped: false,
        isMatched: false,
      });
      doubled.push({
        uid: `${photo.id}-b`,
        photoId: photo.id,
        fileUrl: photo.fileUrl,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffled = doubled.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setIsCompleted(false);
  };

  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    const newFlipped = [...flippedCards, index];
    setCards(newCards);
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;

      if (newCards[firstIdx].photoId === newCards[secondIdx].photoId) {
        // Match!
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setFlippedCards([]);

          if (matchedCards.every((c) => c.isMatched)) {
            setIsCompleted(true);
          }
        }, 500);
      } else {
        // No match - flip back
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 900);
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-950 border border-sky-500/30 shadow-2xl text-center space-y-6">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
          <Sparkles className="h-3.5 w-3.5 text-sky-400" />
          Memory Match Game
        </span>
        <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
          {config?.title || 'Photo Memory Match'}
        </h3>
        <p className="text-xs text-slate-400">
          Flip tiles and pair our favorite memory photos! &bull; Moves: <span className="font-mono text-white font-bold">{moves}</span>
        </p>
      </div>

      {!isCompleted ? (
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 max-w-md mx-auto">
          {cards.map((card, idx) => (
            <motion.button
              key={card.uid}
              type="button"
              onClick={() => handleCardClick(idx)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-20 sm:h-24 w-full rounded-2xl border overflow-hidden cursor-pointer transition-all flex items-center justify-center bg-slate-900 border-slate-800"
            >
              {card.isFlipped || card.isMatched ? (
                <img src={card.fileUrl} alt="Memory" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-600 font-extrabold text-lg">
                  ?
                </div>
              )}
            </motion.button>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-6 space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center mx-auto shadow-xl">
            <Trophy className="h-8 w-8 text-amber-300" />
          </div>
          <h4 className="font-heading text-2xl font-extrabold text-white">
            Matched All Memories in {moves} Moves! 🎉
          </h4>
          <button
            type="button"
            onClick={initializeCards}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 border border-slate-700 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Play Again</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};
