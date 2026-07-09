import React from 'react';
import { useGSAPScrollProgress } from '../../hooks/useGSAPScrollProgress';

export const ScrollProgressIndicator = ({ isStatic = false }) => {
  const progress = useGSAPScrollProgress();

  // If static fallback is active, hide indicator or show at 100% completion
  if (isStatic) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-[#212121]/10 z-50 pointer-events-none"
      role="progressbar"
      aria-label="Cinematic tour scroll progress"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-[#C84B31] transition-transform duration-75 ease-out rounded-none origin-left"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
};

export default ScrollProgressIndicator;
