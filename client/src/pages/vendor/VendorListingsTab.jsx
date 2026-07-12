import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { MapPin, Play, Pause, Calendar, Edit3, Trash2 } from 'lucide-react';
import MiniMap from '../../components/vendor/MiniMap';
import StayCardSkeleton from '../../components/vendor/StayCardSkeleton';

/**
 * VendorListingsTab — grid of published room listing cards with CRUD actions.
 *
 * Props:
 *   rooms                  {array}
 *   loading                {boolean}
 *   userId                 {string}  For localStorage skeleton count key
 *   onEdit                 {fn}  (room) → void
 *   onToggleStatus         {fn}  (room) → void
 *   onDelete               {fn}  (room) → void
 *   onOpenAvailability     {fn}  (room) → void
 */
const VendorListingsTab = ({
  rooms,
  loading,
  userId,
  onEdit,
  onToggleStatus,
  onDelete,
  onOpenAvailability,
}) => {
  const skeletonCount =
    rooms.length > 0
      ? rooms.length
      : parseInt(localStorage.getItem(`stay_count_${userId}`)) || 3;

  return (
    <div className="space-y-4">
      <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#212121]">
        [ YOUR PUBLISHED MODERNIST STAYS ]
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.from({ length: skeletonCount }).map((_, idx) => (
            <StayCardSkeleton key={idx} />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="border-2 border-dashed border-[#212121]/30 p-12 text-center bg-white space-y-2">
          <div className="font-mono text-sm font-bold text-[#212121]">[ PORTFOLIO IS EMPTY ]</div>
          <p className="font-sans text-xs text-[#212121]/60 max-w-sm mx-auto">
            You haven't listed any concrete lofts yet. Start setting up your geolocation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rooms.map((room) => (
            <Card
              key={room._id}
              className="p-0 flex flex-col justify-between overflow-hidden bg-white border-2 border-[#212121] shadow-[5px_5px_0px_#212121] relative"
            >
              {/* Status & Style Badges */}
              <div className="absolute top-3 right-3 z-[1001] flex gap-2">
                <Badge variant={room.status === 'active' ? 'success' : 'default'}>
                  {room.status?.toUpperCase() || 'ACTIVE'}
                </Badge>
                <Badge variant="terracotta">{room.architecturalStyle}</Badge>
              </div>

              <div>
                {/* Map preview or fallback */}
                {room.locationCoordinates?.coordinates ? (
                  <MiniMap
                    lat={room.locationCoordinates.coordinates[1]}
                    lng={room.locationCoordinates.coordinates[0]}
                  />
                ) : (
                  <div className="w-full h-36 bg-stone-200 border-b-2 border-[#212121] flex items-center justify-center font-mono text-[10px] text-stone-500 uppercase font-bold">
                    [ No location map set ]
                  </div>
                )}

                <div className="p-5 space-y-2 font-mono">
                  <div className="flex items-center gap-1 text-xs text-[#C84B31] font-bold">
                    <MapPin size={12} />
                    <span className="truncate max-w-[90%]">{room.location}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#212121] uppercase tracking-wide truncate">
                    {room.title}
                  </h3>
                  <p className="font-sans text-xs text-[#212121]/70 line-clamp-2">
                    {room.description}
                  </p>

                  <div className="pt-2 flex items-center gap-4 text-[10px] text-[#212121]/60 font-bold uppercase">
                    <span>[ Tiers: {room.roomTiers?.length || 0} ]</span>
                    {!room.reviewsCount || room.reviewsCount === 0 ? (
                      <span className="flex items-center gap-1 text-[#C84B31] border border-[#C84B31] bg-[#C84B31]/5 px-1.5 py-0.5 text-[9px] animate-pulse">
                        ✦ NEWLY LISTED
                      </span>
                    ) : (
                      <span>[ Feedback: {room.rating} ★ ]</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions footer */}
              <div className="px-5 py-4 border-t border-[#212121] flex items-center justify-between bg-[#F1EDEA]/30">
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#212121]/50 block">
                    FROM BASE PRICE
                  </span>
                  <span className="text-lg font-bold text-[#212121]">${room.basePrice}</span>
                  <span className="text-[10px] text-[#212121]/60 uppercase"> / night</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleStatus(room)}
                    title={room.status === 'paused' ? 'Activate Listing' : 'Pause Listing'}
                  >
                    {room.status === 'paused' ? (
                      <Play size={12} className="text-emerald-800" />
                    ) : (
                      <Pause size={12} className="text-amber-800" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenAvailability(room)}
                    title="Manage Tier Availability"
                  >
                    <Calendar size={12} />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(room)}
                    title="Edit Listing Details"
                  >
                    <Edit3 size={12} />
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onDelete(room)}
                    title="Dismantle Listing"
                    className="bg-[#C84B31] border border-[#212121]"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorListingsTab;
