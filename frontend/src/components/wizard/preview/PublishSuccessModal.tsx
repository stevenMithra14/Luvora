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

  const getQrCodeImageUrl = (size = 300) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(publicUrl)}&color=ec4899&bgcolor=090d16`;
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'A Special Digital Gift For You ❤️',
          text: 'I created a special digital gift experience for you on Luvora!',
          url: publicUrl,
        });
        setShareFeedback('Shared!');
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl overflow-hidden">
        {/* SVG Clip Path Definition for Heart Shape */}
        <svg width="0" height="0" className="absolute pointer-events-none">
          <defs>
            <clipPath id="heart-qr-clip" clipPathUnits="objectBoundingBox">
              <path d="M 0.5, 0.94 C 0.5, 0.94 0.05, 0.65 0.05, 0.38 C 0.05, 0.2 0.18, 0.08 0.33, 0.08 C 0.43, 0.08 0.5, 0.15 0.5, 0.15 C 0.5, 0.15 0.57, 0.08 0.67, 0.08 C 0.82, 0.08 0.95, 0.2 0.95, 0.38 C 0.95, 0.65 0.5, 0.94 0.5, 0.94 Z" />
            </clipPath>
          </defs>
        </svg>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative w-full max-w-lg md:max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-pink-500/30 bg-slate-900 text-center shadow-2xl backdrop-blur-2xl overflow-hidden"
        >
          {/* Close Button Header */}
          <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-950/80">
            <div className="flex items-center gap-2 text-xs font-bold text-pink-300">
              <Sparkles className="h-4 w-4 text-pink-400" />
              <span>Gift Created & Published</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Responsive Modal Scrollable Content */}
          <div className="p-5 sm:p-7 overflow-y-auto max-h-[calc(92vh-4rem)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* LEFT COLUMN: Heart, Headline & QR Card */}
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Animated Heart Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5, ease: 'backOut' }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 text-white shadow-xl shadow-pink-500/30"
                >
                  <Heart className="h-7 w-7 fill-white/20 animate-pulse" />
                </motion.div>

                <div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white mb-1">
                    Your gift is ready ❤️
                  </h2>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                    Your digital experience is published for free. Share the link or QR code with your recipient!
                  </p>
                </div>

                {/* QR Code Card Section */}
                <div className="w-full p-4 rounded-2xl bg-slate-950 border border-pink-500/20 shadow-xl relative overflow-hidden flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-pink-300 mb-3">
                    <Sparkles className="h-3 w-3 text-pink-400" />
                    <span>Scan to open surprise ❤️</span>
                  </div>

                  {/* QR Code Image */}
                  {isHeartQrOccasion ? (
                    <div className="relative mx-auto h-40 w-40 flex items-center justify-center mb-3">
                      <div
                        className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 blur-md opacity-60 animate-pulse pointer-events-none"
                        style={{ clipPath: 'url(#heart-qr-clip)' }}
                      />
                      <div
                        className="relative h-full w-full bg-slate-900 p-2 shadow-xl flex items-center justify-center cursor-pointer"
                        style={{ clipPath: 'url(#heart-qr-clip)' }}
                      >
                        <img
                          src={getQrCodeImageUrl(300)}
                          alt="Luvora Heart Gift QR Code"
                          className="h-full w-full object-cover bg-slate-950 p-1"
                          style={{ clipPath: 'url(#heart-qr-clip)' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative mx-auto h-36 w-36 rounded-xl bg-slate-900 border border-pink-500/30 p-2.5 shadow-lg flex items-center justify-center mb-3">
                      <img
                        src={getQrCodeImageUrl(300)}
                        alt="Luvora Gift QR Code"
                        className="h-full w-full object-contain rounded-lg bg-slate-950 p-1"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      disabled={isDownloading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-xs font-semibold text-pink-300 hover:bg-pink-500/25 transition-all cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 text-pink-400" />
                      <span>{isDownloading ? 'Saving...' : 'Download PNG'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleWebShare}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-semibold text-purple-300 hover:bg-purple-500/25 transition-all cursor-pointer"
                    >
                      <Share2 className="h-3.5 w-3.5 text-purple-400" />
                      <span>{shareFeedback || 'Share Gift'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Link Copy, Action Buttons & Edit Info */}
              <div className="flex flex-col justify-center space-y-4 text-left">
                {/* Public Link Copy Bar */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Public Share Link
                  </span>
                  <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <span className="text-xs font-mono text-pink-300 truncate flex-1 block overflow-hidden select-all">
                      {publicUrl}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 rounded-lg bg-pink-500/20 border border-pink-500/30 text-xs font-bold text-pink-300 flex items-center gap-1.5 shrink-0 hover:bg-pink-500/30 transition-colors cursor-pointer"
                    >
                      {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold text-xs shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] transition-all"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Open Gift</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/edit/${editToken}`);
                    }}
                    className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 font-bold text-xs hover:border-slate-700 hover:text-white transition-all cursor-pointer"
                  >
                    <Edit className="h-4 w-4 text-sky-400" />
                    <span>Edit Gift</span>
                  </button>
                </div>

                {/* Edit Link & Author Key Box */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Author Secret Edit Link
                  </span>
                  <p className="text-[11px] font-mono text-slate-400 break-all leading-tight">
                    {editUrl}
                  </p>
                  <p className="text-[10px] text-slate-500 italic pt-1">
                    Keep this secret edit link to modify your gift or add new photos anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
