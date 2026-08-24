import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, ShieldCheck, FileText } from 'lucide-react';
import { LegalPolicyModal } from './legal/LegalPolicyModal';

export const Footer: React.FC = () => {
  const [modalState, setModalState] = useState<{ isOpen: boolean; tab: 'privacy' | 'terms' }>({
    isOpen: false,
    tab: 'privacy',
  });

  const openLegalModal = (tab: 'privacy' | 'terms') => {
    setModalState({ isOpen: true, tab });
  };

  return (
    <>
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 sm:py-10 text-slate-400">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
            {/* Brand Col */}
            <div className="md:col-span-5 flex flex-col gap-3">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20">
                  <Heart className="h-4 w-4 fill-white/20" />
                </div>
                <span className="font-heading text-xl font-bold tracking-tight text-white">
                  Luvora
                </span>
              </Link>
              <p className="max-w-sm text-xs text-slate-400 leading-relaxed">
                Luvora is a free digital gift creation platform for personalized birthday cards, love letters, anniversary memories, and special occasions.
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>100% Free &bull; No Subscription Needed</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Navigation</h4>
              <Link to="/create" className="text-xs hover:text-pink-300 transition-colors">Create a Gift</Link>
              <a href="#occasions" className="text-xs hover:text-pink-300 transition-colors">Occasions</a>
              <a href="#how-it-works" className="text-xs hover:text-pink-300 transition-colors">How It Works</a>
            </div>

            {/* Legal & Info */}
            <div className="md:col-span-4 flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Legal & Support</h4>
              <button
                type="button"
                onClick={() => openLegalModal('privacy')}
                className="text-xs text-left text-slate-400 hover:text-pink-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-pink-400" />
                <span>Privacy Policy</span>
              </button>
              <button
                type="button"
                onClick={() => openLegalModal('terms')}
                className="text-xs text-left text-slate-400 hover:text-pink-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5 text-purple-400" />
                <span>Terms of Service</span>
              </button>
              <a href="mailto:support@luvora.app" className="text-xs hover:text-pink-300 transition-colors">Contact Support</a>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} Luvora Platform. All rights reserved.
            </div>
            <div>
              Made with love for meaningful digital connections.
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modal */}
      <LegalPolicyModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        defaultTab={modalState.tab}
      />
    </>
  );
};
