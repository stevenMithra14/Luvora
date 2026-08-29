import React, { useState, useRef, useEffect } from 'react';
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
  const initialUrl = goodie.mediaUrl || goodie.configurationJson?.audioUrl || '';
  const [title, setTitle] = useState(goodie.title || 'Voice Message');
  const [caption, setCaption] = useState(goodie.configurationJson?.caption || '');
  const [audioUrl, setAudioUrl] = useState<string>(initialUrl);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string>(initialUrl);
  const [sourceType, setSourceType] = useState<'recorded' | 'uploaded' | null>(initialUrl ? 'uploaded' : null);

  const [micError, setMicError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Live Microphone Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    setMicError('');
    if (!navigator?.mediaDevices?.getUserMedia) {
      setMicError("Live recording isn't supported by this browser. Please upload an audio file instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = '';
      const candidateTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/aac',
        'audio/ogg;codecs=opus',
      ];

      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
        for (const type of candidateTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            break;
          }
        }
      }

      let recorder: MediaRecorder;
      try {
        recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalMime = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: finalMime });
        setAudioBlob(blob);
        setUploadedFile(null);

        const url = URL.createObjectURL(blob);
        setAudioPreviewUrl(url);
        setAudioUrl(url);
        setSourceType('recorded');

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      recorder.start(200);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone recording error:', err);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Microphone access was denied. Please allow microphone permission in your browser settings and try again.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicError('No microphone found on your device. Please connect a microphone or upload an audio file instead.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setMicError('Microphone is currently in use by another application.');
      } else {
        setMicError(err.message || "Live recording isn't supported or failed. Please upload an audio file instead.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Error stopping MediaRecorder:', e);
      }
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const clearAudio = () => {
    if (isRecording) {
      stopRecording();
    }
    if (audioPreviewUrl && audioPreviewUrl.startsWith('blob:')) {
      try { URL.revokeObjectURL(audioPreviewUrl); } catch {}
    }
    setAudioBlob(null);
    setUploadedFile(null);
    setAudioPreviewUrl('');
    setAudioUrl('');
    setSourceType(null);
    setRecordingTime(0);
    setMicError('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (audioPreviewUrl && audioPreviewUrl.startsWith('blob:')) {
      try { URL.revokeObjectURL(audioPreviewUrl); } catch {}
    }

    setMicError('');
    setAudioBlob(null);
    setUploadedFile(file);

    const localUrl = URL.createObjectURL(file);
    setAudioPreviewUrl(localUrl);
    setAudioUrl(localUrl);
    setSourceType('uploaded');
  };

  const handleSave = async () => {
    let finalUrl = audioUrl;

    if (!audioBlob && !uploadedFile && (!finalUrl || finalUrl.startsWith('blob:'))) {
      setMicError('Please record or upload a voice note first.');
      return;
    }

    setIsUploading(true);
    setMicError('');

    try {
      if (audioBlob) {
        const mime = audioBlob.type || 'audio/webm';
        let ext = '.webm';
        if (mime.includes('mp4') || mime.includes('m4a') || mime.includes('aac')) {
          ext = '.m4a';
        } else if (mime.includes('ogg')) {
          ext = '.ogg';
        }
        const res = await uploadAudioApi(audioBlob, `voice_recording_${Date.now()}${ext}`);
        finalUrl = res.url;
      } else if (uploadedFile) {
        const res = await uploadAudioApi(uploadedFile, uploadedFile.name);
        finalUrl = res.url;
      }

      if (!finalUrl) {
        setMicError('Failed to process voice note audio. Please try again.');
        setIsUploading(false);
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
    } catch (err: any) {
      setMicError(err.message || 'Failed to upload voice note. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-[92vw] max-w-md bg-[#faf8f5] border border-amber-900/20 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-4 sm:space-y-5 text-slate-900 font-mono relative my-auto max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1 rounded-full text-slate-400 hover:text-slate-900 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-6">
          <h3 className="font-mono text-xs sm:text-sm font-extrabold tracking-widest text-[#8b2626] uppercase flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-[#8b2626] shrink-0" />
            <span>RECORD & SEND VOICE NOTE</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-sans">
            Record a live message using your microphone or upload an audio file.
          </p>
        </div>

        <div className="space-y-3.5 text-xs">
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

          {/* RECORDING / PLAYER CARD */}
          <div className="p-4 rounded-2xl bg-white border border-slate-300 space-y-3 text-center shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Microphone Voice Recorder
            </span>

            {/* STATE 1: EMPTY */}
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

            {/* STATE 2: RECORDING */}
            {isRecording && (
              <div className="space-y-3 py-1">
                <div className="flex items-center justify-center gap-2 text-[#8b2626] font-mono text-base sm:text-lg font-bold animate-pulse">
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

            {/* STATE 3 & STATE 4: RECORDED / UPLOADED READY WITH PLAYER */}
            {!isRecording && audioPreviewUrl && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-emerald-700 text-[11px] font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <span className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{sourceType === 'uploaded' ? 'Audio file ready' : 'Voice note ready to send'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={clearAudio}
                    className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-[10px] underline cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{sourceType === 'uploaded' ? 'Choose another file' : 'Re-record'}</span>
                  </button>
                </div>

                <audio controls src={audioPreviewUrl} className="w-full h-9 rounded-lg accent-[#8b2626]" />
              </div>
            )}
          </div>

          {/* OR UPLOAD FILE OPTION */}
          {!isRecording && (
            <div>
              <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white border border-dashed border-slate-300 hover:border-[#8b2626] cursor-pointer transition-all text-[11px] text-slate-600">
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#8b2626]" />
                ) : (
                  <Upload className="h-4 w-4 text-[#8b2626]" />
                )}
                <span>
                  {audioPreviewUrl && sourceType === 'uploaded'
                    ? 'File selected (Click to change)'
                    : 'Or upload audio file (.mp3, .wav, .m4a, .aac, .ogg, .webm)'}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* STATE 5: ERROR MESSAGE */}
          {micError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-sans space-y-1">
              <p className="font-bold">⚠️ Notice:</p>
              <p>{micError}</p>
            </div>
          )}
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
