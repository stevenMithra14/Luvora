import { WizardData } from '../context/WizardContext';
import { API_BASE_URL } from '../utils/constants';
import { compressImageIfNeeded } from './uploadService';

export const parseYouTubeVideoId = (rawUrl?: string): string | null => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
};

export const getYouTubeEmbedUrl = (rawUrl?: string): string | null => {
  const videoId = parseYouTubeVideoId(rawUrl);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  }
  return null;
};

export const getYouTubeThumbnailUrl = (rawUrl?: string): string | null => {
  const videoId = parseYouTubeVideoId(rawUrl);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return null;
};

export interface PublicGoodieResponse {
  id: string;
  gift_id: string;
  goodie_type: string;
  title?: string;
  description?: string;
  content?: any;
  media_url?: string;
  configuration_json: Record<string, any>;
  display_order: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublishedGiftResponse {
  id: string;
  public_id: string;
  edit_token: string;
  occasion_type: string;
  recipient_name: string;
  recipient_date?: string;
  title: string;
  message?: string;
  theme_id?: string;
  music_url?: string;
  password_enabled: boolean;
  password_hint?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  photos: any[];
  sections: any[];
  interactives: any[];
  goodies: PublicGoodieResponse[];
}

export interface PublicGiftResponse {
  public_id: string;
  occasion_type: string;
  recipient_name: string;
  recipient_date?: string;
  title: string;
  message?: string;
  theme_id?: string;
  music_url?: string;
  password_enabled: boolean;
  password_hint?: string;
  is_locked: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  photos: any[];
  sections: any[];
  interactives: any[];
  goodies: PublicGoodieResponse[];
}

export async function uploadPhotoApi(rawFile: File | Blob, filename?: string): Promise<{ status: string; url: string; filename: string }> {
  let fileToUpload = rawFile;
  if (rawFile instanceof File) {
    try {
      fileToUpload = await compressImageIfNeeded(rawFile);
    } catch (e) {
      console.warn('Image compression warning, proceeding with uncompressed image:', e);
    }
  }

  const actualFilename = filename || (rawFile instanceof File ? rawFile.name : 'photo.jpg');
  const formData = new FormData();
  formData.append('file', fileToUpload, actualFilename);

  const response = await fetch(`${API_BASE_URL}/upload/photo`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(parseErrorDetail(errorData, 'Failed to upload photo to persistent storage.'));
  }

  return await response.json();
}

export async function uploadAudioApi(file: File | Blob, filename = 'voice_message.webm'): Promise<{ status: string; url: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file, filename);

  const response = await fetch(`${API_BASE_URL}/upload/audio`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(parseErrorDetail(errorData, 'Failed to upload audio to persistent storage.'));
  }

  return await response.json();
}

export async function uploadVideoApi(file: File): Promise<{ status: string; url: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file, file.name);

  const response = await fetch(`${API_BASE_URL}/upload/video`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(parseErrorDetail(errorData, 'Failed to upload video to persistent storage.'));
  }

  return await response.json();
}

export const SAFE_PUBLISH_USER_MESSAGE = "We couldn't publish your gift right now. Your saved work is safe. Please try again.";

export const isTechnicalDatabaseError = (msg?: string | null): boolean => {
  if (!msg || typeof msg !== 'string') return false;
  const lower = msg.toLowerCase();
  return (
    lower.includes('psycopg2') ||
    lower.includes('operationalerror') ||
    lower.includes('sqlalchemy') ||
    lower.includes('tenant/user') ||
    lower.includes('enotfound') ||
    lower.includes('pooler.supabase.com') ||
    lower.includes('supabase.co') ||
    lower.includes('internal server error') ||
    lower.includes('server error:') ||
    lower.includes('connection refused') ||
    lower.includes('password authentication failed') ||
    lower.includes('database error') ||
    lower.includes('could not translate host name') ||
    lower.includes('ssl error')
  );
};

