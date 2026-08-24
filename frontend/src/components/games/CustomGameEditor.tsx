import React, { useState } from 'react';
import { Gamepad2, Plus, Trash2, Sparkles, Play, HelpCircle } from 'lucide-react';
import { WizardInteractive } from '../../context/WizardContext';
import { GamePreviewModal } from './GamePreviewModal';

interface CustomGameEditorProps {
  interactive: WizardInteractive;
  occasion?: string;
  recipientName?: string;
  onSave: (id: string, updatedConfig: Record<string, any>) => void;
  onClose: () => void;
}

export const CustomGameEditor: React.FC<CustomGameEditorProps> = ({
  interactive,
  occasion = 'birthday',
  recipientName = 'Someone Special',
  onSave,
  onClose,
}) => {
  const config = interactive.configurationJson || {};
  const [title, setTitle] = useState(config.title || 'How Well Do You Know Me?');
  const [topic, setTopic] = useState(config.topic || 'Our Memories');
  const [description, setDescription] = useState(config.description || 'Test how well you remember us ❤️');

  const [questions, setQuestions] = useState<any[]>(() => {
    if (config.questions && Array.isArray(config.questions) && config.questions.length > 0) {
      return config.questions;
    }
    return [
      {
        id: 'q1',
        questionText: 'Where did we first meet?',
        options: ['At a coffee shop', 'At school/work', 'At a mutual friend\'s party', 'Online'],
        correctAnswerIndex: 1,
        hint: 'Think back to the starting days!',
      },
      {
        id: 'q2',
        questionText: 'What is my absolute favorite food?',
        options: ['Pizza & Pasta', 'Sushi', 'Burgers & Fries', 'Desserts & Sweets'],
        correctAnswerIndex: 0,
        hint: 'Cheesy & delicious!',
      },
    ];
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Occasion Topic Presets
  const topicPresets: Record<string, string[]> = {
    birthday: ['My Favorite Things', 'Our Memories', 'Inside Jokes', 'Childhood Memories', 'Friends & Family'],
    love: ['Our Story', 'Firsts', 'Favorite Memories', 'Things I Love About You', 'Inside Jokes'],
    anniversary: ['Our Journey', 'First Date', 'Best Memories', 'Relationship Milestones'],
    friendship: ['How Well Do You Know Me?', 'Our Crazy Memories', 'Inside Jokes', 'School Memories'],
    graduation: ['College Memories', 'Future Dreams', 'Best Moments'],
    just_because: ['Random Questions', 'Favorite Things', 'Our Memories', 'Surprise Questions'],
  };

  const currentTopicPresets = topicPresets[occasion.toLowerCase()] || topicPresets['birthday'];

  const handleAddQuestion = () => {
    const newQ = {
      id: `q-${Date.now()}`,
      questionText: 'What is a special memory we share?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswerIndex: 0,
      hint: '',
    };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestion = (idx: number, field: string, value: any) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const handleUpdateOption = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...questions];
    const opts = [...updated[qIdx].options];
    opts[optIdx] = val;
    updated[qIdx] = { ...updated[qIdx], options: opts };
    setQuestions(updated);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const updatedConfig = {
      ...config,
      title,
      topic,
      description,
      questions,
    };
    onSave(interactive.id, updatedConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                Customize Game & Questions
              </h3>
              <p className="text-xs text-slate-400">
                Define the topic, questions, and answers for your gift game.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold hover:bg-sky-500/25 flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-sky-300" />
            <span>Preview Game</span>
          </button>
        </div>

        {/* 1. Game Title & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Game Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>

        {/* 2. Topic / Theme Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-pink-400" />
            <span>Game Topic / Theme</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {currentTopicPresets.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  topic === t
                    ? 'bg-pink-500 text-white border-pink-400 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Or enter a custom game topic..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* 3. Questions Editor List */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4" />
              Questions List ({questions.length})
            </span>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-3 py-1.5 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold hover:bg-pink-500/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((q, qIdx) => (
              <div key={q.id || qIdx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-pink-400 font-mono">
                    Question #{qIdx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    disabled={questions.length <= 1}
                    className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 disabled:opacity-30 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={q.questionText}
                  onChange={(e) => handleUpdateQuestion(qIdx, 'questionText', e.target.value)}
                  placeholder="Enter question text..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-bold"
                />

                {/* Multiple Choice Options A-D */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt: string, optIdx: number) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correctAnswerIndex === optIdx}
                        onChange={() => handleUpdateQuestion(qIdx, 'correctAnswerIndex', optIdx)}
                        className="accent-pink-500 h-4 w-4 cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                        className={`w-full px-3 py-1.5 rounded-lg text-xs border focus:outline-none ${
                          q.correctAnswerIndex === optIdx
                            ? 'bg-pink-500/10 border-pink-500 text-pink-200 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-slate-800 bg-slate-950 text-xs font-bold text-slate-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-7 py-2.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-xs font-bold text-white shadow-lg shadow-pink-500/25 hover:scale-105 cursor-pointer"
          >
            Save Custom Game
          </button>
        </div>
      </div>

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <GamePreviewModal
          interactive={{
            id: interactive.id,
            interactiveType: interactive.interactiveType,
            configurationJson: {
              title,
              topic,
              description,
              questions,
            },
          }}
          recipientName={recipientName}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
};
