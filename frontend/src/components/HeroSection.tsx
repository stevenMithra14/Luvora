import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ArrowRight, Play, Gift, Music, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  return (
    <section id="create" className="relative overflow-hidden py-16 md:py-28 lg:py-36">
      {/* Background Ambient Glow Spheres */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-pink-600/20 via-rose-500/15 to-purple-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/2 -left-32 -z-10 h-[350px] w-[350px] rounded-full bg-purple-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-10 -right-32 -z-10 h-[350px] w-[350px] rounded-full bg-pink-500/10 blur-[120px]" />

      <div className="mx-auto max-w-5xl text-center px-4 sm:px-6">
        {/* Top Tagline Pill */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-xs font-semibold text-pink-300 backdrop-blur-md mb-8 shadow-inner shadow-pink-500/10"
        >
          <Sparkles className="h-3.5 w-3.5 text-pink-400 animate-pulse" />
          <span>Free Digital Memories & Personalized Gifts</span>
        </motion.div>

        {/* Hero Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="font-heading text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.15] mb-6"
        >
          Turn Your Feelings Into <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300 bg-clip-text text-transparent italic font-serif">
            Something They Can Keep.
          </span>
        </motion.h1>

        {/* Supporting Text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="mx-auto max-w-2xl text-base sm:text-xl text-slate-300/90 font-normal leading-relaxed mb-10"
        >
          Create a beautiful digital surprise for someone special. Personalized love letters, memory photo boxes, birthday countdowns, and interactive moments—100% free.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5"
        >
          <Link
            to="/create"
            className="group relative flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-pink-500/25 transition-all duration-300 hover:shadow-pink-500/40 hover:scale-[1.03] active:scale-[0.98]"
          >
            <span>Create Your Gift</span>
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <a
            href="#occasions"
            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full border border-pink-500/30 bg-slate-900/80 backdrop-blur-md px-7 py-4 text-base font-semibold text-slate-200 shadow-md transition-all duration-300 hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-pink-300"
          >
            <Play className="h-4.5 w-4.5 text-pink-400 fill-pink-400/20" />
            <span>Explore Occasions</span>
          </a>
        </motion.div>

        {/* Floating Feature Preview Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          className="mt-16 sm:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left"
        >
          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-rose-500/10 border border-pink-500/25 backdrop-blur-md flex items-center gap-3 shadow-md">
            <div className="h-10 w-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0 shadow-inner">
              <Heart className="h-5 w-5 fill-pink-500/20" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">Love Letters</div>
              <div className="text-[11px] text-pink-400/90 font-medium">Heartfelt notes</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-purple-500/10 border border-rose-500/25 backdrop-blur-md flex items-center gap-3 shadow-md">
            <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">Photo Galleries</div>
              <div className="text-[11px] text-rose-400/90 font-medium">Cherished memories</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-pink-500/10 border border-purple-500/25 backdrop-blur-md flex items-center gap-3 shadow-md">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">Interactive Quiz</div>
              <div className="text-[11px] text-purple-400/90 font-medium">Custom surprises</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-purple-500/10 border border-sky-500/25 backdrop-blur-md flex items-center gap-3 shadow-md">
            <div className="h-10 w-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 shadow-inner">
              <Music className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">Custom Music</div>
              <div className="text-[11px] text-sky-400/90 font-medium">Background sound</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
