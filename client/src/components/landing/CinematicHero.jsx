import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const CinematicHero = () => {
  const containerRef = useRef(null);
  const [isMobileOrReducedMotion, setIsMobileOrReducedMotion] = useState(false);

  useEffect(() => {
    const checkFallback = () => {
      const reducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const mobile = typeof window !== 'undefined' && window.innerWidth < 768;
      setIsMobileOrReducedMotion(reducedMotion || mobile);
    };
    checkFallback();
    window.addEventListener('resize', checkFallback);
    return () => window.removeEventListener('resize', checkFallback);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered entrance — elements float up one after another on load
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('.hero-badge',
        { opacity: 0, y: -24 },
        { opacity: 1, y: 0, duration: 0.7 }, 0.4
      )
      .fromTo('.hero-title',
        { opacity: 0, y: 48 },
        { opacity: 1, y: 0, duration: 1.0 }, 0.75
      )
      .fromTo('.hero-sub',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8 }, 1.1
      )
      .fromTo('.hero-caption',
        { opacity: 0, x: -24 },
        { opacity: 1, x: 0, duration: 0.6 }, 1.4
      )
      .fromTo('.hero-scroll-hint',
        { opacity: 0 },
        { opacity: 1, duration: 0.6 }, 1.7
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-[#0a0a0a] select-none overflow-hidden"
      aria-label="Cinematic architectural hotel tour"
    >
      {/* ── Background: looping video / poster fallback ─────────────────── */}
      {isMobileOrReducedMotion ? (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('/assets/cinematic/final-frame-poster.webp')` }}
          role="img"
          aria-label="StayWise architectural suite view"
        />
      ) : (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/assets/cinematic/final-frame-poster.webp"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        >
          <source src="/assets/cinematic/staywise-architectural-tour.mp4" type="video/mp4" />
        </video>
      )}

      {/* ── Gradient overlay ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/65 via-[#0a0a0a]/20 to-[#0a0a0a]/80 pointer-events-none z-10" />

      {/* ── Centre content ───────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center">

        {/* Badge */}
        <div className="hero-badge opacity-0 mb-6 inline-flex items-center gap-2 border border-white/25 bg-white/10 px-4 py-2">
          <Sparkles size={12} className="text-[#C84B31]" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-white/90 font-bold">
            Curated Design Sanctuary Showcase
          </span>
        </div>

        {/* Headline */}
        <h1 className="hero-title opacity-0 font-mono text-5xl sm:text-7xl font-bold uppercase tracking-tight text-white leading-none mb-5">
          DESIGNED<br />
          <span className="text-[#C84B31]">TO BE LIVED IN</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-sub opacity-0 font-sans text-base sm:text-lg text-white/65 max-w-lg mb-10 leading-relaxed">
          A curated showcase of brutalist concrete sanctuaries, minimalist escapes, 
          and bespoke architectural stays. Find inspiration in form and structure.
        </p>
      </div>

      {/* ── Bottom-left caption tag ───────────────────────────────────────── */}
      <div className="hero-caption opacity-0 absolute bottom-10 left-8 z-20">
        <div className="border border-white/25 bg-white/10 px-4 py-2">
          <span className="font-mono text-xs uppercase tracking-wider text-white/75 font-bold">
            [ CURATED BY DESIGN ]
          </span>
        </div>
      </div>

      {/* ── Scroll hint ──────────────────────────────────────────────────── */}
      <div className="hero-scroll-hint opacity-0 absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 animate-bounce">
        <ChevronDown size={20} className="text-white/50" />
      </div>
    </section>
  );
};

export default CinematicHero;
