import React from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { X } from 'lucide-react';
import CalendarRangePicker from '../../components/vendor/CalendarRangePicker';

/**
 * VendorAvailabilityModal — overlay modal for managing per-tier availability
 * date windows on a room listing.
 *
 * Props:
 *   room              {object}  The currently-selected room (selectedRoomForAvailability)
 *   selectedTierId    {string}
 *   availabilityDates {{ start, end }}
 *   isSaving          {boolean}
 *   onTierChange      {fn}  (e) → void
 *   onDatesChange     {fn}  (range) → void
 *   onClearDates      {fn}  () → void
 *   onSave            {fn}  () → void
 *   onClose           {fn}  () → void
 */
const VendorAvailabilityModal = ({
  room,
  selectedTierId,
  availabilityDates,
  isSaving,
  onTierChange,
  onDatesChange,
  onClearDates,
  onSave,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[1050] bg-[#212121]/80 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-lg bg-[#F1EDEA] border-3 border-[#212121] shadow-[8px_8px_0px_#212121] max-h-[90vh] flex flex-col p-0 font-mono text-xs">

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#212121] p-4 bg-[#212121] text-white">
          <h3 className="font-bold uppercase tracking-wider">[ MANAGE TIER AVAILABILITY ]</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-[#C84B31] transition-colors bg-transparent border-0 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto p-5 space-y-4">
          <div className="space-y-1">
            <label className="font-bold block text-xs text-[#212121]/60 uppercase">[ Stay Name ]</label>
            <div className="font-bold text-sm text-[#212121] uppercase tracking-wide border-b border-[#212121]/20 pb-2">
              {room.title}
            </div>
          </div>

          {!room.roomTiers || room.roomTiers.length === 0 ? (
            <div className="border-2 border-dashed border-[#212121]/30 p-8 text-center bg-white space-y-2">
              <div className="font-bold text-[#C84B31] uppercase">[ No Tiers Configured ]</div>
              <p className="text-[10px] text-[#212121]/60">
                This stay doesn't have any room tiers configured yet. Edit the stay details to configure tiers.
              </p>
            </div>
          ) : (
            <>
              {/* Tier selector */}
              <div className="space-y-1">
                <label className="font-bold block text-xs text-[#212121] uppercase">SELECT ROOM TIER</label>
                <select
                  value={selectedTierId}
                  onChange={onTierChange}
                  className="w-full bg-white border-2 border-[#212121] p-2.5 outline-none font-mono text-xs uppercase cursor-pointer"
                >
                  {room.roomTiers.map((t) => (
                    <option key={t._id || t.id} value={t._id || t.id}>
                      {t.tierName} (${t.basePrice}/night - {t.numberOfRooms || 1} Rooms)
                    </option>
                  ))}
                </select>
              </div>

              {/* Calendar */}
              <div className="space-y-2">
                <label className="font-bold block text-xs text-[#212121] uppercase">Availability Date Range</label>
                <CalendarRangePicker value={availabilityDates} onChange={onDatesChange} />
              </div>

              {/* Date summary */}
              <div className="border border-[#212121] bg-white p-3 space-y-1.5 font-bold uppercase text-[10px] text-[#212121]">
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="text-[#C84B31]">
                    {availabilityDates.start
                      ? new Date(availabilityDates.start).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })
                      : 'NOT SET'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#212121]/15 pt-1.5">
                  <span>End Date:</span>
                  <span className="text-[#C84B31]">
                    {availabilityDates.end
                      ? new Date(availabilityDates.end).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })
                      : 'NOT SET'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={onClearDates}
                  className="flex-1 bg-white font-bold"
                >
                  CLEAR DATES
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={onSave}
                  disabled={isSaving}
                  className="flex-1 font-bold bg-[#C84B31] text-white border-2 border-[#212121] shadow-[2px_2px_0px_#212121]"
                >
                  {isSaving ? 'SAVING...' : 'SAVE AVAILABILITY'}
                </Button>
              </div>
            </>
          )}
        </div>

      </Card>
    </div>
  );
};

export default VendorAvailabilityModal;
