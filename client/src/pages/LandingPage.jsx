import React from 'react';
import { CinematicHero } from '../components/landing/CinematicHero';
import { ValueProps } from '../components/landing/ValueProps';
import { FeaturedHotels } from '../components/landing/FeaturedHotels';

export const LandingPage = () => {
  return (
    <main className="w-full min-h-screen overflow-x-hidden">
      {/* Looping Cinematic Video Hero */}
      <CinematicHero />

      {/* Guest and Host Value Showcase */}
      <ValueProps />

      {/* Featured Spaces Showcase */}
      <FeaturedHotels />
    </main>
  );
};

export default LandingPage;
