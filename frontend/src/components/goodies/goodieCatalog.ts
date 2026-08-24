import { GoodieType } from '../../context/WizardContext';

export interface GoodieDefinition {
  type: GoodieType;
  name: string;
  icon: string;
  description: string;
  badge?: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultConfig: Record<string, any>;
  imageUrl?: string;
}

export const GOODIE_CATALOG: GoodieDefinition[] = [
  {
    type: 'note',
    name: 'Personal Note',
    icon: '💌',
    imageUrl: '/assets/goodies/typewriter.jpg',
    description: 'Write something special.',
    badge: 'Popular',
    defaultTitle: 'A Personal Note',
    defaultDescription: 'A little message written straight from the heart.',
    defaultConfig: {
      title: 'Dear You',
      message: 'I just wanted you to know how special you are to me.',
      signature: 'Love, Steven ❤️',
      fontStyle: 'serif', // serif, calligraphy, modern, handwritten, elegant
      textAlign: 'center', // left, center, right
      noteStyle: 'romantic', // letter, paper, polaroid, minimal, romantic, birthday
    },
  },
  {
    type: 'photo',
    name: 'Photo Memory',
    icon: '📸',
    imageUrl: '/assets/goodies/camera.jpg',
    description: 'Share a cherished picture.',
    badge: 'Visual',
    defaultTitle: 'A Special Photo',
    defaultDescription: 'A snapshot of a moment that meant everything.',
    defaultConfig: {
      photoUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
      caption: 'Forever cherished moment ❤️',
      date: 'Special Memory',
      message: 'Looking back at this picture always brings a smile to my face.',
    },
  },
  {
    type: 'song',
    name: 'Favorite Song',
    icon: '🎵',
    imageUrl: '/assets/goodies/song.jpg',
    description: 'Add a track that reminds you of them.',
    badge: 'Audio',
    defaultTitle: 'A Song For You',
    defaultDescription: 'A special track picked just for you.',
    defaultConfig: {
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      songTitle: 'Perfect',
      artist: 'A song that reminds me of you',
      message: 'Whenever I hear this song, I think of you.',
    },
  },
  {
    type: 'video',
    name: 'Video Clip',
    icon: '🎥',
    imageUrl: '/assets/goodies/video.jpg',
    description: 'Embed a meaningful video.',
    badge: 'Video',
    defaultTitle: 'A Special Video',
    defaultDescription: 'Watch a favorite video clip saved for you.',
    defaultConfig: {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
      title: 'Watch This Special Moment',
      caption: 'A video that always brings back wonderful memories.',
    },
  },
  {
    type: 'surprise',
    name: 'Hidden Surprise',
    icon: '✨',
    imageUrl: '/assets/goodies/surprise.jpg',
    description: 'Create a mystery box reveal.',
    badge: 'Surprise',
    defaultTitle: 'Don\'t Open This Yet 👀',
    defaultDescription: 'Click to unlock a hidden secret!',
    defaultConfig: {
      title: 'Don\'t open this yet 👀',
      hiddenMessage: 'I love you ❤️',
      hiddenPhotoUrl: '',
      hiddenVideoUrl: '',
      hiddenAudioUrl: '',
      enableConfetti: true,
    },
  },
  {
    type: 'voice',
    name: 'Voice Message',
    icon: '🎙️',
    imageUrl: '/assets/goodies/voice.jpg',
    description: 'Record or upload a voice message.',
    badge: 'Personal',
    defaultTitle: 'Voice Message',
    defaultDescription: 'Listen to a personal voice note.',
    defaultConfig: {
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      title: 'Listen when you miss me',
      caption: 'Press play to hear my message for you ❤️',
    },
  },
  {
    type: 'drawing',
    name: 'Hand Drawing',
    icon: '🎨',
    imageUrl: '/assets/goodies/drawing.jpg',
    description: 'Doodle or draw something custom.',
    badge: 'Creative',
    defaultTitle: 'Handmade Doodle',
    defaultDescription: 'A little drawing made just for you.',
    defaultConfig: {
      drawingDataUrl: '',
      title: 'Made with love ❤️',
      caption: 'A little sketch created especially for you.',
    },
  },
  {
    type: 'place',
    name: 'Special Place',
    icon: '📍',
    imageUrl: '/assets/goodies/place.jpg',
    description: 'Highlight a Google Maps location.',
    badge: 'Memory',
    defaultTitle: 'Our Favorite Spot',
    defaultDescription: 'A location that holds unforgettable memories.',
    defaultConfig: {
      placeName: 'Our Favorite Coffee Shop',
      description: 'This is where we had our first coffee together.',
      latitude: 40.7128,
      longitude: -74.006,
      photoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    },
  },
];
