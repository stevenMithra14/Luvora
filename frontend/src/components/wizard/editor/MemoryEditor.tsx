import React, { useState } from 'react';
import {
  Camera,
  Film,
  Trash2,
  MoveUp,
  MoveDown,
  Settings,
  Image as ImageIcon,
  Upload,
  Calendar,
  MapPin,
  Clock,
  Link as LinkIcon,
  Play,
  X,
  Check,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useWizard, WizardMemoryItem } from '../../../context/WizardContext';
import { uploadPhotoApi, uploadVideoApi, resolveMediaUrl, parseYouTubeVideoId, getYouTubeThumbnailUrl } from '../../../services/giftService';

export const MemoryEditor: React.FC = () => {
  const { data, setMemories, setPhotos, setMemoryConfig } = useWizard();
  const memories = data.memories || [];
  const memoryConfig = data.memoryConfig;

  const [activeTab, setActiveTab] = useState<'items' | 'settings'>('items');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Video Link Modal State
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoTitleInput, setVideoTitleInput] = useState('');
  const [videoCaptionInput, setVideoCaptionInput] = useState('');
  const [videoModalError, setVideoModalError] = useState<string | null>(null);

  // Handle Video File Upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (memories.length >= 10) {
      setUploadError('Maximum limit of 10 media items reached (photos + videos). Remove a memory to upload more.');
      return;
    }

    setIsUploadingVideo(true);
    setUploadError(null);

    try {
      const newMemories: WizardMemoryItem[] = [];
      const slotsRemaining = 10 - memories.length;
      const countToUpload = Math.min(files.length, slotsRemaining);

      for (let i = 0; i < countToUpload; i++) {
        const file = files[i];
        if (file.size > 50 * 1024 * 1024) {
          setUploadError(`Video file '${file.name}' exceeds 50MB limit.`);
          continue;
        }

        const res = await uploadVideoApi(file);
        const returnedUrl = res.url;
        const memoryId = `mem-vid-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`;

        newMemories.push({
          id: memoryId,
          type: 'video',
          source: 'luvora',
          fileUrl: returnedUrl,
          videoUrl: returnedUrl,
          title: file.name.split('.')[0] || 'Luvora Video Memory',
          caption: '',
          date: '',
          frameStyle: memoryConfig.videoFrameStyle || 'cinema',
          displayOrder: memories.length + i,
        });
      }

      setMemories([...memories, ...newMemories]);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload video. Please try again.');
    } finally {
      setIsUploadingVideo(false);
      e.target.value = '';
    }
  };

  // Handle Photo Upload (Fast Parallel Upload with Auto-Compression)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (memories.length >= 10) {
      setUploadError('Maximum limit of 10 media items reached (photos + videos). Remove a memory to upload more.');
      return;
    }

    setIsUploadingPhoto(true);
    setUploadError(null);

    try {
      const slotsRemaining = 10 - memories.length;
      const filesToUpload = Array.from(files).slice(0, slotsRemaining);

      const uploadPromises = filesToUpload.map(async (file, i) => {
        if (file.size > 25 * 1024 * 1024) {
          throw new Error(`Photo file '${file.name}' exceeds limit.`);
        }
        const res = await uploadPhotoApi(file);
        const returnedUrl = res.url;
        const memoryId = `mem-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`;

        return {
          memory: {
            id: memoryId,
            type: 'photo' as const,
            fileUrl: returnedUrl,
            title: file.name.split('.')[0] || 'Photo Memory',
            caption: '',
            date: '',
            frameStyle: memoryConfig.frameStyle || 'polaroid',
            displayOrder: memories.length + i,
          },
          photo: {
            id: `photo-${Date.now()}-${i}`,
            fileUrl: returnedUrl,
            caption: file.name.split('.')[0] || '',
          },
        };
      });

      const results = await Promise.all(uploadPromises);
      const newMemories = results.map((r) => r.memory);
      const newPhotos = results.map((r) => r.photo);

      setMemories([...memories, ...newMemories]);
      setPhotos([...data.photos, ...newPhotos]);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // Handle Video Link Submission
  const handleAddVideoLink = (e: React.FormEvent) => {
    e.preventDefault();
    setVideoModalError(null);
    const trimmedUrl = videoUrlInput.trim();

    if (!trimmedUrl) {
      setVideoModalError('Please enter a valid video link.');
      return;
    }

    if (memories.length >= 10) {
      setVideoModalError('Maximum limit of 10 media items reached (photos + videos). Remove a memory to add more.');
      return;
    }

    const ytId = parseYouTubeVideoId(trimmedUrl);
    const vimeoMatch = trimmedUrl.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    const isDirectMp4 = trimmedUrl.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i);

    if (!ytId && !vimeoMatch && !isDirectMp4) {
      setVideoModalError('Please enter a valid video link (e.g. https://youtu.be/your-video).');
      return;
    }

    const thumbnailUrl = ytId
      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      : 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80';

    const newVideoMemory: WizardMemoryItem = {
      id: `mem-vid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'video',
      source: ytId ? 'youtube' : 'video_link',
      fileUrl: trimmedUrl,
      videoUrl: trimmedUrl,
      videoId: ytId || undefined,
      thumbnailUrl: thumbnailUrl,
      title: videoTitleInput.trim() || (ytId ? 'YouTube Video Memory' : 'Video Memory'),
      caption: videoCaptionInput.trim() || '',
      date: '',
      frameStyle: memoryConfig.videoFrameStyle || 'cinema',
      displayOrder: memories.length,
    };

    setMemories([...memories, newVideoMemory]);
    setVideoUrlInput('');
    setVideoTitleInput('');
    setVideoCaptionInput('');
    setShowVideoModal(false);
  };

  const handleUpdateItem = (id: string, updates: Partial<WizardMemoryItem>) => {
    const updated = memories.map((m) => (m.id === id ? { ...m, ...updates } : m));
    setMemories(updated);
  };

  const handleRemoveItem = (id: string) => {
    setMemories(memories.filter((m) => m.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...memories];
    const temp = items[index - 1];
    items[index - 1] = items[index];
    items[index] = temp;
    setMemories(items);
  };

  const handleMoveDown = (index: number) => {
    if (index === memories.length - 1) return;
    const items = [...memories];
    const temp = items[index + 1];
    items[index + 1] = items[index];
    items[index] = temp;
    setMemories(items);
  };

  return (
    <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-white">
              Photo & Video Memory Album
            </h3>
            <p className="text-xs text-slate-400">
              Manage uploaded photos, videos, media links, captions, frame styles, and timeline order.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'items' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Memories ({memories.length}/10)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'settings' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="h-3.5 w-3.5 inline mr-1" />
            Album Style
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
          {uploadError}
        </div>
      )}

      {/* 1. MEMORIES ITEMS LIST TAB */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          {/* Action Buttons Bar: Upload Photo, Upload Video, & Add Video Link */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Photo Upload Button */}
            <label
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold transition-all shadow-md ${
                memories.length >= 10
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-pink-500/30 cursor-pointer'
              }`}
            >
              <Upload className="h-4 w-4 text-pink-400 shrink-0" />
              <span>{isUploadingPhoto ? 'Uploading...' : '📷 + Upload Photo'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                multiple
                onChange={handlePhotoUpload}
                disabled={isUploadingPhoto || memories.length >= 10}
                className="hidden"
              />
            </label>

            {/* 2. Video Upload Button (Luvora Hosted) */}
            <label
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all shadow-md ${
                memories.length >= 10
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-purple-500/30 cursor-pointer'
              }`}
            >
              <Film className="h-4 w-4 text-purple-400 shrink-0" />
              <span>{isUploadingVideo ? 'Uploading...' : '🎬 + Upload Video'}</span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*"
                multiple
                onChange={handleVideoUpload}
                disabled={isUploadingVideo || memories.length >= 10}
                className="hidden"
              />
            </label>

            {/* 3. Add Video Link Button */}
            <button
              type="button"
              disabled={memories.length >= 10}
              onClick={() => {
                setVideoModalError(null);
                setShowVideoModal(true);
              }}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-sky-300 text-xs font-bold transition-all shadow-md ${
                memories.length >= 10
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:border-sky-500/40 cursor-pointer'
              }`}
            >
              <LinkIcon className="h-4 w-4 text-sky-400 shrink-0" />
              <span>🔗 + Add Video Link</span>
            </button>
          </div>

          {/* 3. ADD VIDEO LINK FORM / MODAL CARD */}
          {showVideoModal && (
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-950 border border-purple-500/40 shadow-2xl space-y-4 relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    <Film className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-heading text-sm font-bold text-white">Add a Video Memory</h4>
                    <p className="text-[11px] text-slate-400">
                      Paste a YouTube or supported video link to add it to your memories.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Tip for Restricted Videos:
                </p>
                <p className="text-[11px] leading-relaxed text-indigo-200/90">
                  If your YouTube video is age-restricted or unlisted, upload the video file directly to Luvora using <strong className="text-white">🎬 Upload Video</strong> above so it plays seamlessly inside the gift!
                </p>
              </div>

              <form onSubmit={handleAddVideoLink} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Paste Video Link *</label>
                  <div className="relative">
                    <input
                      type="url"
                      required
                      value={videoUrlInput}
                      onChange={(e) => {
                        setVideoUrlInput(e.target.value);
                        if (videoModalError) setVideoModalError(null);
                      }}
                      placeholder="https://youtu.be/your-video"
                      className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
                    />
                    <LinkIcon className="h-4 w-4 text-purple-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-slate-500">Supports YouTube Shorts, Watch, & Share links.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">Title (optional)</label>
                    <input
                      type="text"
                      value={videoTitleInput}
                      onChange={(e) => setVideoTitleInput(e.target.value)}
                      placeholder="Our Best Memory ❤️"
                      className="w-full px-3 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">Caption (optional)</label>
                    <input
                      type="text"
                      value={videoCaptionInput}
                      onChange={(e) => setVideoCaptionInput(e.target.value)}
                      placeholder="Watch this when you miss me."
                      className="w-full px-3 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {videoModalError && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>{videoModalError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowVideoModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-extrabold text-white shadow-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Add Video</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Uploaded & Linked Memory Cards */}
          {memories.length > 0 ? (
            <div className="space-y-4">
              {memories.map((item, idx) => {
                const isVid = item.type === 'video';
                const isLuvoraVideo = isVid && (item.source === 'luvora' || !item.videoId);
                const thumbUrl = item.thumbnailUrl || (isVid ? (getYouTubeThumbnailUrl(item.fileUrl) || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80') : resolveMediaUrl(item.fileUrl));

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 max-w-full overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="h-6 w-6 rounded-lg bg-pink-500/20 text-pink-300 text-xs font-mono font-bold flex items-center justify-center border border-pink-500/30 shrink-0">
                          0{idx + 1}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5 truncate">
                          {isVid ? <Film className="h-3.5 w-3.5 text-purple-400 shrink-0" /> : <ImageIcon className="h-3.5 w-3.5 text-pink-400 shrink-0" />}
                          {isLuvoraVideo ? 'Luvora Hosted Video' : isVid ? 'YouTube Video Link' : 'Photo Memory'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 cursor-pointer"
                        >
                          <MoveUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === memories.length - 1}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 cursor-pointer"
                        >
                          <MoveDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Media Preview Thumbnail */}
                      <div className="sm:col-span-1 h-32 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative group">
                        {isLuvoraVideo ? (
                          <video
                            src={resolveMediaUrl(item.fileUrl)}
                            controls
                            preload="metadata"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <img src={thumbUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                            {isVid && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="h-9 w-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg">
                                  <Play className="h-4 w-4 fill-white ml-0.5" />
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Metadata Input Fields */}
                      <div className="sm:col-span-2 space-y-2">
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                          placeholder="Memory Title (e.g. Our Special Trip)"
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-bold"
                        />

                        <input
                          type="text"
                          value={item.caption || ''}
                          onChange={(e) => handleUpdateItem(item.id, { caption: e.target.value })}
                          placeholder="Short Caption (e.g. Watch this when you miss me)"
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                            <Calendar className="h-3 w-3 text-pink-400 shrink-0" />
                            <input
                              type="text"
                              value={item.date || ''}
                              onChange={(e) => handleUpdateItem(item.id, { date: e.target.value })}
                              placeholder="Year/Date (e.g. 2024)"
                              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                            />
                          </div>

                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                            <MapPin className="h-3 w-3 text-sky-400 shrink-0" />
                            <input
                              type="text"
                              value={item.location || ''}
                              onChange={(e) => handleUpdateItem(item.id, { location: e.target.value })}
                              placeholder="Location Tag"
                              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 rounded-2xl bg-slate-950 border border-dashed border-slate-800 space-y-2">
              <Camera className="h-8 w-8 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-slate-400">No photo or video memories added yet.</p>
              <p className="text-[11px] text-slate-500">Upload photos or add YouTube video links above.</p>
            </div>
          )}
        </div>
      )}

      {/* 2. ALBUM STYLE & CONFIGURATION TAB */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Presentation Layout</label>
            <select
              value={memoryConfig.presentationStyle}
              onChange={(e) => setMemoryConfig({ presentationStyle: e.target.value as any })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            >
              <option value="polaroid">Physical Polaroid Deck</option>
              <option value="portrait_layers">Portrait Layers (Stacked Cards)</option>
              <option value="story">Full Story Album</option>
              <option value="film_strip">Film Strip Gallery</option>
              <option value="scrapbook">Scrapbook Layout</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3 text-pink-400" />
                <span>Auto-Play Duration</span>
              </label>
              <select
                value={memoryConfig.autoPlayInterval}
                onChange={(e) => setMemoryConfig({ autoPlayInterval: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value={1.5}>1.5s Fast Auto-Play (Photos)</option>
                <option value={3}>3 Seconds per Memory</option>
                <option value={5}>5 Seconds per Memory</option>
                <option value={7}>7 Seconds per Memory</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Photo Frame Style</label>
              <select
                value={memoryConfig.frameStyle}
                onChange={(e) => setMemoryConfig({ frameStyle: e.target.value as any })}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="polaroid">Polaroid Style</option>
                <option value="classic">Classic Premium Frame</option>
                <option value="film">35mm Film Strip</option>
                <option value="scrapbook">Scrapbook & Washi Tape</option>
                <option value="heart">Romantic Heart Frame</option>
                <option value="birthday">Birthday Celebration</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
