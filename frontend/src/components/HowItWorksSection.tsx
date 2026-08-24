import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Heart, Share2 } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Create',
      subtitle: 'Pick a Theme & Occasion',
      description: 'Choose from crafted visual styles—romantic blush, starry midnight, warm parchment, or birthday confetti.',
      icon: <Palette className="h-6 w-6 text-pink-400" />,
      gradient: 'from-pink-500/20 to-rose-500/10'
    },
    {
      number: '02',
      title: 'Personalize',
      subtitle: 'Add Photos, Notes & Songs',
      description: 'Write your heartfelt message, upload cherished photos, set a background song, and add interactive quizzes or scratch cards.',
      icon: <Heart className="h-6 w-6 text-purple-400 fill-purple-400/20" />,
      gradient: 'from-purple-500/20 to-indigo-500/10'
    },
    {
      number: '03',
      title: 'Share',
      subtitle: 'Send a Secret Link',
      description: 'Publish your gift instantly for free. Share the private link with your special someone and watch their face light up.',
      icon: <Share2 className="h-6 w-6 text-sky-400" />,
      gradient: 'from-sky-500/20 to-blue-500/10'
    }
  ];

  return (
    <section id="how-it-works" className="relative py-20 md:py-32 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[450px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/5 blur-[140px]" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <span className="text-xs font-semibold tracking-widest text-pink-400 uppercase bg-pink-500/10 px-3.5 py-1.5 rounded-full border border-pink-500/20">
            Simple 3-Step Process
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white mt-4 mb-4">
            How Luvora Works
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Creating a unforgettable digital memory takes less than 2 minutes. No design skills required.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-12 right-12 h-0.5 bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-sky-500/30 -translate-y-8 -z-10" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeOut' }}
              className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-slate-900/60 border border-pink-500/20 backdrop-blur-xl group hover:border-pink-500/40 transition-colors shadow-lg shadow-pink-500/5"
            >
              {/* Step Number Badge */}
              <div className="relative mb-6">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-tr ${step.gradient} border border-pink-500/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                </div>
                <span className="absolute -top-3 -right-3 font-heading text-xs font-black px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white border border-pink-400/40 shadow-md">
                  {step.number}
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="font-heading text-2xl font-bold text-white mb-1">
                {step.title}
              </h3>
              <div className="text-xs font-medium text-pink-400 mb-3">
                {step.subtitle}
              </div>

              {/* Description */}
              <p className="text-sm text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