export const parseErrorDetail = (errorData: any, fallback: string = SAFE_PUBLISH_USER_MESSAGE): string => {
  if (!errorData) return fallback;
  const detail = errorData.detail;
  if (!detail) {
    const rawMsg = errorData.message || fallback;
    return isTechnicalDatabaseError(rawMsg) ? SAFE_PUBLISH_USER_MESSAGE : rawMsg;
  }
  if (typeof detail === 'string') {
    return isTechnicalDatabaseError(detail) ? SAFE_PUBLISH_USER_MESSAGE : detail;
  }
  if (Array.isArray(detail)) {
    const msgs = detail.map((item: any) => {
      if (typeof item === 'string') return item;
      if (item.msg && typeof item.msg === 'string') {
        const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : '';
        if (field === 'password' || field === 'password_enabled') return 'Please enter a valid access password.';
        if (field === 'recipient_name') return 'Please enter the recipient name.';
        if (field === 'recipient_date') return 'Please enter a valid date or select "I don\'t know the year".';
        return field ? `${field}: ${item.msg}` : item.msg;
      }
      return typeof item === 'object' ? JSON.stringify(item) : String(item);
    });
    const joined = msgs.join(', ');
    return isTechnicalDatabaseError(joined) ? SAFE_PUBLISH_USER_MESSAGE : joined;
  }
  if (typeof detail === 'object') {
    const objMsg = detail.message || detail.msg || JSON.stringify(detail);
    return isTechnicalDatabaseError(objMsg) ? SAFE_PUBLISH_USER_MESSAGE : objMsg;
  }
  return fallback;
};

const sanitizeRecipientDate = (val?: string): string | null => {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
};

export const resolveMediaUrl = (rawUrl?: string, fallbackUrl: string = ''): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return fallbackUrl;
  const trimmed = rawUrl.trim();
  if (!trimmed) return fallbackUrl;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('/uploads/')) {
    const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${backendOrigin}${trimmed}`;
  }
  if (trimmed.startsWith('uploads/')) {
    const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${backendOrigin}/${trimmed}`;
  }
  const cleanPath = trimmed.replace(/^\/+/, '');
  if (cleanPath.startsWith('gifts/') || cleanPath.startsWith('luvora-media/')) {
    const pathWithoutBucket = cleanPath.startsWith('luvora-media/') ? cleanPath.replace(/^luvora-media\//, '') : cleanPath;
    const viteSupabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
    if (viteSupabaseUrl) {
      const base = viteSupabaseUrl.replace(/\/+$/, '');
      return `${base}/storage/v1/object/public/luvora-media/${pathWithoutBucket}`;
    }
    const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${backendOrigin}/uploads/${cleanPath.split('/').pop()}`;
  }
  return trimmed;
};

export async function fetchSpotifyOEmbed(spotifyUrl: string): Promise<{
  title?: string;
  artist?: string;
  thumbnail_url?: string;
  html?: string;
} | null> {
  try {
    const oembedEndpoint = `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`;
    const res = await fetch(oembedEndpoint);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title || '',
      artist: data.author_name || '',
      thumbnail_url: data.thumbnail_url || '',
      html: data.html || ''
    };
  } catch (e) {
    return null;
  }
}

export async function publishGiftApi(data: WizardData): Promise<PublishedGiftResponse> {
  // Sanitize photos and memories to ensure no temporary blob: URLs are persisted
  const rawPhotos = (data.photos || []).filter((p) => p.fileUrl && !p.fileUrl.startsWith('blob:'));
  const rawMemories = (data.memories || []).filter((m) => m.fileUrl && !m.fileUrl.startsWith('blob:'));

  const finalPhotos = rawPhotos.length > 0
    ? rawPhotos
    : rawMemories.filter((m) => m.type === 'photo' || m.fileUrl).map((m, idx) => ({
        id: m.id || `photo-${idx}`,
        fileUrl: m.fileUrl,
        caption: m.caption || m.title || '',
      }));

  const finalMemories = rawMemories.length > 0
    ? rawMemories
    : rawPhotos.map((p, idx) => ({
        id: p.id || `mem-${idx}`,
        type: 'photo' as const,
        fileUrl: p.fileUrl,
        title: p.caption || 'Photo Memory',
        caption: p.caption || '',
        date: '',
        frameStyle: data.memoryConfig?.frameStyle || 'polaroid',
        displayOrder: idx,
      }));

  // Filter out system interactives from custom interactives to avoid duplication
  const baseInteractives = (data.interactives || []).filter(
    (i) =>
      i.interactiveType !== 'photo_memories' &&
      i.interactiveType !== 'cake_box_config' &&
      i.interactiveType !== 'spotify_music'
  );

  const payload = {
    occasion_type: data.occasion || 'general',
    recipient_name: (data.recipientName || 'Someone Special').trim(),
    recipient_date: sanitizeRecipientDate(data.recipientDate),
    title: data.title || data.coverTitle || 'A Special Gift For You',
    message: data.message || '',
    theme_id: data.themeId || 'theme-romantic',
    music_url: data.spotifyTrack ? (data.spotifyTrack.previewUrl || data.spotifyTrack.spotifyUrl || data.musicUrl) : (data.musicUrl || null),
    password: data.password && data.password.trim() ? data.password.trim() : null,
    password_hint: data.passwordHint && data.passwordHint.trim() ? data.passwordHint.trim() : null,
    password_enabled: (data as any).password_enabled ?? false,
    is_published: true,
    photos: finalPhotos.map((p, idx) => ({
      file_url: p.fileUrl,
      caption: p.caption || '',
      display_order: idx
    })),
    sections: data.sections.map((s, idx) => ({
      section_type: s.sectionType,
      title: s.title || '',
      content: s.content || {},
      display_order: idx,
      is_enabled: true
    })),
    interactives: [
      ...baseInteractives.map((i, idx) => ({
        interactive_type: i.interactiveType,
        configuration_json: i.configurationJson || {},
        display_order: idx,
        is_enabled: true
      })),
      ...(finalMemories.length > 0 ? [{
        interactive_type: 'photo_memories',
        configuration_json: {
          memories: finalMemories,
          memoryConfig: data.memoryConfig
        },
        display_order: baseInteractives.length,
        is_enabled: true
      }] : []),
      ...(data.spotifyTrack ? [{
        interactive_type: 'spotify_music',
        configuration_json: {
          spotifyTrack: data.spotifyTrack,
          musicSource: data.musicSource || 'spotify'
        },
        display_order: baseInteractives.length + 1,
        is_enabled: true
      }] : []),
      {
        interactive_type: 'cake_box_config',
        configuration_json: {
          cakeConfig: data.cakeConfig,
          giftBoxConfig: data.giftBoxConfig
        },
        display_order: baseInteractives.length + 2,
        is_enabled: true
      }
    ],
    goodies: (data.goodies || []).map((g, idx) => {
      const cleanMediaUrl = g.mediaUrl && !g.mediaUrl.startsWith('blob:') ? g.mediaUrl : null;
      return {
        goodie_type: g.goodieType,
        title: g.title || '',
        description: g.description || '',
        content: g.content || {},
        media_url: cleanMediaUrl,
        configuration_json: g.configurationJson || {},
        display_order: g.displayOrder ?? idx,
        is_enabled: g.isEnabled ?? true
      };
    })
  };

  try {
    const response = await fetch(`${API_BASE_URL}/gifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const parsed = parseErrorDetail(errorData, SAFE_PUBLISH_USER_MESSAGE);
      if (response.status >= 500 || isTechnicalDatabaseError(parsed)) {
        throw new Error(SAFE_PUBLISH_USER_MESSAGE);
      }
      throw new Error(parsed);
    }

    return await response.json();
  } catch (err: any) {
    if (err instanceof TypeError && (err.message === 'Failed to fetch' || err.message.includes('fetch'))) {
      throw new Error(
        `Unable to connect to Luvora API server (${API_BASE_URL}). If hosted on Render free tier, the backend server may be spinning up from sleep (takes up to 50s). Please wait a moment and tap 'Send Gift Now' again.`
      );
    }
    throw err;
  }
}

