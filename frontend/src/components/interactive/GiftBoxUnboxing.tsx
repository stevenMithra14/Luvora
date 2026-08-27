import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Lock, Key, ShieldAlert } from 'lucide-react';
import { GiftBoxConfig } from '../../context/WizardContext';

interface GiftBoxUnboxingProps {
  config?: GiftBoxConfig;
  recipientName?: string;
  password?: string;
  passwordHint?: string;
  isPasswordProtected?: boolean;
  onVerifyPassword?: (password: string) => Promise<{ verified: boolean; access_token?: string }>;
  onOpenComplete: (accessToken?: string) => void;
}

export const GiftBoxUnboxing: React.FC<GiftBoxUnboxingProps> = ({
  config,
  recipientName = 'Someone Special',
  password,
  passwordHint,
  isPasswordProtected: externalIsProtected,
  onVerifyPassword,
  onOpenComplete,
}) => {
  const [isOpenAnimationStarted, setIsOpenAnimationStarted] = useState(false);
  const [boxTiltX, setBoxTiltX] = useState(0);
  const [boxTiltY, setBoxTiltY] = useState(0);

  // Inline Password Gate States
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const isPasswordProtected = externalIsProtected ?? Boolean(password && typeof password === 'string' && password.trim().length > 0);
  const [isUnlocked, setIsUnlocked] = useState(!isPasswordProtected);

  useEffect(() => {
    setIsUnlocked(!isPasswordProtected);
  }, [isPasswordProtected, password]);

  const boxBgColor = config?.boxColor || '#1d141e';
  const ribbonColor = config?.ribbonColor || '#ec4899';
  const pattern = config?.pattern || 'stars';
  const ribbonStyle = config?.ribbonStyle || 'satin';
  const openingMessage = config?.openingMessage || 'Something special is waiting for you... ❤️';

  const getHintText = (): string => {
    if (passwordHint && typeof passwordHint === 'string' && passwordHint.trim()) {
      return passwordHint.trim();
    }
    if (!password || typeof password !== 'string' || !password.trim()) {
      return '';
    }
    const trimmed = password.trim();
    if (/^\d+$/.test(trimmed)) {
      return `${trimmed.length}-digit number starting with "${trimmed[0]}"`;
    }
    if (trimmed.length <= 2) {
      return `${trimmed.length} character code (starts with "${trimmed[0]}")`;
    }
    return `${trimmed.length} characters starting with "${trimmed[0]}" and ending with "${trimmed[trimmed.length - 1]}" (${trimmed[0]}${'*'.repeat(trimmed.length - 2)}${trimmed[trimmed.length - 1]})`;
  };

  const handleBoxMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setBoxTiltX(-y / 10);
    setBoxTiltY(x / 10);
  };

  const handleBoxMouseLeave = () => {
    setBoxTiltX(0);
    setBoxTiltY(0);
  };

  const triggerUnboxing = (token?: string) => {
    setIsOpenAnimationStarted(true);
    const activeToken = token || accessToken;
    setTimeout(() => {
      onOpenComplete(activeToken);
    }, 1200);
  };

  const handlePasswordSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPasswordError('');

    const trimmedInput = passwordInput.trim();
    if (!trimmedInput) {
      setPasswordError('Please enter the access password.');
      passwordInputRef.current?.focus();
      return;
    }

    if (onVerifyPassword) {
      setIsVerifying(true);
      try {
        const res = await onVerifyPassword(trimmedInput);
        if (res.verified && res.access_token) {
          setAccessToken(res.access_token);
          setIsUnlocked(true);
          triggerUnboxing(res.access_token);
        }
      } catch (err: any) {
        const hint = getHintText();
        const msg = err.message || 'Incorrect password.';
        setPasswordError(`${msg} ${hint ? `Hint: ${hint}` : ''}`);
      } finally {
        setIsVerifying(false);
      }
      return;
    }

    if (password && trimmedInput === password.trim()) {
      setIsUnlocked(true);
      triggerUnboxing();
    } else {
      const hint = getHintText();
      setPasswordError(`Incorrect password. ${hint ? `Hint: ${hint}` : 'Please try again.'}`);
    }
  };

  const handleOpenClick = () => {
    if (isOpenAnimationStarted) return;

    if (isPasswordProtected && !isUnlocked) {
      if (passwordInput.trim()) {
        handlePasswordSubmit();
      } else {
        passwordInputRef.current?.focus();
      }
      return;
    }

    triggerUnboxing();
  };

  const getRibbonExtraStyles = () => {
    if (ribbonStyle === 'glowing') {
      return {
        boxShadow: `0 0 15px ${ribbonColor}, 0 0 30px ${ribbonColor}`,
      };
    }
    if (ribbonStyle === 'dotted') {
      return {
        borderStyle: 'dashed',
        borderWidth: '2px',
        borderColor: '#ffffff',
      };
    }
    return {};
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-6">
      <AnimatePresence mode="wait">
        {!isOpenAnimationStarted ? (
          <motion.div
            key="gift-box-idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, rotate: -5 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center space-y-6 max-w-full text-center"
          >
            {/* Header Greeting */}
            <div className="space-y-1.5 max-w-md">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
                <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                Digital Surprise Box
              </span>
              <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                {recipientName}, you've got a gift box ❤️
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-serif italic px-1">
                {isPasswordProtected && !isUnlocked
                  ? 'Enter password below to unwrap your gift'
                  : openingMessage}
              </p>
            </div>

            {/* 3D Interactive Parallax Cursor Tilt Gift Box */}
            <div
              className="perspective-1000 my-1 flex justify-center w-full max-w-full"
              onMouseMove={handleBoxMouseMove}
              onMouseLeave={handleBoxMouseLeave}
            >
              <motion.button
                type="button"
                onClick={handleOpenClick}
                style={{
                  transform: `rotateX(${boxTiltX}deg) rotateY(${boxTiltY}deg)`,
                  transformStyle: 'preserve-3d',
                  backgroundColor: boxBgColor,
                }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative cursor-pointer group w-36 sm:w-52 h-36 sm:h-52 rounded-2xl border-2 border-white/20 shadow-[0_12px_35px_-8px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden transition-transform duration-75 select-none"
              >
                {/* Dynamic Background Pattern Grid */}
                {pattern === 'stars' && (
                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:18px_18px]" />
                )}
                {pattern === 'dots' && (
                  <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#ffffff_2.5px,transparent_2.5px)] [background-size:14px_14px]" />
                )}
                {pattern === 'hearts' && (
                  <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle,#ffffff_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
                )}
                {pattern === 'stripes' && (
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, #ffffff, #ffffff 10px, transparent 10px, transparent 20px)',
                    }}
                  />
                )}

                {/* Vertical Ribbon */}
                <div
                  className="absolute inset-y-0 w-16 shadow-2xl border-x border-white/30 z-10"
                  style={{ backgroundColor: ribbonColor, ...getRibbonExtraStyles() }}
                />

                {/* Horizontal Ribbon */}
                <div
                  className="absolute inset-x-0 h-16 shadow-2xl border-y border-white/30 z-10"
                  style={{ backgroundColor: ribbonColor, ...getRibbonExtraStyles() }}
                />

                {/* Center Tied Satin Ribbon Bow */}
                <div className="relative z-20 flex flex-col items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  {/* Bow Loops */}
                  <div className="flex items-center justify-center -space-x-3">
                    <div
                      className="w-14 h-10 rounded-full border-2 border-white shadow-xl transform -rotate-12"
                      style={{ backgroundColor: ribbonColor, ...getRibbonExtraStyles() }}
                    />
                    <div
                      className="w-14 h-10 rounded-full border-2 border-white shadow-xl transform rotate-12"
                      style={{ backgroundColor: ribbonColor, ...getRibbonExtraStyles() }}
                    />
                  </div>
                  {/* Center Knot */}
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow-2xl -mt-5 z-30 flex items-center justify-center"
                    style={{ backgroundColor: ribbonColor }}
                  >
                    {isPasswordProtected && !isUnlocked ? (
                      <Lock className="h-4 w-4 text-white" />
                    ) : (
                      <Heart className="h-3.5 w-3.5 text-white fill-white" />
                    )}
                  </div>
                  {/* Ribbon Tails */}
                  <div className="flex justify-center gap-2 -mt-2">
                    <div
                      className="w-4 h-11 border-l border-white/40 transform -rotate-12 origin-top rounded-b-sm shadow-md"
                      style={{ backgroundColor: ribbonColor }}
                    />
                    <div
                      className="w-4 h-11 border-r border-white/40 transform rotate-12 origin-top rounded-b-sm shadow-md"
                      style={{ backgroundColor: ribbonColor }}
                    />
                  </div>
                </div>
              </motion.button>
            </div>

            {/* INLINE PASSWORD ENTRY FORM WHILE UNWRAPPING GIFT BOX */}
            {isPasswordProtected && !isUnlocked ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-pink-500/30 shadow-2xl backdrop-blur-xl space-y-4 text-center"
              >
                {/* Password Hint Card */}
                {getHintText() && (
                  <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-xs text-pink-200 flex items-center justify-center gap-2 font-mono">
                    <Key className="h-4 w-4 text-amber-400 shrink-0" />
                    <span><strong className="text-amber-300">Hint:</strong> {getHintText()}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <div className="space-y-2">
                    <input
                      ref={passwordInputRef}
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter password to unwrap..."
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 text-center tracking-widest font-mono shadow-inner"
                    />

                    {passwordError && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-center gap-1.5 font-medium">
                        <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                        <span>{passwordError}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 font-extrabold text-xs text-white shadow-xl shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer uppercase tracking-wider disabled:opacity-50"
                  >
                    {isVerifying ? 'Verifying...' : 'UNWRAP GIFT BOX 🎁'}
                  </button>
                </form>
              </motion.div>
            ) : (
              /* Action Subtext when not password protected or already unlocked */
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={handleOpenClick}
                  className="font-mono text-sm sm:text-base text-pink-300 tracking-widest lowercase hover:text-white transition-colors cursor-pointer animate-pulse"
                >
                  tap box to open ✨
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="gift-box-opening"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center space-y-4 py-12"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-pink-500/40 blur-3xl animate-pulse" />
              <Sparkles className="h-20 w-20 text-pink-400 animate-spin relative z-10" />
            </div>
            <h3 className="font-heading text-xl font-extrabold text-white tracking-widest uppercase">
              Unwrapping your gift for {recipientName}... ❤️
            </h3>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
