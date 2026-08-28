import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizard } from '../../../context/WizardContext';
import { getThemeConfig } from '../../../utils/themeSystem';
import { GameRenderer } from '../../games/GameRenderer';
import { FinalMessage } from '../../interactive/FinalMessage';
import { GiftBoxUnboxing } from '../../interactive/GiftBoxUnboxing';
import { CakeStage } from '../../interactive/CakeStage';
import { MemoriesExperience } from '../../interactive/MemoriesExperience';
import { GoodiesExperience } from '../../goodies/recipient/GoodiesExperience';
import { FloatingCassettePlayer } from '../../interactive/FloatingCassettePlayer';
import { Heart, Sparkles } from 'lucide-react';

export const RecipientGiftView: React.FC = () => {
  const { data } = useWizard();
  const theme = getThemeConfig(data.themeId);
  const [activeStage, setActiveStage] = useState<'box' | 'cake' | 'intro' | 'games' | 'goodies' | 'memories' | 'final'>('box');

  const displayName = data.recipientName.trim() || 'Someone Special';

  const finalModule = data.interactives.find((i) => i.interactiveType === 'final_message');
  const gamesAndSurprises = data.interactives.filter(
    (i) =>
      i.interactiveType !== 'final_message' &&
      i.interactiveType !== 'slideshow' &&
      i.interactiveType !== 'photo_memories' &&
      i.interactiveType !== 'spotify_music' &&
      i.interactiveType !== 'cake_box_config'
  );

  const messageLines = (data.message || '').split('\n').filter((l) => l.trim().length > 0);
  const hasGoodies = (data.goodies || []).some((g) => g.isEnabled !== false);

  const handleGamesContinue = () => {
    if (hasGoodies) {
      setActiveStage('goodies');
    } else {
      setActiveStage('memories');
    }
  };

  return (
    <div
      className={`w-full min-h-full py-2 px-1.5 flex flex-col justify-between transition-colors duration-500 ${theme.background} text-white relative overflow-x-hidden`}
    >
      {/* Mini Cassette & Vinyl Music Player with Album Cover Artwork */}
      {activeStage !== 'box' && (
        <FloatingCassettePlayer
          tracks={data.musicTracks}
          singleMusicUrl={data.musicUrl}
          spotifyTrack={data.spotifyTrack}
          autoStart={true}
        />
      )}

      <AnimatePresence mode="wait">
        {/* STAGE 1: GIFT BOX UNBOXING PREVIEW */}
        {activeStage === 'box' && (
          <motion.div
            key="box"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <GiftBoxUnboxing
              config={data.giftBoxConfig}
              recipientName={displayName}
              password={data.password}
              passwordHint={data.passwordHint}
              onOpenComplete={() => setActiveStage('cake')}
            />
          </motion.div>
        )}

        {/* STAGE 2 & 3: BIRTHDAY CAKE & CANDLES PREVIEW */}
        {activeStage === 'cake' && (
          <motion.div
            key="cake"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <CakeStage
              config={data.cakeConfig}
              recipientName={displayName}
              onCakeComplete={() => setActiveStage('intro')}
            />
          </motion.div>
        )}

        {/* STAGE 4: PERSONALIZED INTRO GREETING PREVIEW */}
        {activeStage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto space-y-6"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-xl">
              <Heart className="h-7 w-7 fill-white/20 animate-pulse" />
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
              <Sparkles className="h-3.5 w-3.5 text-pink-400 shrink-0" />
              Today Is All About You
            </span>

            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-white leading-tight break-words">
              Happy {data.occasion || 'Special Day'}, {displayName} ❤️
            </h1>

            <button
              type="button"
              onClick={() => setActiveStage('games')}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-xs font-extrabold text-white shadow-xl hover:scale-105 transition-all cursor-pointer"
            >
              EXPLORE GAMES & SURPRISES
            </button>
          </motion.div>
        )}

        {/* STAGE 5: CUSTOM GAMES PREVIEW */}
        {activeStage === 'games' && (
          <motion.div
            key="games"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto px-2 sm:px-6 py-6 space-y-8"
          >
            {/* Main Message Card */}
            <div className={`p-6 sm:p-10 rounded-3xl backdrop-blur-2xl border ${theme.cardBg} shadow-2xl text-center space-y-4`}>
              <h2 className="font-heading text-xl sm:text-3xl font-bold text-white mb-3">
                {data.title || 'A Message From My Heart'}
              </h2>

              <div className="space-y-3">
                {messageLines.map((line, idx) => (
                  <p key={idx} style={{ color: theme.textColor }} className="text-sm sm:text-lg leading-relaxed font-serif italic break-words">
                    "{line}"
                  </p>
                ))}
              </div>
            </div>

            {/* Render Selected Interactive Games & Surprises */}
            {gamesAndSurprises.map((item, idx) => (
              <div key={item.id || idx}>
                <GameRenderer
                  interactiveType={item.interactiveType}
                  configJson={item.configurationJson || {}}
                  photos={data.photos}
                  recipientName={displayName}
                  recipientDate={data.recipientDate}
                />
              </div>
            ))}

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={handleGamesContinue}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-xs font-extrabold text-white shadow-xl hover:scale-105 transition-all cursor-pointer"
              >
                {hasGoodies ? 'CONTINUE TO DIGITAL GOODIES 🎁' : 'CONTINUE TO MEMORIES ALBUM ✨'}
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE 6: DIGITAL GOODIES EXPERIENCE */}
        {activeStage === 'goodies' && (
          <motion.div
            key="goodies"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-6"
          >
            <GoodiesExperience
              goodies={data.goodies}
              recipientName={displayName}
              onGoodiesComplete={() => setActiveStage('memories')}
            />
          </motion.div>
        )}

        {/* STAGE 7: MEMORIES EXPERIENCE PREVIEW */}
        {activeStage === 'memories' && (
          <motion.div
            key="memories"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-6"
          >
            <MemoriesExperience
              memories={data.memories}
              config={data.memoryConfig}
              photosFallback={data.photos}
              recipientName={displayName}
              onMemoriesComplete={() => setActiveStage('final')}
            />
          </motion.div>
        )}

        {/* STAGE 8: FINAL MESSAGE PREVIEW */}
        {activeStage === 'final' && (
          <motion.div
            key="final"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto px-2 sm:px-6 py-6"
          >
            {finalModule ? (
              <FinalMessage
                finalText={finalModule.configurationJson?.message}
                senderName={`Made with love for ${displayName} ❤️`}
              />
            ) : (
              <div className="text-center py-8 border-t border-white/10 text-xs text-slate-400">
                Created on Luvora &bull; 100% Free Digital Experiences
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

