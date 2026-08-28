import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { PublicGiftResponse, verifyGiftPasswordApi, fetchUnlockedGiftApi } from '../../services/giftService';
import { getThemeConfig } from '../../utils/themeSystem';
import { GameRenderer } from '../games/GameRenderer';
import { FinalMessage } from '../interactive/FinalMessage';
import { GiftBoxUnboxing } from '../interactive/GiftBoxUnboxing';
import { CakeStage } from '../interactive/CakeStage';
import { MemoriesExperience } from '../interactive/MemoriesExperience';
import { GoodiesExperience } from '../goodies/recipient/GoodiesExperience';
import { FloatingCassettePlayer } from '../interactive/FloatingCassettePlayer';

interface PublicGiftExperienceProps {
  gift: PublicGiftResponse;
}

export const PublicGiftExperience: React.FC<PublicGiftExperienceProps> = ({ gift: initialGift }) => {
  const [giftData, setGiftData] = useState<PublicGiftResponse>(initialGift);
  // Sequential Stages: box -> cake -> intro -> games -> goodies -> memories -> final
  const [activeStage, setActiveStage] = useState<'box' | 'cake' | 'intro' | 'games' | 'goodies' | 'memories' | 'final'>('box');
  const theme = getThemeConfig(giftData.theme_id);

  const handleVerifyPassword = async (password: string) => {
    const res = await verifyGiftPasswordApi(giftData.public_id, password);
    return res;
  };

  const handleBoxOpenComplete = async (accessToken?: string) => {
    if (accessToken && giftData.is_locked) {
      try {
        const unlockedData = await fetchUnlockedGiftApi(giftData.public_id, accessToken);
        setGiftData(unlockedData);
      } catch (e) {
        console.error("Error fetching unlocked content:", e);
      }
    }
    setActiveStage('cake');
  };

  const handleCakeComplete = () => {
    setActiveStage('intro');
  };

  const formattedPhotos = (giftData.photos || []).map((p) => ({
    id: p.id,
    fileUrl: p.file_url,
    caption: p.caption || '',
  }));

  const formattedGoodies = (giftData.goodies || []).map((g) => ({
    id: g.id,
    goodieType: g.goodie_type as any,
    title: g.title || '',
    description: g.description || '',
    content: g.content,
    mediaUrl: g.media_url || '',
    configurationJson: g.configuration_json || {},
    displayOrder: g.display_order,
    isEnabled: g.is_enabled,
  }));

  const hasGoodies = formattedGoodies.some((g) => g.isEnabled !== false);

  const handleGamesContinue = () => {
    if (hasGoodies) {
      setActiveStage('goodies');
    } else {
      setActiveStage('memories');
    }
  };

  const finalModule = (giftData.interactives || []).find((i) => i.interactive_type === 'final_message');
  const gamesAndSurprises = (giftData.interactives || []).filter((i) => i.interactive_type !== 'final_message' && i.interactive_type !== 'slideshow');

  const messageLines = (giftData.message || '').split('\n').filter((l) => l.trim().length > 0);

  const memoriesModule = (giftData.interactives || []).find((i) => i.interactive_type === 'photo_memories');
  const memoriesFromApi = memoriesModule?.configuration_json?.memories;
  const memoryConfigFromApi = memoriesModule?.configuration_json?.memoryConfig;

  const spotifyModule = (giftData.interactives || []).find((i) => i.interactive_type === 'spotify_music');
  const spotifyTrackFromApi = spotifyModule?.configuration_json?.spotifyTrack;

  const cakeBoxModule = (giftData.interactives || []).find((i) => i.interactive_type === 'cake_box_config');
  const cakeConfigFromApi = cakeBoxModule?.configuration_json?.cakeConfig;
  const giftBoxConfigFromApi = cakeBoxModule?.configuration_json?.giftBoxConfig;

  return (
    <div className={`min-h-screen w-full transition-colors duration-700 selection:bg-pink-500/30 ${theme.background} text-slate-100 font-sans relative overflow-x-hidden max-w-full`}>
      {/* Corner Cassette & Vinyl Music Player with Album Cover Artwork */}
      {activeStage !== 'box' && (
        <FloatingCassettePlayer
          singleMusicUrl={giftData.music_url}
          spotifyTrack={spotifyTrackFromApi}
          autoStart={true}
        />
      )}

      <AnimatePresence mode="wait">
        {/* STAGE 1: GIFT BOX UNBOXING */}
        {activeStage === 'box' && (
          <motion.div
            key="box"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex flex-col items-center justify-center p-4"
          >
            <GiftBoxUnboxing
              config={giftBoxConfigFromApi}
              recipientName={giftData.recipient_name}
              isPasswordProtected={giftData.password_enabled || giftData.is_locked}
              passwordHint={giftData.password_hint}
              onVerifyPassword={handleVerifyPassword}
              onOpenComplete={handleBoxOpenComplete}
            />
          </motion.div>
        )}

        {/* STAGE 2 & 3: BIRTHDAY CAKE & CANDLE BLOW & CAKE CUTTING */}
        {activeStage === 'cake' && (
          <motion.div
            key="cake"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen flex flex-col items-center justify-center p-4"
          >
            <CakeStage
              config={cakeConfigFromApi}
              recipientName={giftData.recipient_name}
              onCakeComplete={handleCakeComplete}
            />
          </motion.div>
        )}

        {/* STAGE 4: PERSONALIZED INTRO GREETING */}
        {activeStage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto space-y-6"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-xl shadow-pink-500/25">
              <Heart className="h-8 w-8 fill-white/20 animate-pulse" />
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
              <Sparkles className="h-3.5 w-3.5 text-pink-400 shrink-0" />
              Today Is All About You
            </span>

            <h1 className="font-heading text-3xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight break-words">
              Happy {giftData.occasion_type || 'Special Day'}, {giftData.recipient_name} ❤️
            </h1>

            <p className="text-base sm:text-xl text-slate-300 font-serif italic">
              "Let's dive into your personalized games, digital goodies, photo & video memories, and heartfelt surprises..."
            </p>

            <button
              type="button"
              onClick={() => setActiveStage('games')}
              className="mt-6 px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-sm font-extrabold text-white shadow-xl shadow-pink-500/30 hover:scale-105 active:scale-95 cursor-pointer transition-all"
            >
              EXPLORE YOUR GAMES & SURPRISES
            </button>
          </motion.div>
        )}

        {/* STAGE 5: CUSTOM GAMES */}
        {activeStage === 'games' && (
          <motion.div
            key="games"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-12"
          >
            {/* Main Message Card */}
            <div className={`p-6 sm:p-14 rounded-3xl backdrop-blur-2xl border ${theme.cardBg} shadow-2xl text-center space-y-6`}>
              <h2 className="font-heading text-xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
                A Message From My Heart
              </h2>

              <div className="space-y-4">
                {messageLines.map((line, idx) => (
                  <p key={idx} style={{ color: theme.textColor }} className="text-base sm:text-2xl leading-relaxed font-serif italic break-words">
                    "{line}"
                  </p>
                ))}
              </div>
            </div>

            {/* Games List */}
            {gamesAndSurprises.map((item, idx) => (
              <div key={item.id || idx}>
                <GameRenderer
                  interactiveType={item.interactive_type}
                  configJson={item.configuration_json || {}}
                  photos={formattedPhotos}
                  recipientName={giftData.recipient_name}
                  recipientDate={giftData.recipient_date}
                />
              </div>
            ))}

            <div className="text-center pt-8">
              <button
                type="button"
                onClick={handleGamesContinue}
                className="px-9 py-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-sm font-extrabold text-white shadow-2xl shadow-pink-500/35 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {hasGoodies ? 'CONTINUE TO DIGITAL GOODIES 🎁' : 'CONTINUE TO MEMORIES ALBUM ✨'}
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE 6: DIGITAL GOODIES */}
        {activeStage === 'goodies' && (
          <motion.div
            key="goodies"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-8 min-h-screen flex flex-col justify-center"
          >
            <GoodiesExperience
              goodies={formattedGoodies}
              recipientName={giftData.recipient_name}
              onGoodiesComplete={() => setActiveStage('memories')}
            />
          </motion.div>
        )}

        {/* STAGE 7: PHOTO & VIDEO MEMORIES ALBUM */}
        {activeStage === 'memories' && (
          <motion.div
            key="memories"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-8 min-h-screen flex flex-col justify-center"
          >
            <MemoriesExperience
              memories={memoriesFromApi}
              config={memoryConfigFromApi}
              photosFallback={formattedPhotos}
              recipientName={giftData.recipient_name}
              onMemoriesComplete={() => setActiveStage('final')}
            />
          </motion.div>
        )}

        {/* STAGE 8: FINAL SPECIAL MESSAGE & SURPRISE */}
        {activeStage === 'final' && (
          <motion.div
            key="final"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto px-4 sm:px-8 py-16 text-center space-y-12"
          >
            {finalModule ? (
              <FinalMessage
                finalText={finalModule.configuration_json?.message}
                senderName={`Made with love for ${giftData.recipient_name} ❤️`}
              />
            ) : (
              <div className="text-center py-12 border-t border-white/10 space-y-4">
                <p className="font-heading text-2xl sm:text-4xl font-bold text-pink-300">
                  Made with love ❤️
                </p>
                <p className="text-xs text-slate-400">
                  Created on Luvora &bull; 100% Free Digital Gift Experiences
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

