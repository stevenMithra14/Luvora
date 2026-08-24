import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import { WizardProgress } from '../components/wizard/WizardProgress';
import { MemoryEditor } from '../components/wizard/editor/MemoryEditor';
import { AudioUploader } from '../components/wizard/memories/AudioUploader';
import { LiveDevicePreview } from '../components/wizard/preview/LiveDevicePreview';

export const CreateGiftStep4: React.FC = () => {
  const navigate = useNavigate();
  const { data, nextStep, prevStep } = useWizard();

  useEffect(() => {
    if (!data.occasion) {
      navigate('/create');
    }
  }, [data.occasion, navigate]);

  const handleContinue = () => {
    nextStep();
    navigate('/create/goodies');
  };

  const handleBack = () => {
    prevStep();
    navigate('/create/customize');
  };

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col justify-between py-2 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center my-auto">
        {/* Progress Stepper */}
        <WizardProgress currentStep={4} />

        {/* 50-50 Split Desktop & Laptop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center flex-1 my-auto w-full">
          {/* LEFT 50%: Controls Column */}
          <div className="w-full lg:col-span-1 space-y-3 max-h-[calc(100vh-9.5rem)] overflow-y-auto pr-1">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center lg:text-left max-w-xl mb-3"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                Step 4 of 5 &bull; Memories & Sound
              </span>
              <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight text-white mb-1">
                Photo & Video Memories Album
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm">
                Upload photos and videos, select frame styles, add timeline captions, and pick a background music track.
              </p>
            </motion.div>

            <MemoryEditor />
            <AudioUploader />
          </div>

          {/* RIGHT 50%: Live Device Preview */}
          <div className="hidden lg:flex w-full lg:col-span-1 justify-center items-center">
            <LiveDevicePreview />
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="sticky bottom-0 z-40 -mx-4 -mb-4 px-6 py-3 bg-slate-950/90 border-t border-slate-800/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-800 bg-slate-900/80 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center gap-2.5 px-8 py-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-300"
          >
            <span>Continue to Digital Goodies</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

