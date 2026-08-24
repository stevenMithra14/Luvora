import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Trash2 } from 'lucide-react';

export interface TimelineEntry {
  id: string;
  yearDate: string;
  title: string;
  description: string;
  photoUrl?: string;
}

interface MemoryTimelineProps {
  entries: TimelineEntry[];
  isEditable?: boolean;
  onAddEntry?: () => void;
  onUpdateEntry?: (id: string, updated: Partial<TimelineEntry>) => void;
  onDeleteEntry?: (id: string) => void;
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({
  entries,
  isEditable = false,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
}) => {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-white">Memory Timeline</h3>
            <p className="text-xs text-slate-400">Our journey together over time</p>
          </div>
        </div>

        {isEditable && onAddEntry && (
          <button
            type="button"
            onClick={onAddEntry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Event</span>
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500 italic">
          No timeline events added yet. Click "Add Event" to build your memory map.
        </div>
      ) : (
        <div className="relative border-l-2 border-emerald-500/30 pl-6 sm:pl-8 ml-3 sm:ml-4 space-y-8">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative group"
            >
              {/* Timeline Dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 h-4 w-4 rounded-full bg-emerald-500 border-4 border-slate-950 shadow-md shadow-emerald-500/40" />

              {isEditable ? (
                /* Editable Mode Input Fields */
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={entry.yearDate}
                      onChange={(e) => onUpdateEntry?.(entry.id, { yearDate: e.target.value })}
                      placeholder="Year/Date (e.g. June 2021)"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-semibold text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                    {onDeleteEntry && (
                      <button
                        type="button"
                        onClick={() => onDeleteEntry(entry.id)}
                        className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                        title="Delete Event"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={entry.title}
                    onChange={(e) => onUpdateEntry?.(entry.id, { title: e.target.value })}
                    placeholder="Event Title (e.g. The Day We Met)"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  />

                  <textarea
                    rows={2}
                    value={entry.description}
                    onChange={(e) => onUpdateEntry?.(entry.id, { description: e.target.value })}
                    placeholder="Brief memory description..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 leading-relaxed resize-none"
                  />
                </div>
              ) : (
                /* Readonly Display Mode */
                <div>
                  <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                    {entry.yearDate}
                  </span>
                  <h4 className="font-heading text-lg font-bold text-white mb-2">
                    {entry.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {entry.description}
                  </p>
                  {entry.photoUrl && (
                    <div className="mt-3 h-36 w-full max-w-sm rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                      <img src={entry.photoUrl} alt={entry.title} className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
