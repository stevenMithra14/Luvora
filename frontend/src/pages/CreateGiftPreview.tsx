import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Key, Eye, EyeOff, Send, Sparkles, AlertCircle } from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import { WizardProgress } from '../components/wizard/WizardProgress';
import { LiveDevicePreview } from '../components/wizard/preview/LiveDevicePreview';
import { PublishSuccessModal } from '../components/wizard/preview/PublishSuccessModal';
import { publishGiftApi } from '../services/giftService';

export const CreateGiftPreview: React.FC = () => {
  const navigate = useNavigate();
  const { data, setCustomization } = useWizard();

  const [isPublic, setIsPublic] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccessData, setPublishSuccessData] = useState<{ publicId: string; editToken: string } | null>(null);
  const [apiError, setApiError] = useState<string>('');

  useEffect(() => {
    if (!data.occasion) {
      navigate('/create');
    }
  }, [data.occasion, navigate]);

  const handlePublish = async () => {
    if (!agreedToTerms) {
      setApiError('Please agree to the Terms of Service and Privacy Policy to proceed.');
      return;
    }

    setIsPublishing(true);
    setApiError('');

    try {
      const hasPassword = Boolean(data.password && data.password.trim());
      const sanitizedData = {
        ...data,
        recipientName: data.recipientName.trim() || 'Someone Special',
        title: data.title || data.coverTitle || 'A Special Gift For You',
        password_enabled: hasPassword,
      };

      const res = await publishGiftApi(sanitizedData);
      setPublishSuccessData({
        publicId: res.public_id,
        editToken: res.edit_token,
      });
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || err?.detail || 'Failed to publish gift. Please try again.';
      setApiError(typeof msg === 'string' ? msg : 'Failed to publish gift.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleBack = () => {
    navigate('/create/interactive');
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between py-2 sm:py-4 px-3.5 sm:px-6 pb-32 sm:pb-12">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-start">
        {/* Progress Stepper */}
        <WizardProgress currentStep={5} />

        {/* 50-50 Split Desktop & Laptop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start flex-1 w-full">
          {/* LEFT 50%: Password, Hint, Terms & Publish Section */}
          <div className="w-full lg:col-span-1 space-y-4 pr-1">
            {/* Header */}
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                Step 5 of 5 &bull; Gift Security & Delivery
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white mb-1">
                Gift Security & Details
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm">
                Set optional password protection, add a hint for your recipient, and publish your gift.
              </p>
            </div>

            {/* PASSWORD CARD PANEL */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                PASSWORD & SECURITY
              </span>

              {/* Public Letter Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white">Public letter</h4>
                  <p className="text-[11px] text-slate-400">
                    {data.password && data.password.trim()
                      ? 'Access password & hint are active. Recipient must enter password to open gift.'
                      : isPublic
                      ? 'Anyone with the link can view without a password.'
                      : 'Requires password to view gift experience.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isPublic ? 'bg-pink-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isPublic ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Access Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-pink-400" />
                  <span>Access Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={data.password || ''}
                    onChange={(e) => setCustomization({ password: e.target.value })}
                    placeholder="Enter password to lock gift (optional)..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Hint Input */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-amber-400" />
                  <span>Password Hint for Recipient</span>
                </label>
                <input
                  type="text"
                  value={data.passwordHint || ''}
                  onChange={(e) => setCustomization({ passwordHint: e.target.value })}
                  placeholder={
                    data.password
                      ? `Hint preview: ${data.password.length} chars (starts with "${data.password[0]}")`
                      : 'e.g. Our anniversary year or favorite nickname'
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  This hint will be displayed on the gift box to help your recipient open it.
                </p>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-700 text-pink-500 focus:ring-pink-500 accent-pink-500"
                />
                <div className="text-xs text-slate-300">
                  <span>I agree to the </span>
                  <span className="text-pink-400 underline font-semibold">Terms of Service</span>
                  <span> and the </span>
                  <span className="text-pink-400 underline font-semibold">Privacy Policy</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    By creating your tribute, you agree to our terms and privacy practices.
                  </p>
                </div>
              </label>
            </div>

            {/* Error Notification */}
            {apiError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}
          </div>

          {/* RIGHT 50%: Phone & Laptop Device Preview */}
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

          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className={`w-full sm:w-auto justify-center inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white shadow-xl transition-all duration-300 cursor-pointer ${
              isPublishing
                ? 'bg-slate-800 opacity-60 cursor-wait'
                : 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105 active:scale-95'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>{isPublishing ? 'Publishing...' : 'Send Gift Now'}</span>
          </button>
        </div>
      </div>

      {/* Publish Success Modal */}
      {publishSuccessData && (
        <PublishSuccessModal
          isOpen={Boolean(publishSuccessData)}
          publicId={publishSuccessData.publicId}
          editToken={publishSuccessData.editToken}
          onClose={() => setPublishSuccessData(null)}
        />
      )}
    </div>
  );
};
