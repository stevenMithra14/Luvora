import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { fetchPublicGiftApi, PublicGiftResponse } from '../services/giftService';
import { PublicGiftExperience } from '../components/recipient/PublicGiftExperience';

export const PublicGiftPage: React.FC = () => {
  const params = useParams<{ public_id?: string; publicId?: string }>();
  const activePublicId = params.public_id || params.publicId;

  const [giftData, setGiftData] = useState<PublicGiftResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activePublicId) return;
    let mounted = true;

    fetchPublicGiftApi(activePublicId)
      .then((data) => {
        if (!mounted) return;
        setGiftData(data);
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
  }, [activePublicId]);

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

  // Render Full Recipient Experience Flow (Password gate is handled directly when tapping on the gift box)
  return <PublicGiftExperience gift={giftData} />;
};
