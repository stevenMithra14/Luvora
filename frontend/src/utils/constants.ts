const getNormalizedApiUrl = (): string => {
  let envUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
  envUrl = envUrl.trim();
  // Strip trailing slashes
  envUrl = envUrl.replace(/\/+$/, '');
  // Fix accidental double /api/api
  if (envUrl.endsWith('/api/api')) {
    envUrl = envUrl.substring(0, envUrl.length - 4);
  }
  // Ensure /api suffix
  if (!envUrl.endsWith('/api')) {
    envUrl = `${envUrl}/api`;
  }
  return envUrl;
};

export const API_BASE_URL = getNormalizedApiUrl();
export const APP_NAME = 'Luvora';
