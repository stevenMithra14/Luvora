import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, MoveUp, MoveDown, Trash2, Settings, Gift } from 'lucide-react';
import { useWizard, WizardGoodie } from '../context/WizardContext';
import { WizardProgress } from '../components/wizard/WizardProgress';
import { GOODIE_CATALOG, GoodieDefinition } from '../components/goodies/goodieCatalog';
import { GoodieCard } from '../components/goodies/GoodieCard';

import { NoteGoodieEditor } from '../components/goodies/editors/NoteGoodieEditor';
import { PhotoGoodieEditor } from '../components/goodies/editors/PhotoGoodieEditor';
import { VideoGoodieEditor } from '../components/goodies/editors/VideoGoodieEditor';
import { SongGoodieEditor } from '../components/goodies/editors/SongGoodieEditor';
import { VoiceGoodieEditor } from '../components/goodies/editors/VoiceGoodieEditor';
import { DrawingGoodieEditor } from '../components/goodies/editors/DrawingGoodieEditor';
import { PlaceGoodieEditor } from '../components/goodies/editors/PlaceGoodieEditor';
import { CouponGoodieEditor } from '../components/goodies/editors/CouponGoodieEditor';
import { CustomCardGoodieEditor } from '../components/goodies/editors/CustomCardGoodieEditor';
import { SurpriseGoodieEditor } from '../components/goodies/editors/SurpriseGoodieEditor';

import { LiveDevicePreview } from '../components/wizard/preview/LiveDevicePreview';

