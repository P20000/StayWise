import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useScrollVideoScrub = (videoRef, containerRef) => {
  useEffect(() => {
    // Accessibility: skip animation for reduced-motion users
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const setup = () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            // ~10 scroll ticks to complete (80vh ≈ 10 × ~80px wheel steps)
            end: '+=80vh',
            pin: true,
            // Tight scrub for frame-accurate, smooth video response
            scrub: 0.15,
            anticipatePin: 1,
          },
        });

        tl.to(video, {
          currentTime: video.duration || 15,
          ease: 'none',
        });
      }, container);

      return () => ctx.revert();
    };

    if (video.readyState >= 1) {
      return setup();
    }

    const handleMetadata = () => setup();
    video.addEventListener('loadedmetadata', handleMetadata, { once: true });
    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
    };
  }, [videoRef, containerRef]);
};

export default useScrollVideoScrub;
