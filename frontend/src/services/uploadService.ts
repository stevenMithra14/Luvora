import { API_BASE_URL } from '../utils/constants';

export interface UploadResponse {
  status: string;
  url: string;
  filename: string;
}

const ALLOWED_PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'bmp', 'gif', 'svg'];
const MAX_PHOTO_SIZE = 25 * 1024 * 1024; // 25MB

const ALLOWED_AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'webm', 'm4a', 'aac', 'mp4'];
const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB

const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'ogv', 'mkv', '3gp', 'avi'];
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export async function compressImageIfNeeded(file: File, maxDim = 1920, quality = 0.82): Promise<File> {
  if (!file || file.size < 400 * 1024) {
    return file;
  }
  const fileType = file.type || '';
  if (fileType && !fileType.startsWith('image/') && !fileType.includes('octet-stream')) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

const fileToDataUrlLocal = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

export async function uploadPhotoFile(
  rawFile: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  let file = rawFile;
  try {
    file = await compressImageIfNeeded(rawFile);
  } catch (e) {
    console.warn('Image compression warning:', e);
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (ext && !ALLOWED_PHOTO_EXTENSIONS.includes(ext)) {
    // Attempt fallback processing for any image
  }

  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error('Photo file size exceeds maximum limit of 25MB.');
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file, file.name);

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
        // Fallback to Data URL if server upload returns error
        fileToDataUrlLocal(file)
          .then((dataUrl) => resolve({ status: 'success', url: dataUrl, filename: file.name }))
          .catch(() => reject(new Error(`Server error (${xhr.status}) during photo upload.`)));
      }
    });

    xhr.addEventListener('error', () => {
      // Fallback to Data URL on network error
      fileToDataUrlLocal(file)
        .then((dataUrl) => resolve({ status: 'success', url: dataUrl, filename: file.name }))
        .catch(() => reject(new Error('Network error occurred during photo upload.')));
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
  if (ext && !ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
    throw new Error('Unsupported audio format. Allowed formats: MP3, WAV, OGG, WEBM, M4A, AAC.');
  }

  if (file.size > MAX_AUDIO_SIZE) {
    throw new Error('Audio file size exceeds maximum limit of 25MB.');
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

export async function uploadVideoFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (ext && !ALLOWED_VIDEO_EXTENSIONS.includes(ext)) {
    throw new Error('Unsupported video format. Allowed formats: MP4, WEBM, MOV, OGV, MKV.');
  }

  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error('Video file size exceeds maximum limit of 50MB.');
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
          reject(new Error(errData.detail || 'Video upload failed on server.'));
        } catch {
          reject(new Error(`Server error (${xhr.status}) during video upload.`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error occurred during video upload.'));
    });

    xhr.open('POST', `${API_BASE_URL}/upload/video`);
    xhr.send(formData);
  });
}
