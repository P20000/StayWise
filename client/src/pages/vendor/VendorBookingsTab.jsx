import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { User, Calendar } from 'lucide-react';
import BookingCardSkeleton from '../../components/vendor/BookingCardSkeleton';

/**
 * VendorBookingsTab — renders the incoming guest bookings list for the vendor.
 *
 * Props:
 *   bookings  {array}   List of booking objects (populated with room + guest)
 *   loading   {boolean}
 *   userId    {string}  Used for localStorage skeleton count key
 */
const VendorBookingsTab = ({ bookings, loading, userId }) => {
  const skeletonCount =
    bookings.length > 0
      ? bookings.length
      : parseInt(localStorage.getItem(`booking_count_${userId}`)) || 2;

  return (
    <div className="space-y-4">
      <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#212121]">
        [ INCOMING GUEST BOOKINGS ]
      </h2>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: skeletonCount }).map((_, idx) => (
            <BookingCardSkeleton key={idx} />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="border-2 border-dashed border-[#212121]/30 p-12 text-center bg-white space-y-2">
          <div className="font-mono text-sm font-bold text-[#212121]">
            [ NO ACTIVE INCOMING RESERVATIONS ]
          </div>
          <p className="font-sans text-xs text-[#212121]/60 max-w-sm mx-auto">
            Guest booking logs will populate here once active travelers finalize reservations at
            your modernist stays.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card
              key={booking._id}
              className="p-4 bg-white border-2 border-[#212121] shadow-[4px_4px_0px_#212121] flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-1">
                <span className="font-mono text-[9px] uppercase font-bold text-[#C84B31] border border-[#C84B31] px-1 bg-[#C84B31]/5">
                  ORDER: {booking._id.substring(12).toUpperCase()}
                </span>
                <h4 className="font-mono text-sm font-bold text-[#212121]">
                  {booking.room?.title}
                </h4>
                <div className="flex items-center gap-3 text-[10px] text-[#212121]/70 font-semibold font-sans">
                  <span className="flex items-center gap-1">
                    <User size={10} /> {booking.guest?.name} ({booking.guest?.email})
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={10} />{' '}
                    {new Date(booking.checkInDate).toLocaleDateString()} -{' '}
                    {new Date(booking.checkOutDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0">
                <div>
                  <span className="font-mono text-xs text-[#212121]/60 block">[ REVENUE ]</span>
                  <span className="font-mono text-lg font-bold">${booking.totalAmount} USD</span>
                </div>
                <Badge variant={booking.status === 'CONFIRMED' ? 'success' : 'default'}>
                  {booking.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorBookingsTab;
