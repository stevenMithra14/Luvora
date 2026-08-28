import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Edit,
  Send,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Music,
  Camera,
  Gift,
  PartyPopper,
  Palette,
  X
} from 'lucide-react';
import { useWizard } from '../../../context/WizardContext';
import { RecipientGiftView } from './RecipientGiftView';

interface MobileGiftPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendGift?: () => void;
}

export const MobileGiftPreviewModal: React.FC<MobileGiftPreviewModalProps> = ({
  isOpen,
  onClose,
  onSendGift,
}) => {
  const navigate = useNavigate();
  const { data } = useWizard();

  const [showChecklist, setShowChecklist] = useState(false);

  if (!isOpen) return null;

  // Feature completeness checks
  const hasRecipient = Boolean(data.recipientName && data.recipientName.trim());
  const hasCover = Boolean(data.coverTitle || data.coverSubtitle);
  const hasMessage = Boolean(data.message && data.message.trim());
  const hasGiftBox = Boolean(data.giftBoxConfig);
  const hasCake = Boolean(data.cakeConfig);
  const hasMusic = Boolean(data.musicUrl || data.spotifyTrack || (data.musicTracks && data.musicTracks.length > 0));
  const hasMemories = Boolean((data.memories && data.memories.length > 0) || (data.photos && data.photos.length > 0));
  const hasGoodies = Boolean(data.goodies && data.goodies.some((g) => g.isEnabled !== false));
  const hasTheme = Boolean(data.themeId);

  const handleEditSection = (route: string) => {
    onClose();
    navigate(route);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white overflow-hidden font-sans select-none">
        {/* TOP CONTROL HEADER BAR */}
        <div className="sticky top-0 z-50 flex items-center justify-between px-3.5 sm:px-6 py-2.5 bg-slate-900/95 border-b border-slate-800 backdrop-blur-xl shadow-lg">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Editing</span>
          </button>

          {/* Badge & Checklist Toggle */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 text-[11px] font-extrabold uppercase tracking-wider">
              <Eye className="h-3 w-3 text-pink-400" />
              <span>Preview Mode</span>
            </span>

            <button
              type="button"
              onClick={() => setShowChecklist((prev) => !prev)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Checklist</span>
              <Sparkles className="h-3 w-3 text-amber-400" />
            </button>
          </div>
        </div>

        {/* FEATURE COMPLETION CHECKLIST BANNER (Collapsible) */}
        {showChecklist && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900 border-b border-slate-800 p-3 px-4 text-xs space-y-2 relative z-40"
          >
            <div className="flex items-center justify-between font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Gift Configuration Readiness</span>
              </span>
              <button
                type="button"
                onClick={() => setShowChecklist(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
              <div className={`flex items-center gap-1.5 ${hasRecipient ? 'text-emerald-300' : 'text-amber-300'}`}>
                <CheckCircle2 className={`h-3.5 w-3.5 ${hasRecipient ? 'text-emerald-400' : 'text-amber-400'} shrink-0`} />
                <span>Recipient: {data.recipientName || 'Set'}</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasCover && hasMessage ? 'text-emerald-300' : 'text-amber-300'}`}>
                <CheckCircle2 className={`h-3.5 w-3.5 ${hasCover && hasMessage ? 'text-emerald-400' : 'text-amber-400'} shrink-0`} />
                <span>Cover & Message</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasCake ? 'text-emerald-300' : 'text-amber-300'}`}>
                <CheckCircle2 className={`h-3.5 w-3.5 ${hasCake ? 'text-emerald-400' : 'text-amber-400'} shrink-0`} />
                <span>3D Cake (3 Candles)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasGiftBox ? 'text-emerald-300' : 'text-amber-300'}`}>
                <CheckCircle2 className={`h-3.5 w-3.5 ${hasGiftBox ? 'text-emerald-400' : 'text-amber-400'} shrink-0`} />
                <span>Gift Box</span>
              </div>

              {hasMusic ? (
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Music Configured</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleEditSection('/create/memories')}
                  className="flex items-center gap-1.5 text-amber-300 hover:underline cursor-pointer"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>+ Add Music</span>
                </button>
              )}

              {hasMemories ? (
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Memories Album</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleEditSection('/create/memories')}
                  className="flex items-center gap-1.5 text-amber-300 hover:underline cursor-pointer"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>+ Add Memories</span>
                </button>
              )}

              <div className={`flex items-center gap-1.5 ${hasGoodies ? 'text-emerald-300' : 'text-slate-400'}`}>
                <CheckCircle2 className={`h-3.5 w-3.5 ${hasGoodies ? 'text-emerald-400' : 'text-slate-500'} shrink-0`} />
                <span>Goodies ({data.goodies?.length || 0})</span>
              </div>

              <div className={`flex items-center gap-1.5 ${hasTheme ? 'text-emerald-300' : 'text-slate-400'}`}>
                <CheckCircle2 className={`h-3.5 w-3.5 ${hasTheme ? 'text-emerald-400' : 'text-slate-500'} shrink-0`} />
                <span>Theme ({data.themeId || 'classic'})</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION QUICK-EDIT CHIPS SCROLLBAR */}
        <div className="bg-slate-950/80 border-b border-slate-800/80 px-3 py-1.5 overflow-x-auto flex items-center gap-2 scrollbar-none z-30 shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">Quick Edit:</span>
          <button
            type="button"
            onClick={() => handleEditSection('/create/customize')}
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold text-pink-300 hover:bg-slate-800 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <PartyPopper className="h-3 w-3 text-pink-400" />
            <span>Edit Cake</span>
          </button>
          <button
            type="button"
            onClick={() => handleEditSection('/create/memories')}
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold text-pink-300 hover:bg-slate-800 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Music className="h-3 w-3 text-purple-400" />
            <span>Edit Music</span>
          </button>
          <button
            type="button"
            onClick={() => handleEditSection('/create/memories')}
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold text-pink-300 hover:bg-slate-800 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Camera className="h-3 w-3 text-sky-400" />
            <span>Edit Memories</span>
          </button>
          <button
            type="button"
            onClick={() => handleEditSection('/create/goodies')}
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold text-pink-300 hover:bg-slate-800 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Gift className="h-3 w-3 text-amber-400" />
            <span>Edit Goodies</span>
          </button>
          <button
            type="button"
            onClick={() => handleEditSection('/create/customize')}
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold text-pink-300 hover:bg-slate-800 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Palette className="h-3 w-3 text-emerald-400" />
            <span>Edit Theme</span>
          </button>
        </div>

        {/* CANVAS MAIN CONTAINER (Recycle Recipient rendering logic directly) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-6 bg-slate-950 scrollbar-none pb-24">
          <div className="max-w-md mx-auto min-h-full">
            <RecipientGiftView />
          </div>
        </div>

        {/* FLOATING MOBILE ACTION BOTTOM BAR */}
        <div className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 bg-slate-900/95 border-t border-slate-800 backdrop-blur-xl shadow-2xl pb-safe">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Edit className="h-4 w-4 text-pink-400" />
              <span>Edit Gift</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onSendGift) {
                  onSendGift();
                } else {
                  navigate('/create/preview');
                }
              }}
              className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xl shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Send Gift Now</span>
            </button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
