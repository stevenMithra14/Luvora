import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Check, Settings } from 'lucide-react';
import { WizardInteractive } from '../../context/WizardContext';

interface GameConfiguratorProps {
  interactive: WizardInteractive;
  onSave: (id: string, updatedConfig: Record<string, any>) => void;
  onClose: () => void;
}

export const GameConfigurator: React.FC<GameConfiguratorProps> = ({
  interactive,
  onSave,
  onClose,
}) => {
  const [config, setConfig] = useState<Record<string, any>>(interactive.configurationJson || {});

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(interactive.id, config);
    onClose();
  };

  // Helper for Quiz Questions
  const questions = config.questions || [];
  const addQuizQuestion = () => {
    const updated = [
      ...questions,
      {
        question: 'New Question?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: 0,
      },
    ];
    setConfig({ ...config, questions: updated });
  };

  const removeQuizQuestion = (idx: number) => {
    const updated = questions.filter((_: any, i: number) => i !== idx);
    setConfig({ ...config, questions: updated });
  };

  const updateQuizQuestionText = (idx: number, text: string) => {
    const updated = [...questions];
    updated[idx].question = text;
    setConfig({ ...config, questions: updated });
  };

  const updateQuizOptionText = (qIdx: number, oIdx: number, text: string) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = text;
    setConfig({ ...config, questions: updated });
  };

  const setQuizCorrectIndex = (qIdx: number, oIdx: number) => {
    const updated = [...questions];
    updated[qIdx].correctIndex = oIdx;
    setConfig({ ...config, questions: updated });
  };

  // Helper for Surprise Wheel Slices
  const slices = config.slices || [];
  const addSlice = () => {
    const updated = [...slices, { label: 'New Surprise Reward ✨', color: '#ec4899' }];
    setConfig({ ...config, slices: updated });
  };

  const removeSlice = (idx: number) => {
    const updated = slices.filter((_: any, i: number) => i !== idx);
    setConfig({ ...config, slices: updated });
  };

  const updateSliceLabel = (idx: number, text: string) => {
    const updated = [...slices];
    updated[idx].label = text;
    setConfig({ ...config, slices: updated });
  };

  // Helper for Mystery Boxes
  const boxes = config.boxes || [];
  const addMysteryBox = () => {
    const updated = [
      ...boxes,
      { boxNumber: boxes.length + 1, title: `Mystery Gift #${boxes.length + 1}`, rewardMessage: 'New Secret Reward! ❤️' }
    ];
    setConfig({ ...config, boxes: updated });
  };

  const removeMysteryBox = (idx: number) => {
    const updated = boxes.filter((_: any, i: number) => i !== idx);
    setConfig({ ...config, boxes: updated });
  };

  const updateBoxReward = (idx: number, text: string) => {
    const updated = [...boxes];
    updated[idx].rewardMessage = text;
    setConfig({ ...config, boxes: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Settings className="h-4 w-4" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wider">
              Configure {interactive.interactiveType.replace('_', ' ')}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-200">
          {/* General Title Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Display Game Title
            </label>
            <input
              type="text"
              value={config.title || ''}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Configuration Fields for Quiz Types */}
          {['quiz', 'birthday_quiz', 'love_quiz', 'know_me_quiz', 'best_friend_quiz', 'our_story_quiz'].includes(
            interactive.interactiveType
          ) && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-heading text-sm font-bold text-white">Quiz Questions ({questions.length})</h4>
                <button
                  type="button"
                  onClick={addQuizQuestion}
                  className="px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-bold hover:bg-pink-500/20 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              {questions.map((q: any, qIdx: number) => (
                <div key={qIdx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-pink-400">Question #{qIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeQuizQuestion(qIdx)}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuizQuestionText(qIdx, e.target.value)}
                    placeholder="Enter question text..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt: string, oIdx: number) => (
                      <div key={oIdx} className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correctIndex === oIdx}
                          onChange={() => setQuizCorrectIndex(qIdx, oIdx)}
                          className="h-3.5 w-3.5 text-pink-500"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateQuizOptionText(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${oIdx + 1}`}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Configuration Fields for Surprise Wheel */}
          {interactive.interactiveType === 'surprise_wheel' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-heading text-sm font-bold text-white">Wheel Rewards ({slices.length})</h4>
                <button
                  type="button"
                  onClick={addSlice}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Reward Slice</span>
                </button>
              </div>

              {slices.map((slice: any, sIdx: number) => (
                <div key={sIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={slice.label}
                    onChange={(e) => updateSliceLabel(sIdx, e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeSlice(sIdx)}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Configuration Fields for Mystery Box */}
          {interactive.interactiveType === 'mystery_box' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-heading text-sm font-bold text-white">Mystery Boxes ({boxes.length})</h4>
                <button
                  type="button"
                  onClick={addMysteryBox}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold hover:bg-amber-500/20 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Mystery Box</span>
                </button>
              </div>

              {boxes.map((box: any, bIdx: number) => (
                <div key={bIdx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">Box #{box.boxNumber}</span>
                    <button
                      type="button"
                      onClick={() => removeMysteryBox(bIdx)}
                      className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={box.rewardMessage}
                    onChange={(e) => updateBoxReward(bIdx, e.target.value)}
                    placeholder="Enter reward message..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-pink-500 text-white font-bold text-xs hover:bg-pink-600 cursor-pointer flex items-center gap-1.5 shadow-lg"
            >
              <Check className="h-4 w-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
