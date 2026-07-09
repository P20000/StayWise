import React from 'react';
import { ScrollProgressIndicator } from '../components/landing/ScrollProgressIndicator';
import { CinematicHero } from '../components/landing/CinematicHero';
import { SmartStayRecommender } from '../components/landing/SmartStayRecommender';
import { FeaturedHotels } from '../components/landing/FeaturedHotels';

export const LandingPage = () => {
  return (
    <main className="w-full min-h-screen bg-[#F1EDEA] overflow-x-hidden">
      {/* Top scroll tracking progress indicator */}
      <ScrollProgressIndicator />

      {/* 300vh Pinned Cinematic Video Hero Container */}
      <CinematicHero />

      {/* SmartStay AI Recommender Engine Section */}
      <SmartStayRecommender />

      {/* Featured Architectural Suites Section */}
      <FeaturedHotels />
    </main>
  );
};

export default LandingPage;
