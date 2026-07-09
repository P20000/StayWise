import React from 'react';
import { useGSAPScrollProgress } from '../../hooks/useGSAPScrollProgress';

const CAPTIONS = [
  { at: 0.00, text: '[ ARRIVAL ]' },
  { at: 0.15, text: '[ MATERIAL HONESTY ]' },
  { at: 0.40, text: '[ SPACES FOR PRESENCE ]' },
  { at: 0.65, text: '[ CURATED BY INTELLIGENCE ]' },
];

export const CaptionOverlay = ({ isStatic = false }) => {
  const progress = useGSAPScrollProgress();

  // If in static fallback mode, show the final target caption immediately
  if (isStatic) {
    return (
      <div className="absolute bottom-32 left-8 z-20 pointer-events-none">
        <div className="bg-white border-2 border-[#212121] shadow-[4px_4px_0px_#212121] px-4 py-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[#212121] font-bold">
            [ CURATED BY INTELLIGENCE ]
          </span>
        </div>
      </div>
    );
  }

  // Find the highest threshold currently passed by scroll progress
  const activeCaption = [...CAPTIONS]
    .reverse()
    .find((item) => progress >= item.at);

  return (
    <div className="absolute bottom-32 left-8 z-20 pointer-events-none transition-all duration-150">
      <div className="bg-white border-2 border-[#212121] shadow-[4px_4px_0px_#212121] px-4 py-2">
        <span className="font-mono text-xs uppercase tracking-wider text-[#212121] font-bold">
          {activeCaption ? activeCaption.text : '[ SCROLL TO EXPLORE ↓ ]'}
        </span>
      </div>
    </div>
  );
};

export default CaptionOverlay;
