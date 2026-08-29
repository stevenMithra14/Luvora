import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WizardPhoto {
  id: string;
  fileUrl: string;
  caption: string;
}

export interface WizardMemoryItem {
  id: string;
  type: 'photo' | 'video';
  source?: string;
  fileUrl: string;
  videoUrl?: string;
  videoId?: string;
  thumbnailUrl?: string;
  title?: string;
  caption?: string;
  date?: string;
  location?: string;
  memoryStory?: string;
  frameStyle?: 'classic' | 'polaroid' | 'film' | 'scrapbook' | 'elegant' | 'heart' | 'birthday' | 'cinema' | 'phone';
  displayOrder: number;
  trimStart?: number;
  trimEnd?: number;
}

export interface MemoryConfig {
  introText: string;
  endingText: string;
  frameStyle: 'classic' | 'polaroid' | 'film' | 'scrapbook' | 'elegant' | 'heart' | 'birthday';
  videoFrameStyle: 'cinema' | 'phone' | 'film' | 'polaroid' | 'birthday' | 'elegant' | 'scrapbook';
  presentationStyle: 'story' | 'polaroid' | 'film_strip' | 'scrapbook' | 'memory_cards' | 'carousel' | 'portrait_layers';
  transitionStyle: 'slide' | 'fade' | 'zoom' | 'polaroid' | 'flip';
  autoPlay: boolean;
  autoPlayInterval: number; // 3, 5, 7, 10 seconds
  fastAutoPlay?: boolean; // 1.5s rapid photo auto-play
  backgroundStyle: 'dark' | 'light' | 'gradient' | 'photo_blur' | 'theme';
  mixedMode: boolean;
}

export interface WizardSection {
  id: string;
  sectionType: string;
  title: string;
  content: Record<string, any>;
}

export interface WizardInteractive {
  id: string;
  interactiveType: string;
  configurationJson: Record<string, any>;
}

export type GoodieType = 'note' | 'photo' | 'video' | 'song' | 'voice' | 'drawing' | 'place' | 'coupon' | 'custom_card' | 'surprise';

export interface WizardGoodie {
  id: string;
  goodieType: GoodieType;
  title: string;
  description?: string;
  content?: any;
  mediaUrl?: string;
  configurationJson: Record<string, any>;
  displayOrder: number;
  isEnabled: boolean;
}

export interface GiftBoxConfig {
  preset: 'classic' | 'elegant' | 'birthday' | 'romantic' | 'cute' | 'luxury' | 'minimal' | 'surprise';
  boxColor: string;
  ribbonColor: string;
  ribbonStyle: 'classic' | 'satin' | 'glowing' | 'dotted';
  bowStyle: 'classic' | 'double' | 'star' | 'heart';
  pattern: 'none' | 'dots' | 'stars' | 'hearts' | 'stripes';
  openingMessage: string;
}

export interface CakeConfig {
  preset: 'classic_birthday' | 'chocolate' | 'strawberry' | 'elegant' | 'cute' | 'luxury' | 'minimal' | 'rainbow';
  cakeStyle: 'single_tier' | 'double_tier' | 'heart' | 'cupcake_stack';
  frostingColor: string;
  candleCount: number;
  candleColor: string;
  cakeMessage: string;
  toppings: 'sprinkles' | 'berries' | 'candles_only' | 'sparklers';
}

export interface MusicTrack {
  id: string;
  url: string;
  title: string;
  artist: string;
  albumCoverUrl?: string;
  trimStart?: number;
  trimEnd?: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  artists?: string[];
  album: string;
  albumArt: string;
  durationMs?: number;
  durationFormatted?: string;
  previewUrl?: string;
  spotifyUrl?: string;
  embedUrl?: string;
  uri?: string;
}

export interface WizardData {
  occasion: string;
  recipientName: string;
  recipientDate: string;
  dontKnowYear: boolean;
  
