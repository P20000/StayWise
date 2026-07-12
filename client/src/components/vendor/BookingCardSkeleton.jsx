import React from 'react';

/**
 * BookingCardSkeleton — animated ghost placeholder displayed while
 * the vendor's incoming bookings are being fetched from the API.
 */
const BookingCardSkeleton = () => (
  <div className="p-4 bg-white border-2 border-[#212121] shadow-[4px_4px_0px_#212121] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-pulse">
    <div className="space-y-2 flex-grow">
      <div className="h-4 bg-[#212121]/10 w-24 border border-[#212121]/5" />
      <div className="h-5 bg-[#212121]/10 w-48 border border-[#212121]/5" />
      <div className="h-3 bg-[#212121]/10 w-32 border border-[#212121]/5" />
    </div>
    <div className="flex flex-col items-end gap-2 w-full md:w-auto">
      <div className="h-6 bg-[#212121]/10 w-16 border border-[#212121]/5" />
      <div className="h-4 bg-[#212121]/10 w-20 border border-[#212121]/5" />
    </div>
  </div>
);

export default BookingCardSkeleton;
