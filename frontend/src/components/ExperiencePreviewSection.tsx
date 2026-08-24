import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Heart, Clock, Sparkles, Music, Calendar, CheckCircle2 } from 'lucide-react';

interface FeaturePreview {
  id: string;
  label: string;
  icon: React.ReactNode;
  tagline: string;
  title: string;
  description: string;
  previewCard: React.ReactNode;
}

export const ExperiencePreviewSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('love-letter');

  const features: FeaturePreview[] = [
    {
      id: 'love-letter',
      label: 'Love Letter',
      icon: <Heart className="h-4 w-4" />,
      tagline: 'Heartfelt Digital Stationery',
      title: 'Written Words That Feel Real',
      description: 'Poetic typography, delicate paper textures, custom fonts, and gentle letter-opening animations that make your words unforgettable.',
      previewCard: (
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/20 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="text-xs font-serif italic text-rose-300">To my dearest one...</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Forever & Always</span>
          </div>
          <p className="font-heading text-lg sm:text-2xl text-rose-100 italic leading-relaxed mb-6">
            "You are the quiet magic in every one of my favorite days. Here’s a digital place built just for us."
          </p>
          <div className="flex items-center justify-between text-xs text-rose-300/80">
            <span>With all my love, Steven</span>
            <Heart className="h-4 w-4 text-rose-400 fill-rose-400/40" />
          </div>
        </div>
      )
    },
    {
      id: 'photo-memories',
      label: 'Photo Memories',
      icon: <ImageIcon className="h-4 w-4" />,
      tagline: 'Interactive Memory Gallery',
      title: 'Every Memory Beautifully Framed',
      description: 'High-definition photo grids, polaroid-style captions, masonry layouts, and lightbox slideshows for your favorite captured moments.',
      previewCard: (
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="h-28 rounded-xl bg-gradient-to-tr from-pink-500/20 to-rose-500/30 border border-pink-500/20 flex flex-col justify-end p-3 relative group">
              <span className="text-[11px] font-medium text-pink-200">Beach Sunset 2025</span>
            </div>
            <div className="h-28 rounded-xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/30 border border-purple-500/20 flex flex-col justify-end p-3 relative group">
              <span className="text-[11px] font-medium text-purple-200">First Coffee Together</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5 text-pink-400" /> 12 High-Res Memories</span>
            <span className="text-pink-300 font-semibold">Tap to Expand</span>
          </div>
        </div>
      )
    },
    {
      id: 'countdown',
      label: 'Countdown',
      icon: <Clock className="h-4 w-4" />,
      tagline: 'Live Event Timers',
      title: 'Build Anticipation Together',
      description: 'Dynamic live countdown clock ticking down to birthdays, anniversaries, reunions, or surprise reveal moments.',
      previewCard: (
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/20 shadow-2xl text-center">
          <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-3">
            Maya's 25th Birthday In
          </div>
          <div className="grid grid-cols-4 gap-2 mb-6 max-w-sm mx-auto">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30">
              <div className="font-heading text-2xl font-bold text-amber-200">03</div>
              <div className="text-[10px] text-slate-400">DAYS</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30">
              <div className="font-heading text-2xl font-bold text-amber-200">14</div>
              <div className="text-[10px] text-slate-400">HOURS</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30">
              <div className="font-heading text-2xl font-bold text-amber-200">22</div>
              <div className="text-[10px] text-slate-400">MINS</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30">
              <div className="font-heading text-2xl font-bold text-amber-200">58</div>
              <div className="text-[10px] text-slate-400">SECS</div>
            </div>
          </div>
          <div className="text-xs text-amber-300/90 italic">
            "Counting every second until we celebrate!"
          </div>
        </div>
      )
    },
    {
      id: 'interactive',
      label: 'Interactive Surprise',
      icon: <Sparkles className="h-4 w-4" />,
      tagline: 'Scratch Cards & Custom Quizzes',
      title: 'Fun Playful Mini-Games',
      description: 'Engage your recipient with digital scratch cards, personalized friendship trivia quizzes, and password-protected secret gifts.',
      previewCard: (
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-950 border border-purple-500/20 shadow-2xl">
          <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
            Interactive Quiz #1
          </div>
          <div className="font-heading text-lg font-bold text-white mb-4">
            "Where did we have our very first date?"
          </div>
          <div className="space-y-2 mb-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-between">
              <span>A) The Rooftop Cafe</span>
              <CheckCircle2 className="h-4 w-4 text-purple-400" />
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <span>B) The Central Park Picnic</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'music',
      label: 'Custom Music',
      icon: <Music className="h-4 w-4" />,
      tagline: 'Ambient Soundtracks',
      title: 'Set the Perfect Emotional Tone',
      description: 'Attach background acoustic melodies, favorite songs, or custom voice messages that play softly as they read your gift.',
      previewCard: (
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-sky-950/30 via-slate-900 to-slate-950 border border-sky-500/20 shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Music className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Our Favorite Song.mp3</div>
              <div className="text-xs text-sky-300">Playing in background</div>
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-sky-400 to-blue-500" />
          </div>
        </div>
      )
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: <Calendar className="h-4 w-4" />,
      tagline: 'Memory Journey Map',
      title: 'Walk Down Memory Lane',
      description: 'Chronological milestone maps highlighting key dates, first meetings, trips, and major shared life events.',
      previewCard: (
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 border border-emerald-500/20 shadow-2xl">
          <div className="space-y-4 border-l-2 border-emerald-500/30 pl-4">
            <div>
              <div className="text-[11px] font-mono text-emerald-400 font-semibold">JUNE 2021</div>
              <div className="text-sm font-bold text-white">The Day We Met</div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-emerald-400 font-semibold">AUGUST 2023</div>
              <div className="text-sm font-bold text-white">First Road Trip Together</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentFeature = features.find((f) => f.id === activeTab) || features[0];

  return (
    <section id="about" className="relative py-20 md:py-32 bg-transparent">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-semibold tracking-widest text-pink-400 uppercase bg-pink-500/10 px-3.5 py-1.5 rounded-full border border-pink-500/20">
            About Luvora & Rich Features
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white mt-4 mb-4">
            Crafting Unforgettable Experiences
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Combine text, music, photos, interactive surprises, and custom themes into a single magical web link.
          </p>
        </div>

        {/* Feature Tabs Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveTab(feature.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                activeTab === feature.id
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20 scale-105'
                  : 'bg-slate-900/80 text-slate-400 border border-pink-500/20 hover:text-pink-300 hover:border-pink-500/40'
              }`}
            >
              {feature.icon}
              <span>{feature.label}</span>
            </button>
          ))}
        </div>

        {/* Active Feature Display Card */}
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFeature.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-pink-500/20 bg-slate-900/40 p-8 sm:p-12 backdrop-blur-xl shadow-xl shadow-pink-500/5"
            >
              {/* Feature Content Info */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <span className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-2">
                  {currentFeature.tagline}
                </span>
                <h3 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
                  {currentFeature.title}
                </h3>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                  {currentFeature.description}
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-pink-300">
                  <Sparkles className="h-4 w-4 text-pink-400" />
                  <span>Available in all Luvora gifts for free</span>
                </div>
              </div>

              {/* Feature Visual Preview Card */}
              <div className="lg:col-span-6">
                {currentFeature.previewCard}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