export async function updateGiftApi(editToken: string, data: WizardData): Promise<PublishedGiftResponse> {
  const rawPhotos = (data.photos || []).filter((p) => p.fileUrl && !p.fileUrl.startsWith('blob:'));
  const rawMemories = (data.memories || []).filter((m) => m.fileUrl && !m.fileUrl.startsWith('blob:'));

  const finalPhotos = rawPhotos.length > 0
    ? rawPhotos
    : rawMemories.filter((m) => m.type === 'photo' || m.fileUrl).map((m, idx) => ({
        id: m.id || `photo-${idx}`,
        fileUrl: m.fileUrl,
        caption: m.caption || m.title || '',
      }));

  const finalMemories = rawMemories.length > 0
    ? rawMemories
    : rawPhotos.map((p, idx) => ({
        id: p.id || `mem-${idx}`,
        type: 'photo' as const,
        fileUrl: p.fileUrl,
        title: p.caption || 'Photo Memory',
        caption: p.caption || '',
        date: '',
        frameStyle: data.memoryConfig?.frameStyle || 'polaroid',
        displayOrder: idx,
      }));

  const baseInteractives = (data.interactives || []).filter(
    (i) =>
      i.interactiveType !== 'photo_memories' &&
      i.interactiveType !== 'cake_box_config' &&
      i.interactiveType !== 'spotify_music'
  );

  const payload = {
    occasion_type: data.occasion || 'general',
    recipient_name: data.recipientName.trim(),
    recipient_date: data.recipientDate || null,
    title: data.title || data.coverTitle || 'A Special Gift For You',
    message: data.message || '',
    theme_id: data.themeId || 'theme-romantic',
    music_url: data.spotifyTrack ? (data.spotifyTrack.spotifyUrl || data.musicUrl) : (data.musicUrl || null),
    password: data.password && data.password.trim() ? data.password.trim() : null,
    password_hint: data.passwordHint && data.passwordHint.trim() ? data.passwordHint.trim() : null,
    password_enabled: Boolean(data.password && data.password.trim()),
    is_published: true,
    photos: finalPhotos.map((p, idx) => ({
      file_url: p.fileUrl,
      caption: p.caption || '',
      display_order: idx
    })),
    sections: data.sections.map((s, idx) => ({
      section_type: s.sectionType,
      title: s.title || '',
      content: s.content || {},
      display_order: idx,
      is_enabled: true
    })),
    interactives: [
      ...baseInteractives.map((i, idx) => ({
        interactive_type: i.interactiveType,
        configuration_json: i.configurationJson || {},
        display_order: idx,
        is_enabled: true
      })),
      ...(finalMemories.length > 0 ? [{
        interactive_type: 'photo_memories',
        configuration_json: {
          memories: finalMemories,
          memoryConfig: data.memoryConfig
        },
        display_order: baseInteractives.length,
        is_enabled: true
      }] : []),
      ...(data.spotifyTrack ? [{
        interactive_type: 'spotify_music',
        configuration_json: {
          spotifyTrack: data.spotifyTrack,
          musicSource: data.musicSource || 'spotify'
        },
        display_order: baseInteractives.length + 1,
        is_enabled: true
      }] : []),
      {
        interactive_type: 'cake_box_config',
        configuration_json: {
          cakeConfig: data.cakeConfig,
          giftBoxConfig: data.giftBoxConfig
        },
        display_order: baseInteractives.length + 2,
        is_enabled: true
      }
    ],
    goodies: (data.goodies || []).map((g, idx) => {
      const cleanMediaUrl = g.mediaUrl && !g.mediaUrl.startsWith('blob:') ? g.mediaUrl : null;
      return {
        goodie_type: g.goodieType,
        title: g.title || '',
        description: g.description || '',
        content: g.content || {},
        media_url: cleanMediaUrl,
        configuration_json: g.configurationJson || {},
        display_order: g.displayOrder ?? idx,
        is_enabled: g.isEnabled ?? true
      };
    })
  };

  const response = await fetch(`${API_BASE_URL}/gifts/edit/${editToken}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const parsed = parseErrorDetail(errorData, SAFE_PUBLISH_USER_MESSAGE);
    if (response.status >= 500 || isTechnicalDatabaseError(parsed)) {
      throw new Error(SAFE_PUBLISH_USER_MESSAGE);
    }
    throw new Error(parsed);
  }

  return await response.json();
}

export async function fetchPublicGiftApi(publicId: string): Promise<PublicGiftResponse> {
  const response = await fetch(`${API_BASE_URL}/gifts/public/${publicId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Gift not found or URL expired.');
  }
  return await response.json();
}

export async function verifyGiftPasswordApi(publicId: string, password: string): Promise<{ verified: boolean; access_token: string }> {
  const response = await fetch(`${API_BASE_URL}/gifts/public/${publicId}/verify-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Incorrect password.');
  }

  return await response.json();
}

export async function fetchUnlockedGiftApi(publicId: string, accessToken: string): Promise<PublicGiftResponse> {
  const response = await fetch(`${API_BASE_URL}/gifts/public/${publicId}/unlocked-content?access_token=${encodeURIComponent(accessToken)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to retrieve unlocked gift content.');
  }

  return await response.json();
}

export async function fetchEditGiftApi(editToken: string): Promise<PublishedGiftResponse> {
  const response = await fetch(`${API_BASE_URL}/gifts/edit/${editToken}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Invalid edit token.');
  }
  return await response.json();
}

// Dedicated Goodie API endpoints
export async function createGoodieApi(giftId: string, goodie: any): Promise<PublicGoodieResponse> {
  const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/goodies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goodie)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create goodie.');
  }

  return await response.json();
}

export async function fetchGoodiesApi(giftId: string): Promise<PublicGoodieResponse[]> {
  const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/goodies`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch goodies.');
  }
  return await response.json();
}

export async function updateGoodieApi(goodieId: string, goodieUpdate: any): Promise<PublicGoodieResponse> {
  const response = await fetch(`${API_BASE_URL}/goodies/${goodieId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goodieUpdate)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update goodie.');
  }

  return await response.json();
}

export async function deleteGoodieApi(goodieId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/goodies/${goodieId}`, { method: 'DELETE' });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete goodie.');
  }
}

export async function reorderGoodiesApi(giftId: string, items: { id: string; display_order: number }[]): Promise<PublicGoodieResponse[]> {
  const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/goodies/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(items)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to reorder goodies.');
  }

  return await response.json();
}

