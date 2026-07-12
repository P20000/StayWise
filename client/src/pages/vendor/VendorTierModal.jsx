import React from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { X } from 'lucide-react';

/**
 * VendorTierModal — full-screen overlay modal for editing a single room-tier's
 * details: name, nightly rate, cover image URL, number of rooms, and all 11
 * add-on services (enabled/disabled, price, price-type, description).
 *
 * Props:
 *   tier          {object}   The tier currently being edited (selectedTierForEdit)
 *   onChange      {fn}       (updatedTier) → void — called on any field change
 *   onSave        {fn}       () → void
 *   onRemove      {fn}       (tierId) → void
 *   onClose       {fn}       () → void
 */
const VendorTierModal = ({ tier, onChange, onSave, onRemove, onClose }) => {
  const updateField = (field, value) => onChange({ ...tier, [field]: value });

  const updateService = (sIdx, partial) => {
    const svcs = [...tier.services];
    svcs[sIdx] = { ...svcs[sIdx], ...partial };
    onChange({ ...tier, services: svcs });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#212121]/80 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-xl bg-[#F1EDEA] border-3 border-[#212121] shadow-[8px_8px_0px_#212121] max-h-[85vh] flex flex-col p-0 font-mono text-xs">

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#212121] p-4 bg-[#212121] text-white">
          <h3 className="font-bold uppercase tracking-wider">[ EDIT TIER CONFIGURATION ]</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-[#C84B31] transition-colors bg-transparent border-0 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold block">TIER TITLE NAME</label>
              <input
                type="text"
                value={tier.tierName}
                onChange={(e) => updateField('tierName', e.target.value)}
                className="w-full bg-white border-2 border-[#212121] p-2 outline-none font-sans text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">BASE NIGHTLY RATE ($)</label>
              <input
                type="number"
                value={tier.basePrice}
                onChange={(e) => updateField('basePrice', Number(e.target.value))}
                className="w-full bg-white border-2 border-[#212121] p-2 outline-none font-sans text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">COVER IMAGE URL</label>
            <input
              type="text"
              value={tier.coverImage}
              onChange={(e) => updateField('coverImage', e.target.value)}
              className="w-full bg-white border-2 border-[#212121] p-2 outline-none font-sans text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold block">NUMBER OF ROOMS</label>
            <input
              type="number"
              min="1"
              required
              value={tier.numberOfRooms || 1}
              onChange={(e) => updateField('numberOfRooms', Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-white border-2 border-[#212121] p-2 outline-none font-sans text-xs"
            />
          </div>

          {/* Service Configurator */}
          <div className="space-y-3 pt-2">
            <label className="font-bold border-b border-[#212121] pb-1 uppercase tracking-wider block text-[#C84B31]">
              [ SERVICE CONFIGURATOR ]
            </label>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {tier.services.map((svc, sIdx) => (
                <div key={svc.name} className="border border-[#212121] p-3 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase text-[10px] text-[#212121]">{svc.name}</span>
                    <input
                      type="checkbox"
                      checked={svc.enabled}
                      onChange={(e) => updateService(sIdx, { enabled: e.target.checked })}
                      className="accent-[#C84B31] w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {svc.enabled && (
                    <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-stone-200">
                      <div>
                        <span className="text-[8px] text-[#212121]/60 block font-bold">PRICE ($)</span>
                        <input
                          type="number"
                          value={svc.price}
                          onChange={(e) => updateService(sIdx, { price: Number(e.target.value) })}
                          className="w-full bg-[#F1EDEA]/50 border border-[#212121] p-1 font-sans text-[10px] outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[8px] text-[#212121]/60 block font-bold">PRICE TYPE</span>
                        <select
                          value={svc.priceType}
                          onChange={(e) => updateService(sIdx, { priceType: e.target.value })}
                          className="w-full bg-[#F1EDEA]/50 border border-[#212121] p-1 text-[10px] outline-none"
                        >
                          <option value="per-night">Per Night</option>
                          <option value="one-time">One-time</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[8px] text-[#212121]/60 block font-bold">NARRATIVE DETAILS</span>
                        <input
                          type="text"
                          value={svc.description}
                          onChange={(e) => updateService(sIdx, { description: e.target.value })}
                          placeholder="e.g. Daily drop at 08:00"
                          className="w-full bg-[#F1EDEA]/50 border border-[#212121] p-1 font-sans text-[10px] outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-[#212121] p-4 flex justify-between bg-[#F1EDEA]">
          <button
            type="button"
            onClick={() => onRemove(tier.id)}
            className="bg-[#C84B31] text-white hover:bg-[#b53a20] font-bold px-3 py-1.5 border-2 border-[#212121] shadow-[2px_2px_0px_#212121] cursor-pointer"
          >
            REMOVE TIER
          </button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              CANCEL
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onSave}
              className="shadow-[2px_2px_0px_#212121]"
            >
              APPLY CHANGES
            </Button>
          </div>
        </div>

      </Card>
    </div>
  );
};

export default VendorTierModal;
