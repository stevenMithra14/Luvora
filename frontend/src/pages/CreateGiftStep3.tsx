import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Layout, Palette, Type, Image as ImageIcon, Gift, PartyPopper, ChevronRight, Eye } from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import { WizardProgress } from '../components/wizard/WizardProgress';
import { CoverControls } from '../components/wizard/editor/CoverControls';
import { MessageControls } from '../components/wizard/editor/MessageControls';
import { ThemeControls } from '../components/wizard/editor/ThemeControls';
import { TypographyControls } from '../components/wizard/editor/TypographyControls';
import { BackgroundControls } from '../components/wizard/editor/BackgroundControls';
import { AnimationControls } from '../components/wizard/editor/AnimationControls';
import { GiftBoxConfigurator } from '../components/wizard/customizers/GiftBoxConfigurator';
import { CakeConfigurator } from '../components/wizard/customizers/CakeConfigurator';
import { LiveDevicePreview } from '../components/wizard/preview/LiveDevicePreview';
import { MobileGiftPreviewModal } from '../components/wizard/preview/MobileGiftPreviewModal';

export const CreateGiftStep3: React.FC = () => {
  const navigate = useNavigate();
  const { data, nextStep, prevStep } = useWizard();

  const [activeTab, setActiveTab] = useState<'box' | 'cake' | 'cover' | 'message' | 'theme' | 'typography' | 'background' | 'animation'>('box');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data.occasion) {
      navigate('/create');
    }
  }, [data.occasion, navigate]);

  const handleContinue = () => {
    nextStep();
    navigate('/create/memories');
  };

  const handleBack = () => {
    prevStep();
    navigate('/create/person');
  };

  const handleTabClick = (tabId: typeof activeTab, e: React.MouseEvent<HTMLButtonElement>) => {
    setActiveTab(tabId);
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const tabs = [
    { id: 'box', label: 'Gift Box', icon: Gift },
    { id: 'cake', label: 'Cake', icon: PartyPopper },
    { id: 'cover', label: 'Cover', icon: Layout },
    { id: 'message', label: 'Message', icon: Type },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'typography', label: 'Font', icon: Type },
    { id: 'background', label: 'Background', icon: ImageIcon },
    { id: 'animation', label: 'Animation', icon: Sparkles },
  ] as const;

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between py-2 sm:py-4 px-3.5 sm:px-6 pb-32 sm:pb-12">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-start">
        {/* Progress Stepper */}
        <WizardProgress currentStep={3} />

        {/* 50-50 Split Desktop & Laptop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start flex-1 w-full">
          {/* LEFT 50%: Controls Column */}
          <div className="w-full lg:col-span-1 space-y-3 pr-1">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center lg:text-left"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                Step 3 of 5 &bull; Customization
              </span>
              <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight text-white mb-1">
                Customize the Experience
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm">
                Fine-tune the gift box, birthday cake, lighting, typography, and interactive theme.
              </p>
            </motion.div>

            {/* Customization Category Tabs Bar with Horizontal Scroll Cues */}
            <div className="relative group">
              {/* Category Buttons Track */}
              <div
                ref={tabsRef}
                className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800 scroll-smooth pr-10"
              >
                {tabs.map((tab) => {
                  const IconComp = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={(e) => handleTabClick(tab.id as any, e)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25 scale-105'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <IconComp className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Edge Fade Mask + Scroll Indicator Hint Icon */}
              <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent pointer-events-none flex items-center justify-end pr-1">
                <ChevronRight className="h-4 w-4 text-pink-400 animate-pulse" />
              </div>
            </div>

            {/* Active Control Body Box */}
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-xl max-h-[440px] overflow-y-auto">
              {activeTab === 'box' && <GiftBoxConfigurator />}
              {activeTab === 'cake' && <CakeConfigurator />}
              {activeTab === 'cover' && <CoverControls />}
              {activeTab === 'message' && <MessageControls />}
              {activeTab === 'theme' && <ThemeControls />}
              {activeTab === 'typography' && <TypographyControls />}
              {activeTab === 'background' && <BackgroundControls />}
              {activeTab === 'animation' && <AnimationControls />}
            </div>
          </div>

          {/* RIGHT 50%: Live Device Preview */}
          <div className="hidden lg:flex w-full lg:col-span-1 justify-center items-center">
            <LiveDevicePreview />
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="sticky bottom-0 z-40 py-3 sm:py-4 px-4 sm:px-10 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80">
        <div className="w-full max-w-7xl mx-auto flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-5 py-3 rounded-full border border-slate-800 bg-slate-900/90 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg backdrop-blur-md"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowMobilePreview(true)}
              className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-5 py-3 rounded-full border border-pink-500/40 bg-pink-500/10 text-xs font-bold text-pink-300 hover:bg-pink-500/20 hover:text-white transition-all cursor-pointer shadow-md"
            >
              <Eye className="h-4 w-4 text-pink-400" />
              <span>👀 Preview Gift</span>
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="w-full sm:w-auto justify-center inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-300"
            >
              <span>Continue to Memories</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Mobile Gift Preview Modal */}
      <MobileGiftPreviewModal
        isOpen={showMobilePreview}
        onClose={() => setShowMobilePreview(false)}
      />
    </div>
  );
};

