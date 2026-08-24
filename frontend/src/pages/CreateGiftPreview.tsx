import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Key, Eye, EyeOff, Send, Sparkles, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import { LiveDevicePreview } from '../components/wizard/preview/LiveDevicePreview';
import { PublishSuccessModal } from '../components/wizard/preview/PublishSuccessModal';
import { publishGiftApi } from '../services/giftService';

export const CreateGiftPreview: React.FC = () => {
  const navigate = useNavigate();
  const { data, setCustomization, setOccasion } = useWizard();

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
    if (!data.password || !data.password.trim()) {
      setApiError('Please enter password to lock and secure your gift before sending.');
      return;
    }

    if (!agreedToTerms) {
      setApiError('Please agree to the Terms of Service and Privacy Policy to proceed.');
      return;
    }

    setIsPublishing(true);
    setApiError('');

    try {
      // Ensure recipient name has a fallback so backend validation never rejects
      const sanitizedData = {
        ...data,
        recipientName: data.recipientName.trim() || 'Someone Special',
        title: data.title || data.coverTitle || 'A Special Gift For You',
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

  const occasions = [
    { id: 'birthday', label: '🎂 Birthday' },
    { id: 'love', label: '❤️ Love & Romance' },
    { id: 'anniversary', label: '🔥 Anniversary' },
    { id: 'friendship', label: '✨ Friendship' },
    { id: 'graduation', label: '🎓 Graduation' },
    { id: 'celebration', label: '🎉 Celebration' },
    { id: 'just_because', label: '🎁 Just Because' },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col justify-between bg-slate-950 text-white overflow-hidden">
      {/* 1. Top Navigation & Segmented Progress Header */}
      <header className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md flex items-center justify-between gap-4">
        {/* Left Badges */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>HOME</span>
          </button>
        </div>

        {/* Center/Right Segmented Pink Progress Lines */}
        <div className="flex-1 max-w-xl mx-4 flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-pink-500 shadow-sm shadow-pink-500/40" />
          <div className="h-1.5 flex-1 rounded-full bg-pink-500 shadow-sm shadow-pink-500/40" />
          <div className="h-1.5 flex-1 rounded-full bg-pink-500 shadow-sm shadow-pink-500/40" />
          <div className="h-1.5 flex-1 rounded-full bg-pink-500 shadow-sm shadow-pink-500/40" />
          <div className="h-1.5 flex-1 rounded-full bg-pink-500 shadow-sm shadow-pink-500/40" />
        </div>
      </header>

      {/* 2. Main 50-50 Split Body Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* LEFT 50% COLUMN: Details & Security Settings */}
        <div className="col-span-1 lg:col-span-1 p-6 flex flex-col justify-between overflow-y-auto border-r border-slate-800/80 space-y-6 max-h-[calc(100vh-8rem)]">
          <div className="space-y-6 max-w-lg mx-auto w-full">
            {/* Header */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5 mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                Final Step &bull; Gift Protection & Delivery
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                Gift Security & Details
              </h2>
            </div>

            {/* PASSWORD CARD PANEL */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                PASSWORD
              </span>

              {/* Public Letter Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
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
                  <div>
                    <h4 className="text-xs font-bold text-white">Public letter</h4>
                    <p className="text-[11px] text-slate-400">
                      Anyone with the link can view. Password protects editing only.
                    </p>
                  </div>
                </div>
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
                    placeholder="Enter password to lock gift..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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

            {/* Error Notification */}
            {apiError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}
          </div>

          {/* Bottom Terms & Actions Box */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4 max-w-lg mx-auto w-full">
            {/* Terms Checkbox */}
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

            {/* Navigation & Send Buttons */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2.5 rounded-full border border-slate-800 bg-slate-950 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className={`px-8 py-3 rounded-full text-xs font-bold text-white shadow-xl transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                  isPublishing
                    ? 'bg-slate-800 opacity-60 cursor-wait'
                    : 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105 active:scale-95'
                }`}
              >
                <Send className="h-4 w-4" />
                <span>{isPublishing ? 'Publishing...' : 'Send'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* CENTER VERTICAL DIVIDER WITH SCROLL BUTTONS */}
        <div className="hidden xl:flex col-span-1 border-r border-slate-800/80 items-center justify-center relative bg-slate-950">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              className="h-7 w-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center hover:text-white"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <div className="h-20 w-0.5 bg-slate-800" />
            <button
              type="button"
              className="h-7 w-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center hover:text-white"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* RIGHT 50% COLUMN: Live Device Preview Section */}
        <div className="hidden lg:flex col-span-1 lg:col-span-1 p-6 flex-col items-center justify-center bg-slate-950 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {/* Occasion Selector Header Pill */}
          <div className="w-full max-w-sm mb-3 flex items-center justify-between p-2 px-3 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
            <select
              value={data.occasion || 'birthday'}
              onChange={(e) => setOccasion(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {occasions.map((o) => (
                <option key={o.id} value={o.id} className="bg-slate-900 text-white">
                  {o.label}
                </option>
              ))}
            </select>

            <span className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-wider bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
              LIVE SYNC
            </span>
          </div>

          {/* Realistic Mobile Device Frame */}
          <LiveDevicePreview />

          {/* Bottom Device Frame Badge */}
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
            MOBILE PREVIEW &bull; 393X852
          </div>
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
