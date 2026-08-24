import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, User, Calendar, Sparkles } from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import { WizardProgress } from '../components/wizard/WizardProgress';
import { LiveDevicePreview } from '../components/wizard/preview/LiveDevicePreview';

export const CreateGiftStep2: React.FC = () => {
  const navigate = useNavigate();
  const { data, setCustomization, nextStep, prevStep } = useWizard();

  useEffect(() => {
    if (!data.occasion) {
      navigate('/create');
    }
  }, [data.occasion, navigate]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomization({ recipientName: e.target.value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomization({ recipientDate: e.target.value });
  };

  const handleUnknownYearToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomization({ dontKnowYear: e.target.checked });
  };

  const isNameValid = data.recipientName.trim().length >= 2;

  const handleContinue = () => {
    if (!isNameValid) return;
    nextStep();
    navigate('/create/customize');
  };

  const handleBack = () => {
    prevStep();
    navigate('/create');
  };

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col justify-between py-2 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center my-auto">
        {/* Progress Stepper */}
        <WizardProgress currentStep={2} />

        {/* 50-50 Split Desktop & Laptop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center flex-1 my-auto w-full">
          {/* LEFT 50%: Form Controls Column */}
          <div className="w-full lg:col-span-1 flex flex-col justify-center max-h-[calc(100vh-9.5rem)] overflow-y-auto pr-1">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center lg:text-left max-w-xl mb-4"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                Step 2 of 5 &bull; Recipient Info
              </span>
              <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight text-white mb-1">
                Who is this for?
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm">
                Tell us a little about the person you're creating this digital surprise for.
              </p>
            </motion.div>

            {/* Ultra Bright Form Inputs Container */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5 p-6 sm:p-7 rounded-3xl bg-slate-900/90 border-2 border-pink-500/40 backdrop-blur-2xl mb-4 shadow-2xl shadow-pink-500/15"
            >
              {/* Recipient Name Field */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-pink-300 mb-2 flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-pink-500/20 text-pink-400">
                    <User className="h-4 w-4" />
                  </div>
                  <span>Recipient Name <span className="text-pink-400">*</span></span>
                </label>
                <input
                  type="text"
                  value={data.recipientName}
                  onChange={handleNameChange}
                  placeholder="e.g. Steven, Sarah, Alex..."
                  maxLength={50}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-800/90 border-2 border-pink-500/50 text-sm font-semibold text-white placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/40 transition-all shadow-md shadow-pink-500/5"
                />
              </div>

              {/* Important Date Field */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-sky-300 mb-2 flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-sky-500/20 text-sky-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span>Important Date (Optional)</span>
                </label>
                <input
                  type="date"
                  value={data.recipientDate}
                  onChange={handleDateChange}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-800/90 border-2 border-pink-500/50 text-sm font-semibold text-white focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/40 transition-all shadow-md shadow-pink-500/5"
                />
              </div>

              {/* Ultra Bright High Contrast Option Card for "I don't know the year" */}
              <label
                htmlFor="dontKnowYear"
                className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none ${
                  data.dontKnowYear
                    ? 'bg-gradient-to-r from-pink-500/35 via-rose-500/25 to-purple-500/35 border-pink-400 text-white shadow-xl shadow-pink-500/25 scale-[1.01]'
                    : 'bg-slate-800/80 border-pink-500/40 text-slate-100 hover:border-pink-400 hover:bg-pink-500/20 shadow-md'
                }`}
              >
                <input
                  type="checkbox"
                  id="dontKnowYear"
                  checked={data.dontKnowYear}
                  onChange={handleUnknownYearToggle}
                  className="h-5.5 w-5.5 rounded-lg border-2 border-pink-400 bg-slate-900 text-pink-500 accent-pink-500 focus:ring-2 focus:ring-pink-400/50 cursor-pointer shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-pink-300 animate-pulse" />
                    I don't know the exact year
                  </span>
                  <span className="text-xs text-pink-200 font-semibold mt-0.5">
                    Track only day & month (ideal for annual birthdays & anniversaries)
                  </span>
                </div>
              </label>
            </motion.div>
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
            disabled={!isNameValid}
            className={`inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-bold text-white shadow-lg transition-all duration-300 cursor-pointer ${
              isNameValid
                ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 active:scale-95'
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
