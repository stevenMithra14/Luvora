import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Loader2, Mic, Square, RotateCcw, Volume2, Send, Check } from 'lucide-react';
import { WizardGoodie } from '../../../context/WizardContext';
import { uploadAudioApi } from '../../../services/giftService';

interface VoiceGoodieEditorProps {
  goodie: WizardGoodie;
  onSave: (id: string, updated: Partial<WizardGoodie>) => void;
  onClose: () => void;
}

export const VoiceGoodieEditor: React.FC<VoiceGoodieEditorProps> = ({ goodie, onSave, onClose }) => {
  const [title, setTitle] = useState(goodie.title || 'Voice Message');
  const [caption, setCaption] = useState(goodie.configurationJson?.caption || 'Listen to this when you miss me ❤️');
  const [audioUrl, setAudioUrl] = useState(goodie.mediaUrl || goodie.configurationJson?.audioUrl || '');
  const [micError, setMicError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Live Microphone Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string>(audioUrl);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  const startRecording = async () => {
    setMicError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioPreviewUrl(url);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setMicError('Microphone access denied or not supported by browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const resetRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    setAudioBlob(null);
    setAudioPreviewUrl('');
    setAudioUrl('');
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMicError('');
    try {
      const res = await uploadAudioApi(file, file.name);
      setAudioUrl(res.url);
      setAudioPreviewUrl(res.url);
      setAudioBlob(null);
    } catch (err: any) {
      setMicError(err.message || 'Failed to upload voice audio file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    let finalUrl = audioUrl;

    if (audioBlob) {
      setIsUploading(true);
      setMicError('');
      try {
        const res = await uploadAudioApi(audioBlob, 'voice_message.webm');
        finalUrl = res.url;
      } catch (err: any) {
        setMicError(err.message || 'Failed to upload recorded voice message.');
        setIsUploading(false);
        return;
      }
    }

    if (!finalUrl && !audioBlob) {
      setMicError('Please record or upload a voice note before saving.');
      return;
    }

    onSave(goodie.id, {
      title: title.trim() || 'Voice Message',
      description: caption.trim() || 'Listen to this voice message ❤️',
      mediaUrl: finalUrl,
      configurationJson: {
        ...goodie.configurationJson,
        title: title.trim() || 'Voice Message',
        caption: caption.trim() || 'Listen to this voice message ❤️',
        audioUrl: finalUrl,
      },
    });
    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#faf8f5] border border-amber-900/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-slate-900 font-mono relative"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-900 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="space-y-1">
          <h3 className="font-mono text-sm font-extrabold tracking-widest text-[#8b2626] uppercase flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-[#8b2626]" />
            <span>RECORD & SEND VOICE NOTE</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-sans">
            Record a live message using your microphone or upload an audio file.
          </p>
        </div>

        <div className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Voice Note Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Voice Message For You"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#8b2626] placeholder:text-slate-400 shadow-xs"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Caption / Message
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Listen when you miss me ❤️"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#8b2626] placeholder:text-slate-400 shadow-xs"
            />
          </div>

          {/* LIVE RECORDING CARD */}
          <div className="p-4 rounded-2xl bg-white border border-slate-300 space-y-3 text-center shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Microphone Voice Recorder
            </span>

            {!isRecording && !audioPreviewUrl && (
              <button
                type="button"
                onClick={startRecording}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#8b2626] to-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <Mic className="h-4 w-4" />
                <span>Start Live Recording</span>
              </button>
            )}

            {isRecording && (
              <div className="space-y-3 py-1">
                <div className="flex items-center justify-center gap-2 text-[#8b2626] font-mono text-lg font-bold animate-pulse">
                  <div className="h-3 w-3 rounded-full bg-rose-600 animate-ping" />
                  <span>Recording: {formatTime(recordingTime)}</span>
                </div>

                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-slate-800 transition-all cursor-pointer mx-auto"
                >
                  <Square className="h-4 w-4 fill-rose-500 text-rose-500" />
                  <span>Stop Recording</span>
                </button>
              </div>
            )}

            {!isRecording && audioPreviewUrl && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-emerald-700 text-[11px] font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <span className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Voice note ready to send
                  </span>
                  <button
                    type="button"
                    onClick={resetRecording}
                    className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-[10px] underline cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Re-record</span>
                  </button>
                </div>

                <audio controls src={audioPreviewUrl} className="w-full h-9 rounded-lg accent-[#8b2626]" />
              </div>
            )}
          </div>

          {/* OR UPLOAD FILE OPTION */}
          <div>
            <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white border border-dashed border-slate-300 hover:border-[#8b2626] cursor-pointer transition-all text-[11px] text-slate-600">
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#8b2626]" />
              ) : (
                <Upload className="h-4 w-4 text-[#8b2626]" />
              )}
              <span>{audioUrl && !audioBlob ? 'File selected' : 'Or upload audio file (.mp3, .wav, .m4a)'}</span>
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </label>
            {micError && <p className="text-[10px] text-rose-600 mt-1 font-sans">{micError}</p>}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isUploading || isRecording}
            className="flex-1 py-3 px-4 rounded-xl bg-[#8b2626] text-white font-mono text-xs font-bold shadow-md hover:bg-[#731e1e] active:scale-95 transition-all cursor-pointer text-center disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending & Saving...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Send & Add to Package</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="py-3 px-4 rounded-xl bg-white border border-slate-300 text-slate-700 font-mono text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer text-center"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};