  // Customization Editor Fields
  coverTitle: string;
  coverSubtitle: string;
  coverStyle: 'classic' | 'modern' | 'minimal' | 'banner';
  title: string;
  message: string;
  themeId: string;
  fontFamily: string;
  fontSize: 'sm' | 'md' | 'lg';
  textAlign: 'left' | 'center' | 'right';
  backgroundType: 'solid' | 'gradient' | 'image';
  customBgValue: string;
  animationStyle: 'fade' | 'floating' | 'slide' | 'soft-reveal';
  musicUrl: string;
  musicTracks: MusicTrack[];
  spotifyTrack?: SpotifyTrack | null;
  musicSource?: 'custom' | 'spotify';
  password: string;
  passwordHint?: string;

  // Gift Box & Cake Customization
  giftBoxConfig: GiftBoxConfig;
  cakeConfig: CakeConfig;
  
  // Photo & Video Memories Experience
  memoryConfig: MemoryConfig;
  memories: WizardMemoryItem[];

  photos: WizardPhoto[];
  sections: WizardSection[];
  interactives: WizardInteractive[];
  goodies: WizardGoodie[];
  currentStep: number;
}

interface WizardContextType {
  data: WizardData;
  setOccasion: (occasion: string) => void;
  setRecipientInfo: (name: string, date?: string, dontKnowYear?: boolean) => void;
  setCustomization: (details: Partial<WizardData>) => void;
  setGiftBoxConfig: (config: Partial<GiftBoxConfig>) => void;
  setCakeConfig: (config: Partial<CakeConfig>) => void;
  setMemoryConfig: (config: Partial<MemoryConfig>) => void;
  setMemories: (memories: WizardMemoryItem[]) => void;
  setMusicTracks: (tracks: MusicTrack[]) => void;
  setSpotifyTrack: (track: SpotifyTrack | null) => void;
  setPhotos: (photos: WizardPhoto[]) => void;
  setSections: (sections: WizardSection[]) => void;
  setInteractives: (interactives: WizardInteractive[]) => void;
  setGoodies: (goodies: WizardGoodie[]) => void;
  addGoodie: (goodie: WizardGoodie) => void;
  updateGoodie: (id: string, updated: Partial<WizardGoodie>) => void;
  removeGoodie: (id: string) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetWizard: () => void;
}

const defaultGiftBoxConfig: GiftBoxConfig = {
  preset: 'birthday',
  boxColor: '#ec4899',
  ribbonColor: '#f43f5e',
  ribbonStyle: 'satin',
  bowStyle: 'classic',
  pattern: 'stars',
  openingMessage: 'Something special is waiting for you... ❤️',
};

const defaultCakeConfig: CakeConfig = {
  preset: 'classic_birthday',
  cakeStyle: 'double_tier',
  frostingColor: '#f472b6',
  candleCount: 3,
  candleColor: '#fbbf24',
  cakeMessage: 'Make a Wish! ✨',
  toppings: 'sprinkles',
};

const defaultMemoryConfig: MemoryConfig = {
  introText: 'Some moments I never want to forget...',
  endingText: 'Some memories fade, but the moments we shared never will. ❤️',
  frameStyle: 'polaroid',
  videoFrameStyle: 'cinema',
  presentationStyle: 'polaroid',
  transitionStyle: 'slide',
  autoPlay: false,
  autoPlayInterval: 5,
  fastAutoPlay: false,
  backgroundStyle: 'gradient',
  mixedMode: true,
};

