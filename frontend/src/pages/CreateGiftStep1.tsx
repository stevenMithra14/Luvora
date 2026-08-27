import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cake, Heart, Sparkles, Flame, GraduationCap, PartyPopper, Gift, ArrowRight } from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import { WizardProgress } from '../components/wizard/WizardProgress';
import { LiveDevicePreview } from '../components/wizard/preview/LiveDevicePreview';

export const CreateGiftStep1: React.FC = () => {
  const navigate = useNavigate();
  const { data, setOccasion, nextStep } = useWizard();

  const primaryOccasions = [
    {
      id: 'birthday',
      title: 'Birthday',
      subtitle: 'Countdowns, photo gallery & festive tracks',
      icon: Cake,
      badge: 'Popular',
      color: 'from-pink-500 to-rose-500',
    },
    {
      id: 'love',
      title: 'Love & Romance',
      subtitle: 'Poetic letters, soft lighting & secret notes',
      icon: Heart,
      badge: 'Romantic',
      color: 'from-rose-500 to-purple-600',
    },
    {
      id: 'anniversary',
      title: 'Anniversary',
      subtitle: 'Timelines, milestones & memory boxes',
      icon: Flame,
      badge: 'Special',
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'friendship',
      title: 'Friendship',
      subtitle: 'Inside jokes, photo loops & surprises',
      icon: Sparkles,
      badge: 'Fun',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'graduation',
      title: 'Graduation',
      subtitle: 'Tributes, quotes & congratulations',
      icon: GraduationCap,
      color: 'from-sky-500 to-blue-600',
    },
    {
      id: 'celebration',
      title: 'Celebration',
      subtitle: 'Confetti, surprise buttons & cheers',
      icon: PartyPopper,
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  const featuredOccasion = {
    id: 'just_because',
    title: 'Just Because',
    subtitle: 'Spontaneous warm smiles, love notes & surprise moments for any ordinary day',
    icon: Gift,
    badge: 'Anytime Gift',
    color: 'from-fuchsia-500 to-pink-600',
  };

  const handleSelectOccasion = (id: string) => {
    setOccasion(id);
  };

  const handleContinue = () => {
    if (!data.occasion) return;
    nextStep();
    navigate('/create/person');
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between py-2 sm:py-4 px-3.5 sm:px-6 pb-32 sm:pb-12">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-start">
        {/* Progress Stepper */}
        <WizardProgress currentStep={1} />

        {/* 50-50 Split Desktop & Laptop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start flex-1 w-full">
          {/* LEFT 50%: Creator Form Section */}
          <div className="w-full lg:col-span-1 flex flex-col justify-start pr-1">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center lg:text-left max-w-xl mb-3"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                Step 1 of 5 &bull; Choose Occasion
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
                What are we celebrating today?
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm">
                Select an occasion to customize themes, countdowns, and interactive surprise moments.
              </p>
            </motion.div>

            {/* Occasions 2-Column Balanced Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-2.5">
              {primaryOccasions.map((occ) => {
                const IconComponent = occ.icon;
                const isSelected = data.occasion === occ.id;

                return (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => handleSelectOccasion(occ.id)}
                    className={`group relative flex flex-col justify-between text-left p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-br from-pink-500/20 via-rose-500/25 to-purple-600/20 border-pink-500 shadow-xl shadow-pink-500/20 ring-2 ring-pink-500/40 scale-[1.02]'
                        : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/95 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`h-8 w-8 rounded-xl flex items-center justify-center text-white bg-gradient-to-tr ${occ.color} shadow-md group-hover:scale-105 transition-transform`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      {occ.badge && (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30">
                          {occ.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-heading text-xs sm:text-sm font-bold text-white mb-0.5 group-hover:text-pink-300 transition-colors">
                        {occ.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-tight font-sans line-clamp-1">
                        {occ.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Featured Full-Span Card for "Just Because" */}
            {(() => {
              const IconComp = featuredOccasion.icon;
              const isSelected = data.occasion === featuredOccasion.id;

              return (
                <button
                  type="button"
                  onClick={() => handleSelectOccasion(featuredOccasion.id)}
                  className={`group relative flex items-center justify-between text-left p-3 px-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-500/20 via-rose-500/25 to-purple-600/20 border-pink-500 shadow-xl shadow-pink-500/20 ring-2 ring-pink-500/40 scale-[1.01]'
                      : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/95'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-white bg-gradient-to-tr ${featuredOccasion.color} shadow-md shrink-0`}>
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xs sm:text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                        {featuredOccasion.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-tight font-sans line-clamp-1">
                        {featuredOccasion.subtitle}
                      </p>
                    </div>
                  </div>

                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 shrink-0 hidden sm:inline-block">
                    {featuredOccasion.badge}
                  </span>
                </button>
              );
            })()}
          </div>

          {/* RIGHT 50%: Live Device Preview Container */}
          <div className="hidden lg:flex w-full lg:col-span-1 justify-center items-center">
            <LiveDevicePreview />
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="sticky bottom-0 z-40 py-3 sm:py-4 px-4 sm:px-10 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80">
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-medium text-slate-300 bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-slate-800 backdrop-blur-md shadow-md text-center">
            {data.occasion ? `Selected: ${data.occasion.toUpperCase()}` : 'Select an occasion above to proceed'}
          </span>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!data.occasion}
            className={`w-full sm:w-auto justify-center inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-bold text-white shadow-xl transition-all duration-300 cursor-pointer ${
              data.occasion
                ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <span>Continue</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
