import {
  HelpCircle as QuestionIcon,
  Cake,
  Heart,
  RotateCw,
  Sliders,
  CheckSquare,
  MessageSquare,
  Sparkles,
  Gift as BoxIcon,
  Trophy,
  Users,
  LucideIcon
} from 'lucide-react';

export interface GameDefinition {
  id: string; // e.g. birthday_quiz, love_quiz, memory_match, surprise_wheel
  gameType: 'quiz' | 'memory_match' | 'surprise_wheel' | 'would_you_rather' | 'this_or_that' | 'who_said_it' | 'guess_age' | 'mystery_box';
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  supportedCategories: string[];
  defaultConfig: Record<string, any>;
}

export const GAME_CATALOG: GameDefinition[] = [
  // 1. Birthday Quiz / Trivia
  {
    id: 'birthday_quiz',
    gameType: 'quiz',
    name: 'Birthday Quiz',
    description: 'Fun multiple-choice trivia about the birthday star.',
    icon: Cake,
    color: 'from-pink-500 to-rose-500',
    supportedCategories: ['birthday'],
    defaultConfig: {
      title: 'Birthday Trivia Quiz',
      description: 'Answer these fun questions about the birthday person!',
      questions: [
        {
          question: 'What is my favorite way to celebrate a birthday?',
          options: ['Big party with friends', 'Cozy dinner & cake', 'Surprise trip', 'Relaxing at home'],
          correctIndex: 1
        },
        {
          question: 'What type of cake do I love most?',
          options: ['Chocolate Fudge', 'Red Velvet', 'Vanilla Bean', 'Strawberry Shortcake'],
          correctIndex: 0
        }
      ]
    }
  },
  // 2. Love Quiz / Relationship Trivia
  {
    id: 'love_quiz',
    gameType: 'quiz',
    name: 'Love Quiz',
    description: 'Personalized romance trivia for your favorite person.',
    icon: Heart,
    color: 'from-rose-500 to-purple-600',
    supportedCategories: ['love', 'anniversary'],
    defaultConfig: {
      title: 'Love & Relationship Quiz',
      description: 'Let us see how well you remember our special moments ❤️',
      questions: [
        {
          question: 'Where did we go on our favorite date together?',
          options: ['Romantic dinner by the beach', 'Stargazing in the park', 'Cozy movie marathon', 'Road trip adventure'],
          correctIndex: 0
        },
        {
          question: 'What is my absolute favorite thing about you?',
          options: ['Your warm smile', 'Your kind heart', 'Your sense of humor', 'All of the above!'],
          correctIndex: 3
        }
      ]
    }
  },
  // 3. How Well Do You Know Me?
  {
    id: 'know_me_quiz',
    gameType: 'quiz',
    name: 'How Well Do You Know Me?',
    description: 'Test how deeply your recipient knows your quirks and preferences.',
    icon: QuestionIcon,
    color: 'from-purple-500 to-indigo-600',
    supportedCategories: ['birthday', 'love', 'anniversary', 'friendship', 'graduation', 'celebration', 'just_because'],
    defaultConfig: {
      title: 'How Well Do You Know Me?',
      description: 'Pick the right answer for each personal question!',
      questions: [
        {
          question: 'What is my go-to comfort food?',
          options: ['Pizza', 'Ice Cream', 'Ramen', 'Burgers'],
          correctIndex: 0
        },
        {
          question: 'Am I a morning person or a night owl?',
          options: ['Early Morning Riser', 'Night Owl', 'Depends on coffee', 'Permanently tired'],
          correctIndex: 1
        }
      ]
    }
  },
  // 4. Best Friend Quiz
  {
    id: 'best_friend_quiz',
    gameType: 'quiz',
    name: 'Best Friend Quiz',
    description: 'Inside jokes, funny moments, and best friend trivia.',
    icon: Users,
    color: 'from-fuchsia-500 to-pink-500',
    supportedCategories: ['friendship', 'just_because'],
    defaultConfig: {
      title: 'Best Friend Trivia',
      description: 'Test your bestie knowledge!',
      questions: [
        {
          question: 'What is our funniest inside joke?',
          options: ['The late night snack run', 'That hilarious misunderstanding', 'Our favorite meme', 'The concert adventure'],
          correctIndex: 0
        }
      ]
    }
  },
  // 5. Our Story Quiz
  {
    id: 'our_story_quiz',
    gameType: 'quiz',
    name: 'Our Story Quiz',
    description: 'Celebrate your shared journey with timeline trivia questions.',
    icon: Trophy,
    color: 'from-amber-500 to-orange-600',
    supportedCategories: ['love', 'anniversary'],
    defaultConfig: {
      title: 'Our Story & Journey Quiz',
      description: 'How well do you remember our milestones?',
      questions: [
        {
          question: 'What month did we first start talking?',
          options: ['January', 'June', 'September', 'December'],
          correctIndex: 1
        }
      ]
    }
  },
  // 6. Memory Match
  {
    id: 'memory_match',
    gameType: 'memory_match',
    name: 'Memory Match Game',
    description: 'Interactive tile matching game built automatically from your uploaded gift photos.',
    icon: Sparkles,
    color: 'from-sky-500 to-blue-600',
    supportedCategories: ['birthday', 'love', 'anniversary', 'friendship', 'graduation', 'celebration', 'just_because'],
    defaultConfig: {
      title: 'Photo Memory Match',
      description: 'Flip cards and match pairs of our favorite memories!'
    }
  },
  // 7. Surprise Wheel
  {
    id: 'surprise_wheel',
    gameType: 'surprise_wheel',
    name: 'Surprise Wheel',
    description: 'Customizable spinning wheel filled with wishes, hugs, and fun rewards.',
    icon: RotateCw,
    color: 'from-emerald-500 to-teal-600',
    supportedCategories: ['birthday', 'celebration', 'just_because'],
    defaultConfig: {
      title: 'Spin the Surprise Wheel',
      slices: [
        { label: 'Get a giant warm hug ❤️', color: '#ec4899' },
        { label: 'Pick our next movie 🎬', color: '#8b5cf6' },
        { label: 'Make a birthday wish ✨', color: '#f59e0b' },
        { label: 'Open the secret message 🎁', color: '#10b981' },
        { label: 'Free dessert on me 🍦', color: '#3b82f6' }
      ]
    }
  },
  // 8. Would You Rather
  {
    id: 'would_you_rather',
    gameType: 'would_you_rather',
    name: 'Would You Rather',
    description: 'Fun dilemma choices with surprising reveals.',
    icon: Sliders,
    color: 'from-pink-500 to-purple-600',
    supportedCategories: ['birthday', 'love', 'friendship', 'graduation', 'celebration', 'just_because'],
    defaultConfig: {
      title: 'Would You Rather?',
      pairs: [
        { optionA: 'Travel to Paris for a weekend', optionB: 'Explore Tokyo for a week' },
        { optionA: 'Have endless pizza', optionB: 'Have endless ice cream' }
      ]
    }
  },
  // 9. This or That
  {
    id: 'this_or_that',
    gameType: 'this_or_that',
    name: 'This or That',
    description: 'Rapid choice duel: Coffee vs Tea, Beach vs Mountains.',
    icon: CheckSquare,
    color: 'from-indigo-500 to-blue-600',
    supportedCategories: ['birthday', 'love', 'anniversary', 'friendship', 'celebration', 'just_because'],
    defaultConfig: {
      title: 'This or That Rapid Match',
      rounds: [
        { optionA: 'Coffee ☕', optionB: 'Tea 🍵' },
        { optionA: 'Beach Vacation 🏖️', optionB: 'Mountain Cabin 🏔️' },
        { optionA: 'Night Out 🌃', optionB: 'Cozy Night In 🛋️' }
      ]
    }
  },
  // 10. Who Said It?
  {
    id: 'who_said_it',
    gameType: 'who_said_it',
    name: 'Who Said It?',
    description: 'Guess who originally said famous quotes or funny statements (Me vs You).',
    icon: MessageSquare,
    color: 'from-purple-600 to-pink-600',
    supportedCategories: ['love', 'anniversary', 'friendship'],
    defaultConfig: {
      title: 'Who Said It?',
      quotes: [
        { statement: 'I need coffee right now or nobody survives.', options: ['Me', 'You', 'Both of us'], correctIndex: 0 },
        { statement: 'Let us take just one more photo!', options: ['Me', 'You', 'Both of us'], correctIndex: 1 }
      ]
    }
  },
  // 11. Guess My Age
  {
    id: 'guess_age',
    gameType: 'guess_age',
    name: 'Guess My Age',
    description: 'Interactive age guessing challenge with clues and celebratory feedback.',
    icon: Cake,
    color: 'from-rose-500 to-pink-600',
    supportedCategories: ['birthday'],
    defaultConfig: {
      title: 'Guess My Age Challenge',
      targetAge: 25,
      clue: 'Born in the nineties, forever young at heart!'
    }
  },
  // 12. Mystery Box
  {
    id: 'mystery_box',
    gameType: 'mystery_box',
    name: 'Mystery Box Surprise',
    description: 'Choose Box 1, Box 2, or Box 3 to reveal hidden rewards and messages.',
    icon: BoxIcon,
    color: 'from-amber-500 to-red-500',
    supportedCategories: ['birthday', 'celebration', 'just_because'],
    defaultConfig: {
      title: 'Choose a Mystery Box',
      boxes: [
        { boxNumber: 1, title: 'Mystery Gift #1', rewardMessage: 'You unlocked a free lunch date on me! 🍕' },
        { boxNumber: 2, title: 'Mystery Gift #2', rewardMessage: 'You unlocked an extra big warm hug! ❤️' },
        { boxNumber: 3, title: 'Mystery Gift #3', rewardMessage: 'You unlocked full control of the TV remote for a week! 📺' }
      ]
    }
  }
];

export function getRecommendedGamesForOccasion(occasion: string = 'general'): GameDefinition[] {
  const occLower = (occasion || '').toLowerCase();
  return GAME_CATALOG.filter((g) =>
    g.supportedCategories.some((cat) => occLower.includes(cat) || cat === 'just_because')
  );
}

export function getGameDefinition(id: string): GameDefinition | undefined {
  return GAME_CATALOG.find((g) => g.id === id);
}
