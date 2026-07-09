import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useGSAPScrollProgress = (triggerSelector = '[data-scroll-pin="cinematic-hero"]') => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Accessibility: show final state instantly for reduced-motion users
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setProgress(1.0);
      return;
    }

    const triggerElem =
      typeof triggerSelector === 'string'
        ? document.querySelector(triggerSelector)
        : triggerSelector;

    if (!triggerElem) return;

    // Must match the same start/end as useScrollVideoScrub to stay in sync
    const st = ScrollTrigger.create({
      trigger: triggerElem,
      start: 'top top',
      end: '+=80vh',
      onUpdate: (self) => {
        const rounded = Math.round(self.progress * 1000) / 1000;
        setProgress(rounded);
      },
    });

    return () => {
      st.kill();
    };
  }, [triggerSelector]);

  return progress;
};

export default useGSAPScrollProgress;
