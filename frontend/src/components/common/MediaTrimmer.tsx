import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Check, Clock, Scissors } from 'lucide-react';

interface MediaTrimmerProps {
  type: 'audio' | 'video';
  mediaUrl: string;
  title?: string;
  initialTrimStart?: number;
  initialTrimEnd?: number;
  onSave: (trimStart: number, trimEnd: number) => void;
  onCancel?: () => void;
}

export const MediaTrimmer: React.FC<MediaTrimmerProps> = ({
  type,
  mediaUrl,
  title = 'Media Trimmer',
  initialTrimStart = 0,
  initialTrimEnd,
  onSave,
  onCancel,
}) => {
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [trimStart, setTrimStart] = useState<number>(initialTrimStart);
  const [trimEnd, setTrimEnd] = useState<number>(initialTrimEnd || 0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [draggingHandle, setDraggingHandle] = useState<'start' | 'end' | null>(null);

  // Format seconds to MM:SS
  const formatTime = (secs: number): string => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Handle metadata loaded
  const handleLoadedMetadata = () => {
    if (!mediaRef.current) return;
    const dur = mediaRef.current.duration;
    if (dur && !isNaN(dur)) {
      setDuration(dur);
      if (!initialTrimEnd || initialTrimEnd > dur) {
        setTrimEnd(dur);
      }
    }
  };

  // Keep playback within [trimStart, trimEnd]
  const handleTimeUpdate = () => {
    if (!mediaRef.current) return;
    const curr = mediaRef.current.currentTime;
    setCurrentTime(curr);

    if (curr >= trimEnd) {
      mediaRef.current.pause();
      mediaRef.current.currentTime = trimStart;
      setIsPlaying(false);
    }
  };

  const togglePlayPreview = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
      setIsPlaying(false);
    } else {
      if (mediaRef.current.currentTime < trimStart || mediaRef.current.currentTime >= trimEnd) {
        mediaRef.current.currentTime = trimStart;
      }
      mediaRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    setTrimStart(0);
    setTrimEnd(duration);
    if (mediaRef.current) {
      mediaRef.current.currentTime = 0;
    }
  };

  // Handle dragging timeline handles
  const updateHandlePosFromX = (clientX: number) => {
    if (!trackRef.current || !duration || !draggingHandle) return;
    const rect = trackRef.current.getBoundingClientRect();
    const posRatio = Math.min(Math.max(0, (clientX - rect.left) / rect.width), 1);
    const targetTime = posRatio * duration;

    if (draggingHandle === 'start') {
      const newStart = Math.min(targetTime, trimEnd - 0.5);
      setTrimStart(newStart);
      if (mediaRef.current) mediaRef.current.currentTime = newStart;
    } else if (draggingHandle === 'end') {
      const newEnd = Math.max(targetTime, trimStart + 0.5);
      setTrimEnd(newEnd);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingHandle) updateHandlePosFromX(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (draggingHandle && e.touches[0]) updateHandlePosFromX(e.touches[0].clientX);
    };
    const handleMouseUp = () => setDraggingHandle(null);

    if (draggingHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [draggingHandle, duration, trimStart, trimEnd]);

  const selectedDuration = Math.max(0, trimEnd - trimStart);
  const startPercent = duration ? (trimStart / duration) * 100 : 0;
  const endPercent = duration ? (trimEnd / duration) * 100 : 100;
  const currPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 font-sans text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-2">
          <Scissors className="h-4 w-4" />
          <span>{type === 'audio' ? 'Trim Audio Selection' : 'Trim Video Clip'}</span>
        </span>
        <span className="text-[11px] font-mono text-slate-400 truncate max-w-[180px]">
          {title}
        </span>
      </div>

      {/* Hidden/Visible Media Element */}
      {type === 'video' ? (
        <div className="relative w-full max-h-52 bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={mediaUrl}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            className="h-full max-h-52 w-full object-contain"
            playsInline
          />
        </div>
      ) : (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={mediaUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          className="hidden"
        />
      )}

      {/* Timeline Controls */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>00:00</span>
          <span className="text-pink-300 font-bold flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Selected: {formatTime(selectedDuration)}
          </span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Dual Handle Draggable Track */}
        <div
          ref={trackRef}
          className="relative h-10 w-full bg-slate-950 rounded-xl border border-slate-800 select-none overflow-hidden touch-none"
        >
          {/* Waveform / Visual Bars Background */}
          <div className="absolute inset-0 flex items-center justify-between px-2 opacity-30 pointer-events-none">
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-slate-400"
                style={{ height: `${20 + (Math.sin(i * 0.7) * 60 + 20)}%` }}
              />
            ))}
          </div>

          {/* Active Trim Selection Highlight Box */}
          <div
            className="absolute top-0 bottom-0 bg-pink-500/25 border-x border-pink-500/60"
            style={{ left: `${startPercent}%`, right: `${100 - endPercent}%` }}
          />

          {/* Current Playhead Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10 pointer-events-none"
            style={{ left: `${currPercent}%` }}
          />

          {/* START HANDLE */}
          <div
            onMouseDown={() => setDraggingHandle('start')}
            onTouchStart={() => setDraggingHandle('start')}
            className="absolute top-0 bottom-0 w-6 -ml-3 bg-pink-500 hover:bg-pink-400 rounded-l-lg border-2 border-white shadow-lg cursor-ew-resize flex items-center justify-center z-20 transition-transform active:scale-110"
            style={{ left: `${startPercent}%` }}
          >
            <div className="w-0.5 h-4 bg-white rounded-full" />
          </div>

          {/* END HANDLE */}
          <div
            onMouseDown={() => setDraggingHandle('end')}
            onTouchStart={() => setDraggingHandle('end')}
            className="absolute top-0 bottom-0 w-6 -ml-3 bg-rose-500 hover:bg-rose-400 rounded-r-lg border-2 border-white shadow-lg cursor-ew-resize flex items-center justify-center z-20 transition-transform active:scale-110"
            style={{ left: `${endPercent}%` }}
          >
            <div className="w-0.5 h-4 bg-white rounded-full" />
          </div>
        </div>
      </div>

      {/* Fine-Tuning Controls */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Start Time</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTrimStart((prev) => Math.max(0, prev - 1))}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold"
            >
              -1s
            </button>
            <span className="flex-1 text-center font-bold text-pink-300">
              {formatTime(trimStart)}
            </span>
            <button
              type="button"
              onClick={() => setTrimStart((prev) => Math.min(trimEnd - 0.5, prev + 1))}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold"
            >
              +1s
            </button>
          </div>
        </div>

        <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold block uppercase">End Time</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTrimEnd((prev) => Math.max(trimStart + 0.5, prev - 1))}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold"
            >
              -1s
            </button>
            <span className="flex-1 text-center font-bold text-rose-300">
              {formatTime(trimEnd)}
            </span>
            <button
              type="button"
              onClick={() => setTrimEnd((prev) => Math.min(duration, prev + 1))}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold"
            >
              +1s
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlayPreview}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-lg transition-all cursor-pointer ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/30 hover:scale-105 active:scale-95'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 fill-current" />
                <span>⏸ PAUSE</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>▶ PLAY TRIMMED SNIPPET</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Reset Full Range"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={() => onSave(trimStart, trimEnd)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Save Selection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
