import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { useWizard } from '../../../context/WizardContext';
import { getThemeConfig } from '../../../utils/themeSystem';
import { Heart, Sparkles, Music, Image as ImageIcon, Gift, ArrowUpRight } from 'lucide-react';

export const LiveEditorPreview: React.FC = () => {
  const navigate = useNavigate();
  const { data } = useWizard();
  const theme = getThemeConfig(data.themeId);

  // Determine active background style
  const getCanvasBackground = () => {
    if (data.backgroundType === 'image' && data.customBgValue) {
      return { backgroundImage: `url(${data.customBgValue})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    return {};
  };

  const getCanvasBgClass = () => {
    if (data.backgroundType === 'image') return 'bg-slate-950';
    if (data.customBgValue) return data.customBgValue;
    return theme.background;
  };

  // Font size classes
  const getFontSizeClass = () => {
    switch (data.fontSize) {
      case 'sm':
        return 'text-sm sm:text-base';
      case 'lg':
        return 'text-xl sm:text-2xl';
      default:
        return 'text-base sm:text-lg';
    }
  };

  // Text alignment classes
  const getTextAlignClass = () => {
    switch (data.textAlign) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      default:
        return 'text-center';
    }
  };

  // Framer Motion animation variants
  const getAnimationVariant = (): Variants => {
    switch (data.animationStyle) {
      case 'slide':
        return {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
        };
      case 'soft-reveal':
        return {
          initial: { opacity: 0, filter: 'blur(10px)' },
          animate: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.8, ease: 'easeOut' } },
        };
      case 'floating':
        return {
          initial: { opacity: 0, y: 15 },
          animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1, transition: { duration: 0.5 } },
        };
    }
  };

  const displayName = data.recipientName.trim() || 'Someone Special';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Live Interactive Preview
        </span>
        <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Draft autosaved
        </span>
      </div>

      {/* Main Live Gift Device / Canvas Container */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 shadow-2xl">
        <div
          style={getCanvasBackground()}
          className={`min-h-[580px] p-6 sm:p-10 flex flex-col justify-between transition-colors duration-500 ${getCanvasBgClass()}`}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                <Heart className="h-3.5 w-3.5 text-pink-400 fill-pink-400/30" />
              </div>
              <span className="text-xs font-semibold text-slate-200 tracking-wider">
                Luvora Experience
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/15">
              {data.occasion || 'Gift'}
            </span>
          </div>

          {/* Center Content Body */}
          <motion.div
            key={data.themeId + data.animationStyle + data.fontFamily + data.fontSize + data.textAlign + data.backgroundType + data.customBgValue}
            variants={getAnimationVariant()}
            initial="initial"
            animate="animate"
            className={`my-auto py-6 ${getTextAlignClass()}`}
          >
            {/* Cover Layout rendering */}
            <div className="mb-6">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-pink-400 mb-2">
                {data.coverSubtitle || 'Made with love & cherished memories'}
              </span>

              <h2
                style={{ fontFamily: data.fontFamily }}
                className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-2 leading-snug"
              >
                {data.coverTitle || 'A Special Gift For You'}
              </h2>

              <div className="inline-flex items-center gap-2 text-sm font-semibold text-pink-300 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20 mt-1">
                <span>For {displayName}</span>
              </div>
            </div>

            {/* Main Message Block */}
            <div className={`p-6 sm:p-8 rounded-2xl backdrop-blur-xl border ${theme.cardBg} shadow-2xl`}>
              <h3
                style={{ fontFamily: data.fontFamily }}
                className="text-xl sm:text-2xl font-bold text-white mb-3"
              >
                {data.title || 'Turn Your Feelings Into Memories'}
              </h3>

              <p
                style={{ color: theme.textColor }}
                className={`leading-relaxed opacity-90 ${getFontSizeClass()}`}
              >
                {data.message || 'I created this digital experience just for you to celebrate all the wonderful moments we share.'}
              </p>
            </div>
          </motion.div>

          {/* Interactive Bottom Navigation Quick Options */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
            <button
              type="button"
              onClick={() => navigate('/create/memories')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-pink-500/20 hover:border-pink-500/40 text-pink-300 text-xs font-medium cursor-pointer transition-all duration-200 group"
              title="Click to configure Photos & Gallery"
            >
              <ImageIcon className="h-3.5 w-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
              <span className="truncate">Memories ({data.photos.length})</span>
              <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100 hidden sm:inline" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/create/memories')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-sky-500/20 hover:border-sky-500/40 text-sky-300 text-xs font-medium cursor-pointer transition-all duration-200 group"
              title="Click to configure Background Music or Song Links"
            >
              <Music className="h-3.5 w-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
              <span className="truncate">{data.musicUrl ? 'Track Added' : 'Background Music'}</span>
              <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100 hidden sm:inline" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/create/interactive')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-500/20 hover:border-purple-500/40 text-purple-300 text-xs font-medium cursor-pointer transition-all duration-200 group"
              title="Click to configure Interactive Surprises & Countdown"
            >
              <Gift className="h-3.5 w-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="truncate">Surprises ({data.interactives.length})</span>
              <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100 hidden sm:inline" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
