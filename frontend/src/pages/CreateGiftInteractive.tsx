import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Gamepad2, MoveUp, MoveDown, Trash2, Settings, Play } from 'lucide-react';
import { useWizard, WizardInteractive } from '../context/WizardContext';
import { WizardProgress } from '../components/wizard/WizardProgress';
import { GAME_CATALOG, getRecommendedGamesForOccasion, GameDefinition } from '../utils/gameCatalog';
import { GameCard } from '../components/games/GameCard';
import { GameConfigurator } from '../components/games/GameConfigurator';
import { CustomGameEditor } from '../components/games/CustomGameEditor';
import { GamePreviewModal } from '../components/games/GamePreviewModal';
import { LiveDevicePreview } from '../components/wizard/preview/LiveDevicePreview';

export const CreateGiftInteractive: React.FC = () => {
  const navigate = useNavigate();
  const { data, setInteractives, nextStep, prevStep } = useWizard();

  const [activeConfigItem, setActiveConfigItem] = useState<WizardInteractive | null>(null);
  const [activeCustomGameItem, setActiveCustomGameItem] = useState<WizardInteractive | null>(null);
  const [activePreviewItem, setActivePreviewItem] = useState<WizardInteractive | null>(null);

  useEffect(() => {
    if (!data.occasion) {
      navigate('/create');
    }
  }, [data.occasion, navigate]);

  const recommendedGames = getRecommendedGamesForOccasion(data.occasion);

  const handleAddGame = (gameDef: GameDefinition) => {
    if (data.interactives.some((i) => i.interactiveType === gameDef.gameType || i.interactiveType === gameDef.id)) {
      return;
    }

    const newGame: WizardInteractive = {
      id: `game-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      interactiveType: gameDef.gameType === 'quiz' ? gameDef.id : gameDef.gameType,
      configurationJson: { ...gameDef.defaultConfig },
    };

    setInteractives([...data.interactives, newGame]);
  };

  const handleRemoveInteractive = (id: string) => {
    setInteractives(data.interactives.filter((i) => i.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...data.interactives];
    const temp = items[index - 1];
    items[index - 1] = items[index];
    items[index] = temp;
    setInteractives(items);
  };

  const handleMoveDown = (index: number) => {
    if (index === data.interactives.length - 1) return;
    const items = [...data.interactives];
    const temp = items[index + 1];
    items[index + 1] = items[index];
    items[index] = temp;
    setInteractives(items);
  };

  const handleEditClick = (item: WizardInteractive) => {
    if (item.interactiveType === 'quiz' || item.interactiveType.includes('quiz') || item.configurationJson?.questions) {
      setActiveCustomGameItem(item);
    } else {
      setActiveConfigItem(item);
    }
  };

  const handleSaveConfig = (id: string, updatedConfig: Record<string, any>) => {
    const updated = data.interactives.map((i) =>
      i.id === id ? { ...i, configurationJson: updatedConfig } : i
    );
    setInteractives(updated);
  };

  const handleContinue = () => {
    nextStep();
    navigate('/create/preview');
  };

  const handleBack = () => {
    prevStep();
    navigate('/create/goodies');
  };

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col justify-between py-2 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center my-auto">
        {/* Progress Stepper */}
        <WizardProgress currentStep={6} />

        {/* 50-50 Split Desktop & Laptop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center flex-1 my-auto w-full">
          {/* LEFT 50%: Game Controls & Selection */}
          <div className="w-full lg:col-span-1 space-y-4 max-h-[calc(100vh-9.5rem)] overflow-y-auto pr-1">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center lg:text-left max-w-2xl"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                Step 6 of 6 &bull; Games & Surprises
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
                Add Interactive Games
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Select category-tailored games, define custom question topics, and personalize surprise experiences.
              </p>
            </motion.div>

            {/* Active Selected Games List */}
            {data.interactives.length > 0 && (
              <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-pink-500/30 backdrop-blur-xl shadow-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4" />
                    Active Selected Games ({data.interactives.length})
                  </span>
                  <span className="text-xs text-slate-400">Rendered live in preview</span>
                </div>

                <div className="space-y-2">
                  {data.interactives.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-lg bg-pink-500/20 text-pink-300 text-xs font-mono font-bold flex items-center justify-center border border-pink-500/30">
                          0{idx + 1}
                        </span>
                        <div>
                          <h4 className="font-heading text-xs font-bold text-white capitalize">
                            {item.interactiveType.replace('_', ' ')}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">
                            {item.configurationJson?.topic ? `Topic: ${item.configurationJson.topic}` : item.configurationJson?.title || 'Interactive Module'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 cursor-pointer"
                          title="Move Up"
                        >
                          <MoveUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === data.interactives.length - 1}
                          className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 cursor-pointer"
                          title="Move Down"
                        >
                          <MoveDown className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setActivePreviewItem(item)}
                          className="px-2.5 py-1 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] font-bold hover:bg-sky-500/20 cursor-pointer flex items-center gap-1"
                        >
                          <Play className="h-3 w-3 fill-sky-300" />
                          <span>Play</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditClick(item)}
                          className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-bold hover:bg-purple-500/20 cursor-pointer flex items-center gap-1"
                        >
                          <Settings className="h-3 w-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveInteractive(item.id)}
                          className="p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                          title="Remove Game"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 1: Recommended Games for Occasion */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-pink-400" />
                <h3 className="font-heading text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Recommended for {data.occasion || 'Special Occasions'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendedGames.map((game) => {
                  const isAdded = data.interactives.some(
                    (i) => i.interactiveType === game.gameType || i.interactiveType === game.id
                  );
                  return (
                    <GameCard
                      key={game.id}
                      game={game}
                      isRecommended={true}
                      isAdded={isAdded}
                      onAdd={handleAddGame}
                    />
                  );
                })}
              </div>
            </div>

            {/* Section 2: Catalog of Games */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h3 className="font-heading text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Full Game Catalog
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GAME_CATALOG.map((game) => {
                  const isAdded = data.interactives.some(
                    (i) => i.interactiveType === game.gameType || i.interactiveType === game.id
                  );
                  return (
                    <GameCard
                      key={game.id}
                      game={game}
                      isRecommended={false}
                      isAdded={isAdded}
                      onAdd={handleAddGame}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT 50%: Live Device Preview */}
          <div className="hidden lg:flex w-full lg:col-span-1 justify-center items-center">
            <LiveDevicePreview />
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="sticky bottom-0 z-40 py-4 px-4 sm:px-10 bg-transparent pointer-events-none">
        <div className="w-full flex items-center justify-between gap-4 pointer-events-auto">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-slate-800 bg-slate-900/90 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg backdrop-blur-md"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-300"
          >
            <span>Continue to Preview</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {activeConfigItem && (
        <GameConfigurator
          interactive={activeConfigItem}
          onSave={handleSaveConfig}
          onClose={() => setActiveConfigItem(null)}
        />
      )}

      {activeCustomGameItem && (
        <CustomGameEditor
          interactive={activeCustomGameItem}
          occasion={data.occasion}
          recipientName={data.recipientName}
          onSave={handleSaveConfig}
          onClose={() => setActiveCustomGameItem(null)}
        />
      )}

      {activePreviewItem && (
        <GamePreviewModal
          interactive={activePreviewItem}
          photos={data.photos}
          recipientName={data.recipientName}
          recipientDate={data.recipientDate}
          onClose={() => setActivePreviewItem(null)}
        />
      )}
    </div>
  );
};
