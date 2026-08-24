import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { OccasionsSection } from '../components/OccasionsSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { ExperiencePreviewSection } from '../components/ExperiencePreviewSection';
import { CtaSection } from '../components/CtaSection';

export const Home: React.FC = () => {
  return (
    <div className="relative overflow-x-hidden">
      <HeroSection />
      <OccasionsSection />
      <HowItWorksSection />
      <ExperiencePreviewSection />
      <CtaSection />
    </div>
  );
};
