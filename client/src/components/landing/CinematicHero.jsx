import React, { useRef, useEffect, useState } from 'react';
import { useScrollVideoScrub } from '../../hooks/useScrollVideoScrub';
import { SearchBar } from '../search/SearchBar';
import { CaptionOverlay } from './CaptionOverlay';
import { AIMatchBadge } from './AIMatchBadge';

export const CinematicHero = () => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isMobileOrReducedMotion, setIsMobileOrReducedMotion] = useState(false);

  // Initialize scroll scrubbing engine
  useScrollVideoScrub(videoRef, containerRef);

  useEffect(() => {
    // Check device tier and motion accessibility
    const checkFallback = () => {
      const reducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const mobileWidth =
        typeof window !== 'undefined' && window.innerWidth < 768;
      setIsMobileOrReducedMotion(reducedMotion || mobileWidth);
    };

    checkFallback();
    window.addEventListener('resize', checkFallback);
    return () => window.removeEventListener('resize', checkFallback);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-[#F1EDEA] overflow-hidden select-none border-b-3 border-[#212121]"
      aria-label="Cinematic architectural hotel tour"
      data-scroll-pin="cinematic-hero"
    >
      {/* 1. Video Canvas / Static Fallback */}
      {isMobileOrReducedMotion ? (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-[#212121]"
          style={{
            backgroundImage: `url('/assets/cinematic/final-frame-poster.webp')`,
          }}
          role="img"
          aria-label="StayWise architectural suite view"
        />
      ) : (
        <video
          ref={videoRef}
          src="/assets/cinematic/staywise-architectural-tour.mp4"
          poster="/assets/cinematic/final-frame-poster.webp"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}

      {/* 2. Hard Structural Vignette (Strictly NO backdrop-blur) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#212121]/40 via-transparent to-[#212121]/60 pointer-events-none z-10" />

      {/* 3. Synced JetBrains Mono Captions (Bottom-Left Compartment) */}
      <CaptionOverlay isStatic={isMobileOrReducedMotion} />

      {/* 4. AI Match Recommender Badge (Fades in at 65% scroll or instantly on fallback) */}
      <AIMatchBadge isStatic={isMobileOrReducedMotion} />

      {/* 5. Materialized SearchBar (Reveals at 85% scroll or instantly on fallback) */}
      <div
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-30 transition-opacity duration-300 ${
          isMobileOrReducedMotion ? 'opacity-100' : 'opacity-0 data-[revealed=true]:opacity-100'
        }`}
        data-scroll-reveal="85%"
      >
        <SearchBar />
      </div>
    </section>
  );
};

export default CinematicHero;
