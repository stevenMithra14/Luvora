import React from 'react';
import { MusicTrack, SpotifyTrack } from '../../context/WizardContext';

interface FloatingCassettePlayerProps {
  tracks?: MusicTrack[];
  singleMusicUrl?: string;
  spotifyTrack?: SpotifyTrack | null;
  autoStart?: boolean;
}

export const parseSpotifyTrackId = (url?: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  const matchWeb = trimmed.match(/open\.spotify\.com\/(?:[a-zA-Z0-9_-]+\/)?track\/([a-zA-Z0-9]+)/i);
  if (matchWeb && matchWeb[1]) {
    return matchWeb[1];
  }

  const matchUri = trimmed.match(/spotify:track:([a-zA-Z0-9]+)/i);
  if (matchUri && matchUri[1]) {
    return matchUri[1];
  }

  return null;
};

export const FloatingCassettePlayer: React.FC<FloatingCassettePlayerProps> = () => {
  // Completely disabled per user request ("remove the complete song part only")
  return null;
};
