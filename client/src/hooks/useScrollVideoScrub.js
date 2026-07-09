import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useScrollVideoScrub = (videoRef, containerRef) => {
  useEffect(() => {
    // 1. Accessibility Check: Exit early if reduced motion is preferred
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // 2. Setup Function: Binds GSAP context and timeline
    const setup = () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: '+=200%',          // 300vh total pin distance (100vh + 200vh scroll)
            pin: true,
            scrub: 0.5,             // 0.5s smoothing for cinematic feel
            anticipatePin: 1,
          },
        });

        tl.to(video, {
          currentTime: video.duration || 15,
          ease: 'none',
        });
      }, container);

      // Return cleanup handler to revert all GSAP DOM mutations and scroll listeners
      return () => ctx.revert();
    };

    // 3. Execution based on Video Metadata Readiness
    if (video.readyState >= 1) {
      return setup();
    }

    const handleMetadata = () => {
      setup();
    };

    video.addEventListener('loadedmetadata', handleMetadata, { once: true });
    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
    };
  }, [videoRef, containerRef]);
};

export default useScrollVideoScrub;
