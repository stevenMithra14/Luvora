export interface UploadResponse {
  status: string;
  url: string;
  filename: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const ALLOWED_PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];
const MAX_AUDIO_SIZE = 15 * 1024 * 1024; // 15MB

export async function uploadPhotoFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_PHOTO_EXTENSIONS.includes(ext)) {
    throw new Error('Unsupported image format. Allowed formats: JPG, JPEG, PNG, WEBP.');
  }

  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error('Photo file size exceeds maximum limit of 10MB.');
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res: UploadResponse = JSON.parse(xhr.responseText);
          resolve(res);
        } catch {
          reject(new Error('Failed to parse server upload response.'));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData.detail || 'Photo upload failed on server.'));
        } catch {
          reject(new Error(`Server error (${xhr.status}) during photo upload.`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error occurred during photo upload.'));
    });

    xhr.open('POST', `${API_BASE_URL}/upload/photo`);
    xhr.send(formData);
  });
}

export async function uploadAudioFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
    throw new Error('Unsupported audio format. Allowed formats: MP3, WAV, OGG, M4A, AAC.');
  }

  if (file.size > MAX_AUDIO_SIZE) {
    throw new Error('Audio file size exceeds maximum limit of 15MB.');
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res: UploadResponse = JSON.parse(xhr.responseText);
          resolve(res);
        } catch {
          reject(new Error('Failed to parse server upload response.'));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData.detail || 'Audio upload failed on server.'));
        } catch {
          reject(new Error(`Server error (${xhr.status}) during audio upload.`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error occurred during audio upload.'));
    });

    xhr.open('POST', `${API_BASE_URL}/upload/audio`);
    xhr.send(formData);
  });
}
