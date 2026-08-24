import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2, AlertCircle, ArrowRight, ShieldAlert, Key } from 'lucide-react';
import { fetchPublicGiftApi, verifyGiftPasswordApi, fetchUnlockedGiftApi, PublicGiftResponse } from '../services/giftService';
import { PublicGiftExperience } from '../components/recipient/PublicGiftExperience';

export const PublicGiftPage: React.FC = () => {
  const { public_id } = useParams<{ public_id: string }>();

  const [giftData, setGiftData] = useState<PublicGiftResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Password verification states
  const [isLocked, setIsLocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verifyingPwd, setVerifyingPwd] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!public_id) return;
    let mounted = true;

    fetchPublicGiftApi(public_id)
      .then((data) => {
        if (!mounted) return;
        setGiftData(data);
        setIsLocked(data.is_locked);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Gift not found or URL expired.');
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [public_id]);

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!public_id || !passwordInput) return;

    setVerifyingPwd(true);
    setPasswordError('');

    try {
      // Step 1: Verify password against server bcrypt hash (enforces rate-limiting)
      const { verified, access_token } = await verifyGiftPasswordApi(public_id, passwordInput);
      if (verified && access_token) {
        // Step 2: Retrieve full unlocked gift content using temporary access_token
        const unlockedData = await fetchUnlockedGiftApi(public_id, access_token);
        setGiftData(unlockedData);
        setIsLocked(false);
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Incorrect password.');
    } finally {
      setVerifyingPwd(false);
    }
  };

  // STEP 1: Loading Animation
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-2xl shadow-pink-500/30 mb-4"
        >
          <Loader2 className="h-8 w-8 animate-spin" />
        </motion.div>
        <p className="text-sm font-semibold text-slate-300">Unwrapping your digital surprise...</p>
      </div>
    );
  }

  // Error Page
  if (error || !giftData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center">
        <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="font-heading text-3xl font-bold mb-2 text-white">Gift Not Found</h1>
        <p className="text-slate-400 text-sm max-w-sm mb-6">
          This digital gift link may be incorrect, expired, or removed.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm shadow-lg shadow-pink-500/20"
        >
          <span>Create Your Own Gift</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Password Lock Screen (Floating & Levitating Layout)
  if (isLocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 relative overflow-hidden">
        {/* Floating Glowing Background Ambient Orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-pink-500/20 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none"
        />

        {/* FLOATING LEVITATING LOCK CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -12, 0],
            rotate: [0, 0.5, -0.5, 0],
          }}
          transition={{
            y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
            default: { duration: 0.5, ease: 'easeOut' },
          }}
          className="w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-pink-500/30 text-center shadow-2xl backdrop-blur-2xl relative z-10 space-y-4"
        >
          {/* Animated Floating Lock Icon */}
          <div className="mx-auto mb-1 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 text-white shadow-xl shadow-pink-500/30">
            <Lock className="h-8 w-8 animate-pulse" />
          </div>

          <span className="text-xs font-semibold text-pink-300 uppercase tracking-widest bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20 inline-block">
            Protected Digital Surprise
          </span>

          <div>
            <h2 className="font-heading text-2xl font-bold text-white mb-1">
              This surprise is protected ❤️
            </h2>
            <p className="text-xs text-slate-400">
              Enter the secret password set by the creator for {giftData.recipient_name}.
            </p>
          </div>

          {/* TAP TO VIEW PASSWORD HINT TOGGLE */}
          {giftData.password_hint && giftData.password_hint.trim() && (
            <div className="py-1">
              {!showHint ? (
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-rose-500/10 border border-pink-500/30 hover:border-pink-500/60 text-xs font-bold text-pink-300 flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-md hover:scale-[1.02] active:scale-95 group"
                >
                  <Key className="h-4 w-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                  <span className="font-mono">Tap to view Password Hint 👁️</span>
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setShowHint(false)}
                  className="p-3.5 rounded-2xl bg-pink-500/15 border border-pink-500/40 text-xs text-pink-200 flex items-center justify-between gap-2 font-mono shadow-md cursor-pointer hover:bg-pink-500/20 transition-all"
                  title="Tap to hide hint"
                >
                  <div className="flex items-center gap-2 text-left">
                    <Key className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>
                      <strong className="text-amber-300 font-sans">Password Hint:</strong> {giftData.password_hint.trim()}
                    </span>
                  </div>
                  <span className="text-[10px] text-pink-400 font-sans underline shrink-0">(Hide)</span>
                </motion.div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 text-center tracking-widest shadow-inner font-mono"
              />
              {passwordError && (
                <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-center gap-1.5 font-medium">
                  <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={verifyingPwd || !passwordInput}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 font-semibold text-sm text-white shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {verifyingPwd ? 'Verifying...' : 'Unlock'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Render Full 8-Stage Recipient Experience Flow
  return <PublicGiftExperience gift={giftData} />;
};
