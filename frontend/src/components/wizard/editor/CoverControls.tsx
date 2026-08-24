import React, { useState } from 'react';
import { useWizard } from '../../../context/WizardContext';
import { Layout, Tag, User, AlignCenter, Lock, ShieldCheck, Key } from 'lucide-react';

export const CoverControls: React.FC = () => {
  const { data, setCustomization, setRecipientInfo } = useWizard();
  const [enablePassword, setEnablePassword] = useState(Boolean(data.password));

  const coverStyles = [
    { id: 'classic', label: 'Classic Elegance' },
    { id: 'modern', label: 'Modern Glass' },
    { id: 'minimal', label: 'Clean Minimal' },
    { id: 'banner', label: 'Hero Banner' },
  ];

  const handlePasswordToggle = (enabled: boolean) => {
    setEnablePassword(enabled);
    if (!enabled) {
      setCustomization({ password: '', passwordHint: '' });
    }
  };

  return (
    <div className="space-y-5">
      {/* Cover Title */}
      <div>
        <label htmlFor="coverTitle" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Cover Title
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Tag className="h-4 w-4" />
          </div>
          <input
            id="coverTitle"
            type="text"
            value={data.coverTitle}
            onChange={(e) => setCustomization({ coverTitle: e.target.value })}
            placeholder="e.g. A Special Surprise"
            maxLength={60}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
          />
        </div>
      </div>

      {/* Cover Subtitle */}
      <div>
        <label htmlFor="coverSubtitle" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Cover Subtitle
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <AlignCenter className="h-4 w-4" />
          </div>
          <input
            id="coverSubtitle"
            type="text"
            value={data.coverSubtitle}
            onChange={(e) => setCustomization({ coverSubtitle: e.target.value })}
            placeholder="e.g. Created with love & cherished memories"
            maxLength={100}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
          />
        </div>
      </div>

      {/* Recipient Name */}
      <div>
        <label htmlFor="recipientNameCover" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Recipient Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <User className="h-4 w-4" />
          </div>
          <input
            id="recipientNameCover"
            type="text"
            value={data.recipientName}
            onChange={(e) => setRecipientInfo(e.target.value, data.recipientDate, data.dontKnowYear)}
            placeholder="Recipient's name..."
            maxLength={50}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
          />
        </div>
      </div>

      {/* Password Protection Toggle */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-pink-400" />
            <span className="text-xs font-bold text-slate-200">Protect this gift with a password</span>
          </div>
          <input
            type="checkbox"
            checked={enablePassword}
            onChange={(e) => handlePasswordToggle(e.target.checked)}
            className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-pink-500 focus:ring-pink-500/20 cursor-pointer"
          />
        </label>

        {enablePassword && (
          <div className="pt-2 space-y-3">
            <div>
              <label htmlFor="giftPasswordInput" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Secret Gift Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <input
                  id="giftPasswordInput"
                  type="password"
                  value={data.password || ''}
                  onChange={(e) => setCustomization({ password: e.target.value })}
                  placeholder="Enter gift password..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="giftPasswordHintInput" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Password Hint (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Key className="h-3.5 w-3.5 text-pink-400" />
                </div>
                <input
                  id="giftPasswordHintInput"
                  type="text"
                  value={data.passwordHint || ''}
                  onChange={(e) => setCustomization({ passwordHint: e.target.value })}
                  placeholder="e.g. Your birth year, our favorite place..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-500">
              Recipient must enter this password to view their gift experience.
            </p>
          </div>
        )}
      </div>

      {/* Cover Layout Style */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Cover Layout Style
        </label>
        <div className="grid grid-cols-2 gap-2">
          {coverStyles.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setCustomization({ coverStyle: style.id as any })}
              className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                data.coverStyle === style.id
                  ? 'bg-pink-500/20 border-pink-500 text-pink-200 shadow-md shadow-pink-500/10'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Layout className="h-3.5 w-3.5 text-pink-400 shrink-0" />
              <span>{style.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
