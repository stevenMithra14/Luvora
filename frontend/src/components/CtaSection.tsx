import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CtaSection: React.FC = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-transparent">
      {/* Glow Effects */}
      <div className="pointer-events-none absolute -bottom-24 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-pink-600/20 via-rose-500/15 to-purple-600/10 blur-[130px]" />

      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-10 sm:p-16 text-center backdrop-blur-2xl shadow-2xl shadow-pink-500/10"
        >
          {/* Top Heart Badge */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30">
            <Heart className="h-7 w-7 fill-white/20" />
          </div>

          {/* Headline */}
          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Someone special is waiting for a little magic.
          </h2>

          {/* Subtext */}
          <p className="mx-auto max-w-xl text-base sm:text-lg text-slate-300/90 mb-8 leading-relaxed">
            Create a personalized digital card or memory experience in minutes. Free forever with no ads or subscriptions.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/create"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-9 py-4 text-base font-semibold text-white shadow-xl shadow-pink-500/30 transition-all duration-300 hover:shadow-pink-500/45 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span>Create Something Beautiful</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Free Badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-pink-400" />
            <span>No account required to start &bull; 100% Free Forever</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
