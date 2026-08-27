import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, ArrowRight, Save, ExternalLink, Check, Sparkles, Layout, Palette, Type, Image as ImageIcon, Gift, MoveUp, MoveDown, Trash2, Settings } from 'lucide-react';
import { fetchEditGiftApi, updateGiftApi, PublishedGiftResponse } from '../services/giftService';
import { useWizard, WizardGoodie } from '../context/WizardContext';
import { CoverControls } from '../components/wizard/editor/CoverControls';
import { MessageControls } from '../components/wizard/editor/MessageControls';
import { ThemeControls } from '../components/wizard/editor/ThemeControls';
import { TypographyControls } from '../components/wizard/editor/TypographyControls';
import { BackgroundControls } from '../components/wizard/editor/BackgroundControls';
import { AnimationControls } from '../components/wizard/editor/AnimationControls';
import { PhotoUploader } from '../components/wizard/memories/PhotoUploader';
import { AudioUploader } from '../components/wizard/memories/AudioUploader';
import { LiveEditorPreview } from '../components/wizard/editor/LiveEditorPreview';
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

export const EditGiftPage: React.FC = () => {
  const { edit_token } = useParams<{ edit_token: string }>();
  const { data, setOccasion, setRecipientInfo, setCustomization, setPhotos, setInteractives, setGoodies, addGoodie, updateGoodie, removeGoodie } = useWizard();

  const [publishedGift, setPublishedGift] = useState<PublishedGiftResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cover' | 'message' | 'theme' | 'typography' | 'memories' | 'goodies'>('cover');
  const [activeEditingGoodie, setActiveEditingGoodie] = useState<WizardGoodie | null>(null);

  // Saving states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string>('');

  useEffect(() => {
    if (!edit_token) return;
    let mounted = true;

    fetchEditGiftApi(edit_token)
      .then((res) => {
        if (!mounted) return;
        setPublishedGift(res);
        setOccasion(res.occasion_type || 'general');
        setRecipientInfo(res.recipient_name, res.recipient_date || '', false);
        setCustomization({
          coverTitle: res.title || 'A Special Gift For You',
          coverSubtitle: 'Made with love & cherished memories',
          title: res.title,
          message: res.message || '',
          themeId: res.theme_id || 'theme-romantic',
          musicUrl: res.music_url || '',
        });
        if (res.photos) {
          setPhotos(res.photos.map((p) => ({ id: p.id, fileUrl: p.file_url, caption: p.caption || '' })));
        }
        if (res.interactives) {
          setInteractives(res.interactives.map((i) => ({ id: i.id, interactiveType: i.interactive_type, configurationJson: i.configuration_json || {} })));
        }
        if (res.goodies) {
          setGoodies(res.goodies.map((g) => ({
            id: g.id,
            goodieType: g.goodie_type as any,
            title: g.title || '',
            description: g.description || '',
            content: g.content,
            mediaUrl: g.media_url || '',
            configurationJson: g.configuration_json || {},
            displayOrder: g.display_order,
            isEnabled: g.is_enabled,
          })));
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Invalid edit token or gift not found.');
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [edit_token]);

  const handleAddGoodieCard = (def: GoodieDefinition) => {
    const newGoodie: WizardGoodie = {
      id: `goodie-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      goodieType: def.type,
      title: def.defaultTitle,
      description: def.defaultDescription,
      configurationJson: { ...def.defaultConfig },
      displayOrder: data.goodies.length,
      isEnabled: true,
    };

    addGoodie(newGoodie);
    setActiveEditingGoodie(newGoodie);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...data.goodies];
    const temp = items[index - 1];
    items[index - 1] = items[index];
    items[index] = temp;

    const reordered = items.map((g, idx) => ({ ...g, displayOrder: idx }));
    setGoodies(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === data.goodies.length - 1) return;
    const items = [...data.goodies];
    const temp = items[index + 1];
    items[index + 1] = items[index];
    items[index] = temp;

    const reordered = items.map((g, idx) => ({ ...g, displayOrder: idx }));
    setGoodies(reordered);
  };

  const handleSaveChanges = async () => {
    if (!edit_token) return;
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const res = await updateGiftApi(edit_token, data);
      setPublishedGift(res);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-pink-500 mb-4" />
        <p className="text-sm font-semibold text-slate-300">Loading your gift editor...</p>
      </div>
    );
  }

  if (error || !publishedGift) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center">
        <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="font-heading text-3xl font-bold mb-2 text-white">Invalid Edit Token</h1>
        <p className="text-slate-400 text-sm max-w-sm mb-6">
          {error || 'This edit link is invalid or has expired.'}
        </p>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm shadow-lg shadow-pink-500/20"
        >
          <span>Create New Gift</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/q/${publishedGift.public_id}`;

  return (
    <div className="min-h-[85vh] flex flex-col justify-between py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto w-full">
        {/* Editing Banner Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-pink-950/40 via-slate-900 to-purple-950/40 border border-pink-500/30 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-pink-500/25">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-pink-400 uppercase tracking-widest">
                Editing Published Gift
              </div>
              <h2 className="font-heading text-xl font-bold text-white">
                Gift for {data.recipientName || publishedGift.recipient_name}
              </h2>
            </div>
          </div>

          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-950 border border-pink-500/30 text-xs font-semibold text-pink-300 hover:bg-pink-500/10 transition-all shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>View Live Gift</span>
          </a>
        </motion.div>

        {/* Save Success Floating Toast */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 p-4 px-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-2xl flex items-center gap-2"
            >
              <Check className="h-5 w-5 fill-white/20" />
              <span>Changes saved ❤️</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Error Alert */}
        {saveError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{saveError}</span>
            </div>
            <button
              type="button"
              onClick={handleSaveChanges}
              className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-200 font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Editor Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Controls Panel (Left Column) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Editor Tabs Navigation */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('cover')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'cover' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layout className="h-3.5 w-3.5" />
                <span>Cover & Lock</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('message')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'message' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Type className="h-3.5 w-3.5" />
                <span>Message</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('goodies')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'goodies' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Gift className="h-3.5 w-3.5" />
                <span>Digital Goodies</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('theme')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'theme' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Palette className="h-3.5 w-3.5" />
                <span>Theme</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('memories')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'memories' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Photos & Sound</span>
              </button>
            </div>

            {/* Active Tab Content Panel */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-6">
              {activeTab === 'cover' && <CoverControls />}
              {activeTab === 'message' && <MessageControls />}

              {activeTab === 'goodies' && (
                <div className="space-y-6">
                  {/* Active Goodies List */}
                  {data.goodies.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                        Active Goodies ({data.goodies.length})
                      </h4>
                      <div className="space-y-2">
                        {data.goodies.map((item, idx) => (
                          <div key={item.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-white capitalize">{item.title || item.goodieType}</div>
                              <div className="text-[10px] text-slate-400 uppercase">{item.goodieType}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => handleMoveUp(idx)} disabled={idx === 0} className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40"><MoveUp className="h-3 w-3" /></button>
                              <button type="button" onClick={() => handleMoveDown(idx)} disabled={idx === data.goodies.length - 1} className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40"><MoveDown className="h-3 w-3" /></button>
                              <button type="button" onClick={() => setActiveEditingGoodie(item)} className="p-1 rounded bg-purple-500/20 text-purple-300 text-xs font-bold px-2 flex items-center gap-1"><Settings className="h-3 w-3" />Edit</button>
                              <button type="button" onClick={() => removeGoodie(item.id)} className="p-1 rounded bg-rose-500/20 text-rose-300"><Trash2 className="h-3 w-3" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Goodies Catalog */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Add Digital Goodies</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {GOODIE_CATALOG.map((g) => (
                        <GoodieCard
                          key={g.type}
                          goodie={g}
                          isAdded={data.goodies.some((item) => item.goodieType === g.type)}
                          onAdd={handleAddGoodieCard}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'theme' && (
                <div className="space-y-6">
                  <ThemeControls />
                  <TypographyControls />
                  <BackgroundControls />
                  <AnimationControls />
                </div>
              )}
              {activeTab === 'memories' && (
                <div className="space-y-6">
                  <PhotoUploader />
                  <AudioUploader />
                </div>
              )}
            </div>
          </div>

          {/* Real-Time Live Preview Canvas (Right Column) */}
          <div className="lg:col-span-6 sticky top-8">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Live Gift Preview
              </span>
              <span className="text-[11px] text-slate-500">Updates live as you edit</span>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl min-h-[500px]">
              <LiveEditorPreview />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Save Action Bar */}
      <div className="sticky bottom-0 z-40 py-3 sm:py-4 px-4 sm:px-10 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80">
        <div className="w-full max-w-7xl mx-auto flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-5 py-3 rounded-full border border-slate-800 bg-slate-900/90 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all duration-200 shadow-lg backdrop-blur-md"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Public Gift</span>
          </a>

          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving}
            className={`w-full sm:w-auto justify-center inline-flex items-center gap-2.5 px-9 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white transition-all duration-300 shadow-xl ${
              isSaving
                ? 'bg-slate-800 opacity-70 cursor-wait'
                : 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-pink-500/30 hover:shadow-pink-500/45 hover:scale-105 active:scale-95 cursor-pointer'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin text-pink-300" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="h-4.5 w-4.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modals for Goodie Editing */}
      {activeEditingGoodie && activeEditingGoodie.goodieType === 'note' && (
        <NoteGoodieEditor goodie={activeEditingGoodie} onSave={updateGoodie} onClose={() => setActiveEditingGoodie(null)} />
      )}
      {activeEditingGoodie && activeEditingGoodie.goodieType === 'photo' && (
        <PhotoGoodieEditor goodie={activeEditingGoodie} existingPhotos={data.photos} onSave={updateGoodie} onClose={() => setActiveEditingGoodie(null)} />
      )}
      {activeEditingGoodie && activeEditingGoodie.goodieType === 'video' && (
        <VideoGoodieEditor goodie={activeEditingGoodie} existingMemories={data.memories} onSave={updateGoodie} onClose={() => setActiveEditingGoodie(null)} />
      )}
      {activeEditingGoodie && activeEditingGoodie.goodieType === 'song' && (
        <SongGoodieEditor goodie={activeEditingGoodie} existingTracks={data.musicTracks} onSave={updateGoodie} onClose={() => setActiveEditingGoodie(null)} />
      )}
      {activeEditingGoodie && activeEditingGoodie.goodieType === 'voice' && (
        <VoiceGoodieEditor goodie={activeEditingGoodie} onSave={updateGoodie} onClose={() => setActiveEditingGoodie(null)} />
      )}
      {activeEditingGoodie && activeEditingGoodie.goodieType === 'drawing' && (
        <DrawingGoodieEditor goodie={activeEditingGoodie} onSave={updateGoodie} onClose={() => setActiveEditingGoodie(null)} />
      )}
      {activeEditingGoodie && activeEditingGoodie.goodieType === 'place' && (
        <PlaceGoodieEditor goodie={activeEditingGoodie} onSave={updateGoodie} onClose={() => setActiveEditingGoodie(null)} />
      )}
      {activeEditingGoodie && activeEditingGoodie.goodieType === 'coupon' && (
        <CouponGoodieEditor goodie={activeEditingGoodie} onSave={updateGoodie} onClose={() => setActiveEditingGoodie(null)} />
      )}
      {activeEditingGoodie && activeEditingGoodie.goodieType === 'custom_card' && (
        <CustomCardGoodieEditor goodie={activeEditingGoodie} onSave={updateGoodie} onClose={() => setActiveEditingGoodie(null)} />
      )}
      {activeEditingGoodie && activeEditingGoodie.goodieType === 'surprise' && (
        <SurpriseGoodieEditor goodie={activeEditingGoodie} onSave={updateGoodie} onClose={() => setActiveEditingGoodie(null)} />
      )}
    </div>
  );
};
