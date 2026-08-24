import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ExternalLink, Copy, Edit, Check, X, Download, Share2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../../../context/WizardContext';

interface PublishSuccessModalProps {
  isOpen: boolean;
  publicId: string;
  editToken: string;
  onClose: () => void;
  occasion?: string;
}

export const PublishSuccessModal: React.FC<PublishSuccessModalProps> = ({
  isOpen,
  publicId,
  editToken,
  onClose,
  occasion,
}) => {
  const navigate = useNavigate();
  const { data } = useWizard();

  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');

  const selectedOccasion = (occasion || data.occasion || '').toLowerCase();
  const isHeartQrOccasion =
    selectedOccasion.includes('love') ||
    selectedOccasion.includes('anniversary') ||
    selectedOccasion.includes('valentine') ||
    selectedOccasion.includes('romantic');

  const publicUrl = `${window.location.origin}/g/${publicId}`;
  const editUrl = `${window.location.origin}/edit/${editToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // High-res QR code image URL generator
  const getQrCodeImageUrl = (size = 300) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(publicUrl)}&color=ec4899&bgcolor=090d16`;
  };

  // Web Share API Integration with fallback
  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'A Special Digital Gift For You ❤️',
          text: 'I created a special digital gift experience for you on Luvora!',
          url: publicUrl,
        });
        setShareFeedback('Shared successfully!');
        setTimeout(() => setShareFeedback(''), 2500);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  // Download QR Code PNG (Supports Heart Shape clipping)
  const handleDownloadQr = async () => {
    setIsDownloading(true);
    try {
      if (isHeartQrOccasion) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = getQrCodeImageUrl(400);
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.beginPath();
          ctx.moveTo(200, 370);
          ctx.bezierCurveTo(200, 370, 20, 260, 20, 150);
          ctx.bezierCurveTo(20, 70, 75, 25, 140, 25);
          ctx.bezierCurveTo(175, 25, 200, 50, 200, 50);
          ctx.bezierCurveTo(200, 50, 225, 25, 260, 25);
          ctx.bezierCurveTo(325, 25, 380, 70, 380, 150);
          ctx.bezierCurveTo(380, 260, 200, 370, 200, 370);
          ctx.closePath();
          ctx.clip();

          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, 400, 400);
          ctx.drawImage(img, 0, 0, 400, 400);

          const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `luvora-heart-qr-${publicId}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
            setIsDownloading(false);
            return;
          }
        }
      }

      const response = await fetch(getQrCodeImageUrl(400));
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `luvora-qr-${publicId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download QR image:', err);
      window.open(getQrCodeImageUrl(400), '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
        {/* SVG Clip Path Definition for Heart Shape */}
        <svg width="0" height="0" className="absolute pointer-events-none">
          <defs>
            <clipPath id="heart-qr-clip" clipPathUnits="objectBoundingBox">
              <path d="M 0.5, 0.94 C 0.5, 0.94 0.05, 0.65 0.05, 0.38 C 0.05, 0.2 0.18, 0.08 0.33, 0.08 C 0.43, 0.08 0.5, 0.15 0.5, 0.15 C 0.5, 0.15 0.57, 0.08 0.67, 0.08 C 0.82, 0.08 0.95, 0.2 0.95, 0.38 C 0.95, 0.65 0.5, 0.94 0.5, 0.94 Z" />
            </clipPath>
          </defs>
        </svg>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative w-full max-w-lg rounded-3xl border border-pink-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-center shadow-2xl backdrop-blur-2xl my-8"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Animated Heart Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, ease: 'backOut' }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 text-white shadow-xl shadow-pink-500/30"
          >
            <Heart className="h-8 w-8 fill-white/20 animate-pulse" />
          </motion.div>

          {/* Headline */}
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white mb-2">
            Your gift is ready ❤️
          </h2>
          <p className="text-xs text-slate-300 max-w-sm mx-auto mb-6 leading-relaxed">
            Your digital experience has been published successfully for free. Anyone with the secret link or QR code can unlock it!
          </p>

          {/* Premium QR Code Card Section */}
          <div className="mb-6 p-6 rounded-3xl bg-slate-950/90 border border-pink-500/20 shadow-2xl relative overflow-hidden">
            {/* Ambient Glowing Gradient background */}
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-pink-500/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

            {/* QR Card Header */}
            <div className="flex flex-col items-center justify-center gap-1 text-xs font-semibold text-pink-300 mb-4">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                <span>Scan this to open your surprise ❤️</span>
              </div>
              {isHeartQrOccasion && (
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-300 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 mt-1 shadow-sm">
                  💖 Heart-Shaped QR Active
                </span>
              )}
            </div>

            {/* QR Code Image Frame (Heart Shaped for Love/Anniversary) */}
            {isHeartQrOccasion ? (
              <div className="relative mx-auto h-52 w-52 flex items-center justify-center group mb-4">
                {/* Pulsing Glowing Background */}
                <div
                  className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 blur-md opacity-60 animate-pulse pointer-events-none"
                  style={{ clipPath: 'url(#heart-qr-clip)' }}
                />
                <div
                  className="relative h-full w-full bg-slate-900 p-2.5 shadow-2xl flex items-center justify-center transition-transform hover:scale-105 duration-300 cursor-pointer"
                  style={{ clipPath: 'url(#heart-qr-clip)' }}
                >
                  <img
                    src={getQrCodeImageUrl(350)}
                    alt="Luvora Heart Gift QR Code"
                    className="h-full w-full object-cover bg-slate-950 p-1"
                    style={{ clipPath: 'url(#heart-qr-clip)' }}
                  />
                </div>
              </div>
            ) : (
              <div className="relative mx-auto h-48 w-48 rounded-2xl bg-slate-900 border border-pink-500/30 p-3 shadow-xl flex items-center justify-center group mb-4">
                <img
                  src={getQrCodeImageUrl(300)}
                  alt="Luvora Gift QR Code"
                  className="h-full w-full object-contain rounded-xl bg-slate-950 p-1"
                />
              </div>
            )}

            {/* QR Action Buttons: Download PNG & Copy Link */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleDownloadQr}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/30 text-xs font-semibold text-pink-300 hover:bg-pink-500/20 transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-pink-400" />
                <span>{isDownloading ? 'Saving...' : 'Download PNG'}</span>
              </button>

              <button
                type="button"
                onClick={handleWebShare}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-all cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5 text-purple-400" />
                <span>{shareFeedback || 'Share Gift'}</span>
              </button>
            </div>
          </div>

          {/* Public Link Copy Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 mb-6 flex items-center gap-2">
            <span className="text-xs font-mono text-pink-300 truncate flex-1 text-left px-1">
              {publicUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs font-semibold text-pink-300 flex items-center gap-1.5 shrink-0 hover:bg-pink-500/20 transition-colors"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          {/* Core Action Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* 1. Open Gift */}
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-xs shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] transition-all"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open Gift</span>
            </a>

            {/* 2. Edit Gift */}
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/edit/${editToken}`);
              }}
              className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-xs hover:border-slate-700 hover:text-white transition-all"
            >
              <Edit className="h-4 w-4 text-sky-400" />
              <span>Edit Gift</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 italic">
            Save your Edit URL (<span className="text-slate-400 font-mono text-[10px]">{editUrl}</span>) to make updates anytime.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
