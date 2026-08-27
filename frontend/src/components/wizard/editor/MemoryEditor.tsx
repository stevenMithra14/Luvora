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
  Link as LinkIcon
} from 'lucide-react';
import { useWizard, WizardMemoryItem } from '../../../context/WizardContext';
import { uploadPhotoApi, uploadVideoApi, resolveMediaUrl } from '../../../services/giftService';

export const MemoryEditor: React.FC = () => {
  const { data, setMemories, setPhotos, setMemoryConfig } = useWizard();
  const memories = data.memories || [];
  const memoryConfig = data.memoryConfig;

  const [activeTab, setActiveTab] = useState<'items' | 'settings'>('items');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Link inputs for Photos and Videos
  const [showUrlForm, setShowUrlForm] = useState(false);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaTypeInput, setMediaTypeInput] = useState<'photo' | 'video'>('photo');
  const [mediaTitleInput, setMediaTitleInput] = useState('');
  const [mediaCaptionInput, setMediaCaptionInput] = useState('');

  // Handle Photo Upload
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
      const newMemories: WizardMemoryItem[] = [];
      const newPhotos: any[] = [];
      const slotsRemaining = 10 - memories.length;
      const countToUpload = Math.min(files.length, slotsRemaining);

      for (let i = 0; i < countToUpload; i++) {
        const file = files[i];
        if (file.size > 20 * 1024 * 1024) {
          setUploadError(`Photo file '${file.name}' exceeds 20MB limit.`);
          continue;
        }

        const res = await uploadPhotoApi(file);
        const returnedUrl = res.url;
        const memoryId = `mem-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`;
        
        newMemories.push({
          id: memoryId,
          type: 'photo',
          fileUrl: returnedUrl,
          title: file.name.split('.')[0] || 'Photo Memory',
          caption: '',
          date: '',
          frameStyle: memoryConfig.frameStyle || 'polaroid',
          displayOrder: memories.length + i,
        });

        newPhotos.push({
          id: `photo-${Date.now()}-${i}`,
          fileUrl: returnedUrl,
          caption: file.name.split('.')[0] || '',
        });
      }

      setMemories([...memories, ...newMemories]);
      setPhotos([...data.photos, ...newPhotos]);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // Handle Video Upload
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
        if (file.size > 100 * 1024 * 1024) {
          setUploadError(`Video file '${file.name}' exceeds 100MB limit.`);
          continue;
        }

        const res = await uploadVideoApi(file);
        const returnedUrl = res.url;
        const memoryId = `mem-vid-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`;

        newMemories.push({
          id: memoryId,
          type: 'video',
          fileUrl: returnedUrl,
          title: file.name.split('.')[0] || 'Video Memory',
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

  // Handle Direct Link Media Add
  const handleAddMediaByUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    const trimmed = mediaUrlInput.trim();
    if (!trimmed) {
      setUploadError('Please enter a valid media URL.');
      return;
    }

    const newMemory: WizardMemoryItem = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: mediaTypeInput,
      fileUrl: trimmed,
      title: mediaTitleInput.trim() || (mediaTypeInput === 'video' ? 'Linked Video Memory' : 'Linked Photo Memory'),
      caption: mediaCaptionInput.trim() || '',
      date: '',
      frameStyle: mediaTypeInput === 'video' ? (memoryConfig.videoFrameStyle || 'cinema') : (memoryConfig.frameStyle || 'polaroid'),
      displayOrder: memories.length,
    };

    setMemories([...memories, newMemory]);
    setMediaUrlInput('');
    setMediaTitleInput('');
    setMediaCaptionInput('');
    setShowUrlForm(false);
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
          {/* Upload & Link Buttons Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold hover:bg-pink-500/30 cursor-pointer transition-all shadow-md">
              <Upload className="h-4 w-4" />
              <span>{isUploadingPhoto ? 'Uploading...' : '+ Upload Photo'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                multiple
                onChange={handlePhotoUpload}
                disabled={isUploadingPhoto}
                className="hidden"
              />
            </label>

            <label className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold hover:bg-purple-500/30 cursor-pointer transition-all shadow-md">
              <Film className="h-4 w-4" />
              <span>{isUploadingVideo ? 'Uploading...' : '+ Upload Video'}</span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*"
                multiple
                onChange={handleVideoUpload}
                disabled={isUploadingVideo}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => setShowUrlForm((prev) => !prev)}
              className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-sky-300 text-xs font-bold hover:border-sky-500/40 cursor-pointer transition-all shadow-md"
            >
              <LinkIcon className="h-4 w-4 text-sky-400" />
              <span>+ Add Media URL</span>
            </button>
          </div>

          {/* Add Media URL Form */}
          {showUrlForm && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-sky-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-300">Add Photo or Video by Web URL Link</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaTypeInput('photo')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      mediaTypeInput === 'photo' ? 'bg-pink-500 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    Photo URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaTypeInput('video')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      mediaTypeInput === 'video' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    Video URL
                  </button>
                </div>
              </div>

              <input
                type="url"
                value={mediaUrlInput}
                onChange={(e) => setMediaUrlInput(e.target.value)}
                placeholder="Direct Web Image/Video URL (https://...)"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={mediaTitleInput}
                  onChange={(e) => setMediaTitleInput(e.target.value)}
                  placeholder="Title"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500"
                />
                <input
                  type="text"
                  value={mediaCaptionInput}
                  onChange={(e) => setMediaCaptionInput(e.target.value)}
                  placeholder="Caption"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500"
                />
              </div>

              <button
                type="button"
                onClick={handleAddMediaByUrl}
                className="px-5 py-2 rounded-xl bg-sky-500 text-xs font-bold text-white shadow-md hover:bg-sky-600 cursor-pointer"
              >
                Add Linked Memory
              </button>
            </div>
          )}

          {/* List of Uploaded Memory Cards */}
          {memories.length > 0 ? (
            <div className="space-y-4">
              {memories.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="h-6 w-6 rounded-lg bg-pink-500/20 text-pink-300 text-xs font-mono font-bold flex items-center justify-center border border-pink-500/30">
                        0{idx + 1}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                        {item.type === 'video' ? <Film className="h-3.5 w-3.5 text-purple-400" /> : <ImageIcon className="h-3.5 w-3.5 text-pink-400" />}
                        {item.type === 'video' ? 'Video Memory' : 'Photo Memory'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
                      >
                        <MoveUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === memories.length - 1}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
                      >
                        <MoveDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Media Thumbnail */}
                    <div className="sm:col-span-1 h-32 rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                      {item.type === 'video' ? (
                        <video src={resolveMediaUrl(item.fileUrl)} className="w-full h-full object-cover" />
                      ) : (
                        <img src={resolveMediaUrl(item.fileUrl)} alt="Thumbnail" className="w-full h-full object-cover" />
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
                        placeholder="Short Caption (e.g. Couldn't stop laughing 😂)"
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
              ))}
            </div>
          ) : (
            <div className="text-center py-10 rounded-2xl bg-slate-950 border border-dashed border-slate-800 space-y-2">
              <Camera className="h-8 w-8 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-slate-400">No photo or video memories added yet.</p>
              <p className="text-[11px] text-slate-500">Click the buttons above to upload files or paste web links.</p>
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
