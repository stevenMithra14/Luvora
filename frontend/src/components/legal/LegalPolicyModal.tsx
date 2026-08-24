import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileText, X, Lock, Heart } from 'lucide-react';

interface LegalPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms';
}

export const LegalPolicyModal: React.FC<LegalPolicyModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(defaultTab);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                {activeTab === 'privacy' ? <ShieldCheck className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-white">
                  Luvora Platform Policies
                </h3>
                <p className="text-xs text-slate-400">
                  Transparency, privacy, and terms of service for digital surprise creation.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-slate-800 bg-slate-950/30 px-5 pt-3 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-semibold cursor-pointer border-t border-x transition-colors ${
                activeTab === 'privacy'
                  ? 'bg-slate-900 border-slate-700 text-pink-300'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Privacy Policy</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-semibold cursor-pointer border-t border-x transition-colors ${
                activeTab === 'terms'
                  ? 'bg-slate-900 border-slate-700 text-pink-300'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Terms of Service</span>
            </button>
          </div>

          {/* Scrollable Document Content Box */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-300 leading-relaxed font-sans scrollbar-thin">
            {activeTab === 'privacy' ? (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white font-heading">1. Zero Data Exploitation Policy</h4>
                <p>
                  Luvora is a 100% free digital gift platform. We do not sell your personal data, recipient information, uploaded photo memories, or message notes to third parties or advertising networks.
                </p>

                <h4 className="text-sm font-bold text-white font-heading">2. Optional Password Protection & Encryption</h4>
                <p>
                  When you enable optional gift password protection, passwords are salted and hashed using bcrypt. Plaintext passwords are never stored in our database or transmitted to unauthenticated recipients.
                </p>

                <h4 className="text-sm font-bold text-white font-heading">3. Media Asset Security</h4>
                <p>
                  Uploaded photos and background music tracks are sanitized to prevent unauthorized execution or path traversal attacks. Media files are stored securely and only rendered for published gifts.
                </p>

                <h4 className="text-sm font-bold text-white font-heading">4. Deletion & Modification</h4>
                <p>
                  You can modify or delete your gift experience at any time using your secret edit token URL.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white font-heading">1. Free Non-Commercial Platform</h4>
                <p>
                  Luvora is strictly non-commercial and 100% free. No subscriptions, paywalls, or payment requests exist anywhere on the platform.
                </p>

                <h4 className="text-sm font-bold text-white font-heading">2. Content Guidelines</h4>
                <p>
                  Users agree not to upload illegal, hateful, harassing, or harmful content. Luvora reserves the right to remove gifts violating safety standards.
                </p>

                <h4 className="text-sm font-bold text-white font-heading">3. Recipient Share Links</h4>
                <p>
                  Public gift links and QR codes are generated with unpredictable identifiers. Anyone with the public URL can open the gift unless password protection is enabled by the creator.
                </p>

                <h4 className="text-sm font-bold text-white font-heading">4. Service Availability</h4>
                <p>
                  Luvora strives for 99.9% uptime for digital gift deliveries.
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Heart className="h-3 w-3 text-pink-400" />
              <span>Made for meaningful digital surprises</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-pink-500 text-white text-xs font-bold hover:bg-pink-600 cursor-pointer transition-colors"
            >
              I Understand
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
