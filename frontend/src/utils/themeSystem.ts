export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  background: string;
  fontHeading: string;
  fontBody: string;
  accentColor: string;
  textColor: string;
  cardBg: string;
  buttonStyle: string;
  animationType: 'fade' | 'floating' | 'slide' | 'soft-reveal';
  previewGradient: string;
}

export const LUVORA_THEMES: Record<string, ThemeConfig> = {
  'theme-romantic': {
    id: 'theme-romantic',
    name: 'Romantic Blush',
    description: 'Soft rose gold, crimson accents, serif typography, and floating heart feelings.',
    background: 'bg-gradient-to-br from-slate-950 via-rose-950/40 to-slate-950',
    fontHeading: "'Playfair Display', Georgia, serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    accentColor: '#ec4899',
    textColor: '#fdf2f8',
    cardBg: 'bg-slate-900/80 border-rose-500/30',
    buttonStyle: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/25',
    animationType: 'floating',
    previewGradient: 'from-pink-500 via-rose-500 to-red-500',
  },
  'theme-midnight': {
    id: 'theme-midnight',
    name: 'Midnight Stars',
    description: 'Deep cosmic indigo, glowing violet stardust, and dreamlike atmosphere.',
    background: 'bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-950',
    fontHeading: "'Playfair Display', Georgia, serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    accentColor: '#8b5cf6',
    textColor: '#f1f5f9',
    cardBg: 'bg-slate-900/80 border-indigo-500/30',
    buttonStyle: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/25',
    animationType: 'soft-reveal',
    previewGradient: 'from-indigo-600 via-purple-600 to-blue-600',
  },
  'theme-sunset': {
    id: 'theme-sunset',
    name: 'Sunset Glow',
    description: 'Warm amber, golden coral hues, and elegant nostalgic twilight vibes.',
    background: 'bg-gradient-to-br from-slate-950 via-amber-950/40 to-slate-950',
    fontHeading: "'Playfair Display', Georgia, serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    accentColor: '#f59e0b',
    textColor: '#fffbeb',
    cardBg: 'bg-slate-900/80 border-amber-500/30',
    buttonStyle: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/25',
    animationType: 'slide',
    previewGradient: 'from-amber-500 via-orange-500 to-red-500',
  },
  'theme-dreamy': {
    id: 'theme-dreamy',
    name: 'Dreamy Lavender',
    description: 'Soft pastel purple, ethereal cyan highlights, and gentle floating rhythm.',
    background: 'bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950',
    fontHeading: "'Playfair Display', Georgia, serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    accentColor: '#c084fc',
    textColor: '#faf5ff',
    cardBg: 'bg-slate-900/80 border-purple-500/30',
    buttonStyle: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/25',
    animationType: 'floating',
    previewGradient: 'from-purple-400 via-pink-400 to-cyan-400',
  },
  'theme-minimal': {
    id: 'theme-minimal',
    name: 'Minimal Obsidian',
    description: 'Sleek dark monochrome, emerald accents, and clean modern lines.',
    background: 'bg-slate-950',
    fontHeading: "'Plus Jakarta Sans', sans-serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    accentColor: '#10b981',
    textColor: '#f8fafc',
    cardBg: 'bg-slate-900/90 border-slate-800',
    buttonStyle: 'bg-emerald-500 text-slate-950 font-bold shadow-emerald-500/20',
    animationType: 'fade',
    previewGradient: 'from-slate-700 via-slate-800 to-emerald-500',
  },
  'theme-celebration': {
    id: 'theme-celebration',
    name: 'Party Celebration',
    description: 'Vibrant celebratory sparkles, festive magenta, and joyful energy.',
    background: 'bg-gradient-to-br from-slate-950 via-rose-950/30 to-purple-950/30',
    fontHeading: "'Playfair Display', Georgia, serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    accentColor: '#f43f5e',
    textColor: '#fff1f2',
    cardBg: 'bg-slate-900/85 border-rose-500/40',
    buttonStyle: 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white shadow-rose-500/30',
    animationType: 'soft-reveal',
    previewGradient: 'from-rose-500 via-pink-500 to-amber-400',
  },
};

export const DEFAULT_THEME_ID = 'theme-romantic';

export function getThemeConfig(themeId?: string): ThemeConfig {
  if (themeId && LUVORA_THEMES[themeId]) {
    return LUVORA_THEMES[themeId];
  }
  return LUVORA_THEMES[DEFAULT_THEME_ID];
}