export const CreateGiftGoodies: React.FC = () => {
  const navigate = useNavigate();
  const { data, setGoodies, addGoodie, updateGoodie, removeGoodie, nextStep, prevStep } = useWizard();

  const [activeEditingGoodie, setActiveEditingGoodie] = useState<WizardGoodie | null>(null);

  useEffect(() => {
    if (!data.occasion) {
      navigate('/create');
    }
  }, [data.occasion, navigate]);

  const handleAddGoodieCard = (def: GoodieDefinition) => {
    const draftGoodie: WizardGoodie = {
      id: `goodie-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      goodieType: def.type,
      title: def.defaultTitle,
      description: def.defaultDescription,
      configurationJson: { ...def.defaultConfig },
      displayOrder: data.goodies.length,
      isEnabled: true,
    };

    // Open modal only - do NOT add to package until user clicks "Add to package"!
    setActiveEditingGoodie(draftGoodie);
  };

  const handleSaveGoodie = (id: string, updated: Partial<WizardGoodie>) => {
    const existingIndex = data.goodies.findIndex((g) => g.id === id);
    if (existingIndex >= 0) {
      updateGoodie(id, updated);
    } else if (activeEditingGoodie) {
      addGoodie({ ...activeEditingGoodie, ...updated, id });
    }
    setActiveEditingGoodie(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...data.goodies];
    const temp = items[index - 1];
    items[index - 1] = items[index];
    items[index] = temp;

    // Update display orders
    const reordered = items.map((g, idx) => ({ ...g, displayOrder: idx }));
    setGoodies(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === data.goodies.length - 1) return;
    const items = [...data.goodies];
    const temp = items[index + 1];
    items[index + 1] = items[index];
    items[index] = temp;

    // Update display orders
    const reordered = items.map((g, idx) => ({ ...g, displayOrder: idx }));
    setGoodies(reordered);
  };

  const handleContinue = () => {
    nextStep();
    navigate('/create/interactive');
  };

  const handleBack = () => {
    prevStep();
    navigate('/create/memories');
  };

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col justify-between py-2 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center my-auto">
        {/* Progress Stepper */}
        <WizardProgress currentStep={5} />

        {/* 50-50 Split Desktop & Laptop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center flex-1 my-auto w-full">
          {/* LEFT 50%: Creator Goodies Controls */}
          <div className="w-full lg:col-span-1 space-y-4 max-h-[calc(100vh-9.5rem)] overflow-y-auto pr-1">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center lg:text-left max-w-2xl"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                Step 5 of 6 &bull; Digital Care Package
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
                Digital Care Package
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Tuck little surprises inside your digital care box for {data.recipientName || 'your special someone'} ❤️
              </p>
            </motion.div>

            {/* DIGITAL CARE PACKAGE SHIPPING LABEL & INVENTORY SHEET CONTAINER */}
            <div className="p-4 sm:p-8 rounded-3xl bg-[#d5be9f] border-4 border-[#bda282] shadow-2xl text-slate-900 font-mono relative overflow-hidden space-y-8">
              {/* Cardboard Texture Shadow Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10 pointer-events-none" />

              {/* 1. SHIPPING LABEL STICKER */}
              <div className="relative max-w-md mx-auto xl:mx-0 bg-white p-5 rounded-2xl border-2 border-slate-900 shadow-xl transform -rotate-1 transition-transform hover:rotate-0">
                {/* Header Bar */}
                <div className="bg-black text-white p-2 text-center rounded-lg mb-4">
                  <h3 className="font-mono text-base font-extrabold tracking-widest uppercase">
                    DIGITAL CARE PACKAGE
                  </h3>
                </div>

                <div className="space-y-3 font-mono text-xs sm:text-sm text-slate-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-500 block text-[10px] uppercase">TO:</span>
                      <span className="font-extrabold text-base text-slate-950 font-serif tracking-wide block">
                        {data.recipientName || 'steven'}
                      </span>
                    </div>

                    {/* Red Delivery Stamp */}
                    <div className="border-2 border-rose-600 text-rose-600 font-bold px-2 py-1 rounded text-[10px] uppercase tracking-tighter transform rotate-[-8deg] shadow-sm text-center">
                      to be delivered with<br />care and love
                    </div>
                  </div>

                  <div className="border-t border-dashed border-slate-400 pt-2">
                    <span className="font-bold text-slate-500 block text-[10px] uppercase">FROM:</span>
                    <span className="font-bold text-sm text-slate-800">
                      {data.title || 'bestie'}
                    </span>
                  </div>

                  {/* Barcode Graphic */}
                  <div className="pt-3 text-center border-t border-slate-900">
                    <div className="font-mono text-xl tracking-[0.25em] font-extrabold text-black select-none">
                      |||||||||||||||||||||||||||||||||||||||
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-slate-700 block">
                      9405 5118 9956 1891 2345 67
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. VINTAGE INVENTORY SHEET ("things to tuck inside") */}
              <div className="relative bg-[#fcfbfa] p-6 sm:p-8 rounded-2xl border border-amber-900/20 shadow-2xl space-y-6 text-slate-900 font-mono">
                {/* Header Section */}
                <div className="text-center space-y-1 relative">
                  <h3 className="text-base font-extrabold tracking-widest uppercase text-slate-950">
                    A LITTLE BOX OF GOODIES
                  </h3>
                  <p className="text-[11px] text-slate-500 italic font-serif">
                    est. for sending a little care
                  </p>

                  {/* Red Stamp Badge */}
                  <div className="inline-block border-2 border-rose-600 text-rose-600 font-bold px-3 py-1 rounded-md text-xs uppercase tracking-widest transform rotate-[-4deg] shadow-xs my-2">
                    things to tuck inside
                  </div>

                  <div className="text-[11px] font-bold tracking-widest text-slate-700 pt-2">
                    *** SELECT ITEMS TO TUCK ***
                  </div>
                </div>

                <div className="border-b-2 border-slate-900 pb-1 flex justify-between text-[11px] font-bold text-slate-600 uppercase">
                  <span>ITEM</span>
                  <span>ADD</span>
                </div>

                {/* Goodies Catalog Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {GOODIE_CATALOG.map((goodieDef) => {
                    const count = data.goodies.filter((g) => g.goodieType === goodieDef.type).length;
                    const isAdded = count > 0;
                    return (
                      <GoodieCard
                        key={goodieDef.type}
                        goodie={goodieDef}
                        isAdded={isAdded}
                        count={count}
                        onAdd={handleAddGoodieCard}
                      />
                    );
                  })}
                </div>
              </div>

              {/* 3. TUCKED INSIDE CARE PACKAGE ITEMS LIST */}
              {data.goodies.length > 0 && (
                <div className="bg-[#f7f3ee] p-5 rounded-2xl border-2 border-slate-900 shadow-xl space-y-4 font-mono text-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Gift className="h-4 w-4 text-pink-600" />
                      TUCKED INSIDE CARE PACKAGE ({data.goodies.length})
                    </span>
                    <span className="text-[11px] text-slate-600">Drag/reorder or edit</span>
                  </div>

                  <div className="space-y-2.5">
                    {data.goodies.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-400 shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-7 w-7 rounded-lg bg-pink-100 text-pink-700 text-xs font-mono font-bold flex items-center justify-center border border-pink-300">
                            0{idx + 1}
                          </span>
                          <div>
                            <h4 className="font-mono text-xs font-bold text-slate-950 capitalize flex items-center gap-1.5">
                              <span>+ {item.title || 'Digital Goodie'}</span>
                            </h4>
                            <p className="text-[10px] text-slate-600 truncate max-w-xs font-sans">
                              {item.description || 'Personalized digital surprise'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(idx)}
                            disabled={idx === 0}
                            className="p-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                            title="Move Up"
                          >
                            <MoveUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(idx)}
                            disabled={idx === data.goodies.length - 1}
                            className="p-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                            title="Move Down"
                          >
                            <MoveDown className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveEditingGoodie(item)}
                            className="px-3 py-1.5 rounded-lg bg-purple-100 border border-purple-300 text-purple-800 text-xs font-bold hover:bg-purple-200 cursor-pointer flex items-center gap-1"
                          >
                            <Settings className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => removeGoodie(item.id)}
                            className="p-2 rounded-lg bg-rose-100 border border-rose-300 text-rose-700 hover:bg-rose-200 cursor-pointer"
                            title="Remove Goodie"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            <span>Back to Memories</span>
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-300"
          >
            <span>Continue to Games</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Dedicated Goodie Editor Modals */}
      {activeEditingGoodie && activeEditingGoodie.goodieType === 'note' && (
        <NoteGoodieEditor
          goodie={activeEditingGoodie}
          onSave={handleSaveGoodie}
          onClose={() => setActiveEditingGoodie(null)}
        />
      )}

      {activeEditingGoodie && activeEditingGoodie.goodieType === 'photo' && (
        <PhotoGoodieEditor
          goodie={activeEditingGoodie}
          existingPhotos={data.photos}
          onSave={handleSaveGoodie}
          onClose={() => setActiveEditingGoodie(null)}
        />
      )}

      {activeEditingGoodie && activeEditingGoodie.goodieType === 'video' && (
        <VideoGoodieEditor
          goodie={activeEditingGoodie}
          existingMemories={data.memories}
          onSave={handleSaveGoodie}
          onClose={() => setActiveEditingGoodie(null)}
        />
      )}

      {activeEditingGoodie && activeEditingGoodie.goodieType === 'song' && (
        <SongGoodieEditor
          goodie={activeEditingGoodie}
          existingTracks={data.musicTracks}
          onSave={handleSaveGoodie}
          onClose={() => setActiveEditingGoodie(null)}
        />
      )}

      {activeEditingGoodie && activeEditingGoodie.goodieType === 'voice' && (
        <VoiceGoodieEditor
          goodie={activeEditingGoodie}
          onSave={handleSaveGoodie}
          onClose={() => setActiveEditingGoodie(null)}
        />
      )}

      {activeEditingGoodie && activeEditingGoodie.goodieType === 'drawing' && (
        <DrawingGoodieEditor
          goodie={activeEditingGoodie}
          onSave={handleSaveGoodie}
          onClose={() => setActiveEditingGoodie(null)}
        />
      )}

      {activeEditingGoodie && activeEditingGoodie.goodieType === 'place' && (
        <PlaceGoodieEditor
          goodie={activeEditingGoodie}
          onSave={handleSaveGoodie}
          onClose={() => setActiveEditingGoodie(null)}
        />
      )}

      {activeEditingGoodie && activeEditingGoodie.goodieType === 'coupon' && (
        <CouponGoodieEditor
          goodie={activeEditingGoodie}
          onSave={handleSaveGoodie}
          onClose={() => setActiveEditingGoodie(null)}
        />
      )}

      {activeEditingGoodie && activeEditingGoodie.goodieType === 'custom_card' && (
        <CustomCardGoodieEditor
          goodie={activeEditingGoodie}
          onSave={handleSaveGoodie}
          onClose={() => setActiveEditingGoodie(null)}
        />
      )}

      {activeEditingGoodie && activeEditingGoodie.goodieType === 'surprise' && (
        <SurpriseGoodieEditor
          goodie={activeEditingGoodie}
          onSave={handleSaveGoodie}
          onClose={() => setActiveEditingGoodie(null)}
        />
      )}
    </div>
  );
};