const defaultWizardData: WizardData = {
  occasion: '',
  recipientName: '',
  recipientDate: '',
  dontKnowYear: false,
  coverTitle: 'A Special Gift For You',
  coverSubtitle: 'Made with love & cherished memories',
  coverStyle: 'classic',
  title: 'Turn Your Feelings Into Memories',
  message: 'I created this digital experience just for you to celebrate all the wonderful moments we share.',
  themeId: 'theme-romantic',
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 'md',
  textAlign: 'center',
  backgroundType: 'gradient',
  customBgValue: '',
  animationStyle: 'floating',
  musicUrl: '',
  musicTracks: [],
  spotifyTrack: null,
  password: '',
  giftBoxConfig: defaultGiftBoxConfig,
  cakeConfig: defaultCakeConfig,
  memoryConfig: defaultMemoryConfig,
  memories: [],
  photos: [],
  sections: [],
  interactives: [],
  goodies: [],
  currentStep: 1,
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const WizardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<WizardData>(defaultWizardData);

  const setOccasion = (occasion: string) => {
    setData((prev) => ({ ...prev, occasion }));
  };

  const setRecipientInfo = (recipientName: string, recipientDate: string = '', dontKnowYear: boolean = false) => {
    setData((prev) => ({ ...prev, recipientName, recipientDate, dontKnowYear }));
  };

  const setCustomization = (details: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...details }));
  };

  const setGiftBoxConfig = (config: Partial<GiftBoxConfig>) => {
    setData((prev) => ({
      ...prev,
      giftBoxConfig: { ...prev.giftBoxConfig, ...config },
    }));
  };

  const setCakeConfig = (config: Partial<CakeConfig>) => {
    setData((prev) => ({
      ...prev,
      cakeConfig: { ...prev.cakeConfig, ...config, candleCount: 3 },
    }));
  };

  const setMemoryConfig = (config: Partial<MemoryConfig>) => {
    setData((prev) => ({
      ...prev,
      memoryConfig: { ...prev.memoryConfig, ...config },
    }));
  };

  const setMemories = (memories: WizardMemoryItem[]) => {
    setData((prev) => ({ ...prev, memories }));
  };

  const setMusicTracks = (musicTracks: MusicTrack[]) => {
    setData((prev) => ({
      ...prev,
      musicTracks,
      musicSource: 'custom',
      musicUrl: musicTracks.length > 0 ? musicTracks[0].url : '',
    }));
  };

  const setSpotifyTrack = (track: SpotifyTrack | null) => {
    setData((prev) => ({
      ...prev,
      spotifyTrack: track,
      musicSource: track ? 'spotify' : 'custom',
      musicUrl: track ? (track.previewUrl || track.spotifyUrl || '') : prev.musicUrl,
    }));
  };

  const setPhotos = (photos: WizardPhoto[]) => {
    setData((prev) => ({ ...prev, photos }));
  };

  const setSections = (sections: WizardSection[]) => {
    setData((prev) => ({ ...prev, sections }));
  };

  const setInteractives = (interactives: WizardInteractive[]) => {
    setData((prev) => ({ ...prev, interactives }));
  };

  const setGoodies = (goodies: WizardGoodie[]) => {
    setData((prev) => ({ ...prev, goodies }));
  };

  const addGoodie = (goodie: WizardGoodie) => {
    setData((prev) => ({
      ...prev,
      goodies: [...prev.goodies, { ...goodie, displayOrder: prev.goodies.length }],
    }));
  };

  const updateGoodie = (id: string, updated: Partial<WizardGoodie>) => {
    setData((prev) => ({
      ...prev,
      goodies: prev.goodies.map((g) => (g.id === id ? { ...g, ...updated } : g)),
    }));
  };

  const removeGoodie = (id: string) => {
    setData((prev) => ({
      ...prev,
      goodies: prev.goodies.filter((g) => g.id !== id),
    }));
  };

  const setCurrentStep = (step: number) => {
    setData((prev) => ({ ...prev, currentStep: Math.min(Math.max(step, 1), 6) }));
  };

  const nextStep = () => {
    setData((prev) => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 6) }));
  };

  const prevStep = () => {
    setData((prev) => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 1) }));
  };

  const resetWizard = () => {
    setData(defaultWizardData);
  };

  return (
    <WizardContext.Provider
      value={{
        data,
        setOccasion,
        setRecipientInfo,
        setCustomization,
        setGiftBoxConfig,
        setCakeConfig,
        setMemoryConfig,
        setMemories,
        setMusicTracks,
        setSpotifyTrack,
        setPhotos,
        setSections,
        setInteractives,
        setGoodies,
        addGoodie,
        updateGoodie,
        removeGoodie,
        setCurrentStep,
        nextStep,
        prevStep,
        resetWizard,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};


export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};
