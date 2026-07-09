import React from 'react';
import { useGSAPScrollProgress } from '../../hooks/useGSAPScrollProgress';

export const AIMatchBadge = ({ isStatic = false, matchScore = 94 }) => {
  const progress = useGSAPScrollProgress();

  // Reveal badge once scroll crosses the 65% threshold (or immediately on static fallback)
  const isVisible = isStatic || progress >= 0.65;

  return (
    <div
      className={`absolute top-24 left-8 z-20 pointer-events-none transition-all duration-300 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      aria-hidden={!isVisible}
    >
      <div className="bg-[#F1EDEA] text-[#212121] border-2 border-[#212121] shadow-[2px_2px_0px_#212121] px-3 py-1.5 flex items-center gap-2">
        <span className="text-sm" role="img" aria-label="Sparkles">✨</span>
        <span className="font-mono text-xs font-bold uppercase tracking-wide">
          [{matchScore}% AI MATCH — CURATED FOR YOU]
        </span>
      </div>
    </div>
  );
};

export default AIMatchBadge;
