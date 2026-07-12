import React from 'react';

/**
 * StayCardSkeleton — animated ghost placeholder displayed while
 * the vendor listings are being fetched from the API.
 */
const StayCardSkeleton = () => (
  <div className="flex flex-col justify-between overflow-hidden bg-white border-2 border-[#212121] shadow-[5px_5px_0px_#212121] relative animate-pulse h-[400px]">
    {/* Map placeholder */}
    <div className="w-full h-36 bg-[#212121]/10 border-b-2 border-[#212121]" />
    {/* Content */}
    <div className="p-5 flex-grow space-y-3">
      <div className="h-4 bg-[#212121]/10 w-2/3 border border-[#212121]/5" />
      <div className="h-3 bg-[#212121]/10 w-full border border-[#212121]/5" />
      <div className="h-3 bg-[#212121]/10 w-5/6 border border-[#212121]/5" />
      <div className="flex gap-2 pt-2">
        <div className="h-5 bg-[#212121]/10 w-16 border border-[#212121]/5" />
        <div className="h-5 bg-[#212121]/10 w-20 border border-[#212121]/5" />
      </div>
    </div>
    {/* Actions bar placeholder */}
    <div className="border-t-2 border-[#212121] bg-[#F1EDEA] p-3 flex justify-between items-center gap-2">
      <div className="h-7 bg-[#212121]/10 w-24 border border-[#212121]/5" />
      <div className="flex gap-2">
        <div className="h-7 bg-[#212121]/10 w-7 border border-[#212121]/5" />
        <div className="h-7 bg-[#212121]/10 w-7 border border-[#212121]/5" />
        <div className="h-7 bg-[#212121]/10 w-7 border border-[#212121]/5" />
      </div>
    </div>
  </div>
);

export default StayCardSkeleton;
