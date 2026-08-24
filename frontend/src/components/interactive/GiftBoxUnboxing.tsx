import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Lock, Key, ShieldAlert, X } from 'lucide-react';
import { GiftBoxConfig } from '../../context/WizardContext';

interface GiftBoxUnboxingProps {
  config?: GiftBoxConfig;
  recipientName?: string;
  password?: string;
  passwordHint?: string;
  onOpenComplete: () => void;
}

export const GiftBoxUnboxing: React.FC<GiftBoxUnboxingProps> = ({
  config,
  recipientName = 'Someone Special',
  password,
  passwordHint,
  onOpenComplete,
}) => {
  const [isOpenAnimationStarted, setIsOpenAnimationStarted] = useState(false);
  const [boxTiltX, setBoxTiltX] = useState(0);
  const [boxTiltY, setBoxTiltY] = useState(0);

  // Password Gate Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const isPasswordProtected = Boolean(password && typeof password === 'string' && password.trim().length > 0);
  const [isUnlocked, setIsUnlocked] = useState(!isPasswordProtected);

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

  const handleOpenClick = () => {
    if (isOpenAnimationStarted) return;

    if (isPasswordProtected && !isUnlocked) {
      setShowPasswordModal(true);
      setPasswordError('');
      return;
    }

    triggerUnboxing();
  };

  const triggerUnboxing = () => {
    setIsOpenAnimationStarted(true);
    setTimeout(() => {
      onOpenComplete();
    }, 1200);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordInput || !passwordInput.trim()) {
      setPasswordError('Please enter password');
      return;
    }

    if (passwordInput.trim() === password?.trim()) {
      setIsUnlocked(true);
      setShowPasswordModal(false);
      triggerUnboxing();
    } else {
      const hint = getHintText();
      setPasswordError(`Incorrect password. ${hint ? `Hint: ${hint}` : 'Please try again.'}`);
    }
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
    <div className="w-full max-w-full flex flex-col items-center justify-center p-2 sm:p-4 text-center select-none relative overflow-hidden bg-[#0a0a0f] rounded-2xl border border-slate-800 shadow-2xl">
      <AnimatePresence mode="wait">
        {!isOpenAnimationStarted ? (
          <motion.div
            key="gift-box-closed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center space-y-2 sm:space-y-4 max-w-full mx-auto py-1"
          >
            {/* Header Title & Subtitle */}
            <div className="space-y-1 w-full max-w-full px-1">
              <h2 className="font-serif italic text-base sm:text-2xl text-pink-200 font-normal tracking-tight drop-shadow-md leading-tight break-words max-w-full">
                you've got a gift box
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 font-mono tracking-tight px-1 break-words">
                {isPasswordProtected && !isUnlocked
                  ? '🔒 Password Protected Gift • Tap box to enter password'
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

            {/* Action Subtext below box */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={handleOpenClick}
                className="font-mono text-sm sm:text-base text-pink-300 tracking-widest lowercase hover:text-white transition-colors cursor-pointer animate-pulse"
              >
                {isPasswordProtected && !isUnlocked ? '🔒 enter password to unlock ✨' : 'tap box to open ✨'}
              </button>
            </div>
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

      {/* PASSWORD GATE MODAL BEFORE OPENING GIFT BOX */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900 border border-pink-500/40 shadow-2xl text-center space-y-5 text-white relative"
            >
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30">
                <Lock className="h-7 w-7" />
              </div>

              <div className="space-y-1">
                <h3 className="font-heading text-xl font-extrabold text-white">
                  Enter Password to Unlock Gift
                </h3>
                <p className="text-xs text-slate-300">
                  This digital surprise for <span className="text-pink-300 font-bold">{recipientName}</span> is protected.
                </p>
              </div>

              {/* Password Hint Card */}
              {getHintText() && (
                <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-xs text-pink-200 flex items-center justify-center gap-2 font-mono">
                  <Key className="h-4 w-4 text-pink-400 shrink-0" />
                  <span><strong className="text-amber-300">Password Hint:</strong> {getHintText()}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-1">
                <div className="space-y-2">
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter password..."
                    autoFocus
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 text-center tracking-widest font-mono"
                  />

                  {passwordError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-center gap-1.5 font-medium">
                      <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 font-extrabold text-xs text-white shadow-xl shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Unlock & Open Gift 🎁
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-5 py-3.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
