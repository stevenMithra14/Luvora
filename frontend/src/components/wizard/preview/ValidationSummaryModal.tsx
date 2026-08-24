import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../../../context/WizardContext';

interface ValidationItem {
  key: string;
  label: string;
  isValid: boolean;
  fixPath: string;
  fixLabel: string;
}

interface ValidationSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPublish: () => void;
}

export const ValidationSummaryModal: React.FC<ValidationSummaryModalProps> = ({
  isOpen,
  onClose,
  onConfirmPublish,
}) => {
  const navigate = useNavigate();
  const { data } = useWizard();

  const validationRules: ValidationItem[] = [
    {
      key: 'occasion',
      label: 'Occasion Selected',
      isValid: Boolean(data.occasion),
      fixPath: '/create',
      fixLabel: 'Select Occasion',
    },
    {
      key: 'recipient',
      label: "Recipient Name Provided",
      isValid: Boolean(data.recipientName && data.recipientName.trim().length >= 2),
      fixPath: '/create/person',
      fixLabel: 'Enter Recipient Name',
    },
    {
      key: 'content',
      label: 'Main Heading & Message Written',
      isValid: Boolean(data.title && data.message),
      fixPath: '/create/customize',
      fixLabel: 'Customize Message',
    },
    {
      key: 'theme',
      label: 'Visual Theme Configured',
      isValid: Boolean(data.themeId),
      fixPath: '/create/customize',
      fixLabel: 'Pick Theme',
    },
    {
      key: 'media',
      label: 'Media Assets (Photos / Music)',
      isValid: Boolean(data.photos.length > 0 || data.musicUrl),
      fixPath: '/create/memories',
      fixLabel: 'Add Photos/Music',
    },
  ];

  const allValid = validationRules.every((rule) => rule.isValid);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
        >
          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white">Pre-Publishing Validation</h3>
              <p className="text-xs text-slate-400">Check gift requirements before publishing</p>
            </div>
          </div>

          {/* Checklist Container */}
          <div className="space-y-2.5 my-6">
            {validationRules.map((rule) => (
              <div
                key={rule.key}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80"
              >
                <div className="flex items-center gap-2.5">
                  {rule.isValid ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4.5 w-4.5 text-amber-400 shrink-0" />
                  )}
                  <span className={`text-xs font-semibold ${rule.isValid ? 'text-slate-200' : 'text-amber-300'}`}>
                    {rule.label}
                  </span>
                </div>

                {!rule.isValid && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(rule.fixPath);
                    }}
                    className="text-[11px] font-semibold text-pink-400 hover:text-pink-300 underline underline-offset-2 flex items-center gap-1"
                  >
                    <span>{rule.fixLabel}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Action Footer */}
          {allValid ? (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 text-center font-medium">
                Everything looks perfect! Your digital gift is ready for publishing.
              </div>
              <button
                type="button"
                onClick={onConfirmPublish}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-semibold text-sm shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] transition-all"
              >
                Confirm & Publish Gift
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 text-center font-medium">
                Please complete the missing required steps above before publishing.
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                Return to Editor
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
