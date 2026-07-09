import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useGSAPScrollProgress = (triggerSelector = '[data-scroll-pin="cinematic-hero"]') => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Accessibility Check: Exit early if reduced motion is preferred
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setProgress(1.0); // Show final state instantly for reduced-motion users
      return;
    }

    // 2. Locate active ScrollTrigger instance or attach standalone listener
    const triggerElem = typeof triggerSelector === 'string'
      ? document.querySelector(triggerSelector)
      : triggerSelector;

    if (!triggerElem) return;

    // Create an auxiliary ScrollTrigger hooked to the exact same pinned container
    const st = ScrollTrigger.create({
      trigger: triggerElem,
      start: 'top top',
      end: '+=200%',
      onUpdate: (self) => {
        // Round to 3 decimal places to avoid excessive micro-renders
        const roundedProgress = Math.round(self.progress * 1000) / 1000;
        setProgress(roundedProgress);
      },
    });

    return () => {
      st.kill();
    };
  }, [triggerSelector]);

  return progress;
};

export default useGSAPScrollProgress;
