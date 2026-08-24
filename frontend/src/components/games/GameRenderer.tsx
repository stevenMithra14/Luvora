import React from 'react';
import { QuizEnginePlayable } from './QuizEnginePlayable';
import { MemoryMatchPlayable } from './MemoryMatchPlayable';
import { SurpriseWheelPlayable } from './SurpriseWheelPlayable';
import { WouldYouRatherPlayable } from './WouldYouRatherPlayable';
import { ThisOrThatPlayable } from './ThisOrThatPlayable';
import { WhoSaidItPlayable } from './WhoSaidItPlayable';
import { GuessAgePlayable } from './GuessAgePlayable';
import { MysteryBoxPlayable } from './MysteryBoxPlayable';
import { BirthdayCountdown } from '../interactive/BirthdayCountdown';
import { MemoryTimeline } from '../interactive/MemoryTimeline';
import { SecretMessage } from '../interactive/SecretMessage';
import { SurpriseButton } from '../interactive/SurpriseButton';
import { PhotoSlideshow } from '../interactive/PhotoSlideshow';
import { FinalMessage } from '../interactive/FinalMessage';

interface GameRendererProps {
  interactiveType: string;
  configJson: Record<string, any>;
  photos?: any[];
  recipientName?: string;
  recipientDate?: string;
}

export const GameRenderer: React.FC<GameRendererProps> = ({
  interactiveType,
  configJson = {},
  photos = [],
  recipientName = 'Recipient',
  recipientDate,
}) => {
  switch (interactiveType) {
    // 1. Reusable Quiz Engines
    case 'quiz':
    case 'birthday_quiz':
    case 'love_quiz':
    case 'know_me_quiz':
    case 'best_friend_quiz':
    case 'our_story_quiz':
      return <QuizEnginePlayable config={configJson} />;

    // 2. Memory Match
    case 'memory_match':
      return <MemoryMatchPlayable photos={photos} config={configJson} />;

    // 3. Surprise Wheel
    case 'surprise_wheel':
      return <SurpriseWheelPlayable config={configJson} />;

    // 4. Would You Rather
    case 'would_you_rather':
      return <WouldYouRatherPlayable config={configJson} />;

    // 5. This or That
    case 'this_or_that':
      return <ThisOrThatPlayable config={configJson} />;

    // 6. Who Said It?
    case 'who_said_it':
      return <WhoSaidItPlayable config={configJson} />;

    // 7. Guess My Age
    case 'guess_age':
      return <GuessAgePlayable config={configJson} />;

    // 8. Mystery Box
    case 'mystery_box':
      return <MysteryBoxPlayable config={configJson} />;

    // Traditional Interactive Modules
    case 'countdown':
      return <BirthdayCountdown targetDateStr={recipientDate} recipientName={recipientName} />;

    case 'timeline':
      return <MemoryTimeline entries={configJson.entries || []} />;

    case 'secret_message':
      return <SecretMessage messageText={configJson.message} />;

    case 'surprise_button':
      return <SurpriseButton buttonText={configJson.buttonText} surpriseMessage={configJson.message} />;

    case 'slideshow':
      return <PhotoSlideshow photos={photos} />;

    case 'final_message':
      return <FinalMessage finalText={configJson.message} senderName={`Made with love for ${recipientName} ❤️`} />;

    default:
      return null;
  }
};
