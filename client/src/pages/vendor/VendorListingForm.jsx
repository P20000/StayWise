import React, { useEffect, useRef } from 'react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Plus, Search, Upload, ArrowRight, X } from 'lucide-react';
import { gsap } from 'gsap';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Brutalist draggable marker
const brutalIcon = L.divIcon({
  className: 'brutal-marker',
  html: `<div style="width:16px;height:16px;background:#C84B31;border:2px solid #212121;box-shadow:2px 2px 0px #212121;transform:rotate(45deg);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const DEFAULT_SERVICES = [
  { name: 'Room cleaning', enabled: true, price: 20, priceType: 'per-night', description: 'Daily surface sanitization and linen swap.' },
  { name: 'Laundry', enabled: false, price: 15, priceType: 'one-time', description: 'Up to 5kg wash and press.' },
  { name: 'Meal plans (Breakfast)', enabled: false, price: 25, priceType: 'per-night', description: 'Fresh continental buffet served in architectural gallery.' },
  { name: 'Spa & massage sessions', enabled: false, price: 80, priceType: 'one-time', description: '60 minutes deep tissue body recovery.' },
  { name: 'Airport pickup & drop', enabled: false, price: 50, priceType: 'one-time', description: 'Private Tesla chauffeur from terminal.' },
  { name: 'Extra bed / crib add-on', enabled: false, price: 30, priceType: 'per-night', description: 'Premium memory-foam mattress crib.' },
  { name: 'Mini-bar restock', enabled: false, price: 40, priceType: 'one-time', description: 'Craft beers, organic juices, and raw snacks.' },
  { name: 'Wi-Fi tier upgrades', enabled: false, price: 10, priceType: 'per-night', description: '10 Gbps dedicated fiber priority pipe.' },
  { name: 'Parking slot booking', enabled: false, price: 15, priceType: 'per-night', description: 'Secure subterranean garage slot.' },
  { name: 'Pool & gym access passes', enabled: false, price: 25, priceType: 'per-night', description: 'Heated basalt swimming lanes access.' },
  { name: 'Conference / banquet room reservation', enabled: false, price: 120, priceType: 'one-time', description: 'Cast-iron boardroom, holds up to 12 members.' },
];

/**
 * VendorListingForm — multi-step (step 1: geolocation + info, step 2: room-tier
 * grid constructor) form for creating or editing a vendor property listing.
 *
 * Props:
 *   editingRoomId     {string|null}
 *   editStep          {number}         1 or 2
 *   setEditStep       {fn}
 *   // Step-1 fields
 *   title / setTitle
 *   desc / setDesc
 *   address / setAddress
 *   lat / setLat
 *   lng / setLng
 *   archStyle / setArchStyle
 *   acousticLevel / setAcousticLevel
 *   workspaceProfile / setWorkspaceProfile
 *   amenitiesInput / setAmenitiesInput
 *   imagesFiles / setImagesFiles
 *   mapSearchQuery / setMapSearchQuery
 *   isLocationSaved / setIsLocationSaved
 *   locationSaving / setLocationSaving
 *   // Step-2 fields
 *   roomTiers / setRoomTiers
 *   selectedTierForEdit / setSelectedTierForEdit
 *   setShowTierModal
 *   draggingTierIndex / setDraggingTierIndex
 *   // Actions
 *   onSave            {fn}  () → void  (submit to backend)
 *   onCancel          {fn}  () → void
 */
const VendorListingForm = ({
  editingRoomId,
  editStep,
  setEditStep,
  title, setTitle,
  desc, setDesc,
  address, setAddress,
  lat, setLat,
  lng, setLng,
  archStyle, setArchStyle,
  acousticLevel, setAcousticLevel,
  workspaceProfile, setWorkspaceProfile,
  amenitiesInput, setAmenitiesInput,
  imagesFiles, setImagesFiles,
  mapSearchQuery, setMapSearchQuery,
  isLocationSaved, setIsLocationSaved,
  locationSaving, setLocationSaving,
  roomTiers, setRoomTiers,
  setSelectedTierForEdit,
  setShowTierModal,
  draggingTierIndex, setDraggingTierIndex,
  onSave,
  onCancel,
}) => {
  // --- Leaflet refs (Step 1 map) ---
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  // Initialise Leaflet when entering Step 1
  useEffect(() => {
    if (editStep === 1 && mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([lat, lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstance.current);

      markerInstance.current = L.marker([lat, lng], {
        icon: brutalIcon,
        draggable: true,
      }).addTo(mapInstance.current);

      markerInstance.current.on('dragend', () => {
        const pos = markerInstance.current.getLatLng();
        setLat(parseFloat(pos.lat.toFixed(6)));
        setLng(parseFloat(pos.lng.toFixed(6)));
        setIsLocationSaved(false);
      });

      mapInstance.current.on('click', (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        markerInstance.current.setLatLng([clickLat, clickLng]);
        setLat(parseFloat(clickLat.toFixed(6)));
        setLng(parseFloat(clickLng.toFixed(6)));
        setIsLocationSaved(false);
      });

      setTimeout(() => {
        if (mapInstance.current) mapInstance.current.invalidateSize();
      }, 200);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
      }
    };
  }, [editStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Map search + reverse geocode ---
  const handleMapSearch = async () => {
    if (!mapSearchQuery.trim()) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const first = data[0];
        const newLat = parseFloat(first.lat);
        const newLng = parseFloat(first.lon);
        setLat(parseFloat(newLat.toFixed(6)));
        setLng(parseFloat(newLng.toFixed(6)));
        setAddress(first.display_name);
        if (mapInstance.current && markerInstance.current) {
          mapInstance.current.setView([newLat, newLng], 14);
          markerInstance.current.setLatLng([newLat, newLng]);
        }
        setIsLocationSaved(false);
      } else {
        alert('Zero geolocation matches found.');
      }
    } catch (err) {
      console.error('Geocoding failed', err);
    }
  };

  const handleSaveLocation = async () => {
    setLocationSaving(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      setAddress(data?.display_name || `Coordinates [${lat}, ${lng}]`);
      setIsLocationSaved(true);
    } catch {
      setAddress(`Coordinates [${lat}, ${lng}]`);
      setIsLocationSaved(true);
    } finally {
      setLocationSaving(false);
    }
  };

  // --- Step navigation ---
  const handleProceedToStep2 = () => {
    if (!title.trim() || !desc.trim() || !address.trim()) {
      alert('Please fill out Title, Description, and Save Geolocation Address first.');
      return;
    }
    if (!isLocationSaved) {
      alert("Please click 'Save Location' to finalize coordinates and resolve address details.");
      return;
    }
    setEditStep(2);
    setTimeout(() => {
      const container = document.getElementById('grid-editor-container');
      if (container) gsap.fromTo(container, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 });
    }, 50);
  };

  // --- Grid constructor logic ---
  const handleCellClick = (row, col) => {
    const existing = roomTiers.find(
      (t) => t.gridPosition?.row === row && t.gridPosition?.col === col
    );
    if (existing) return;

    const newTier = {
      id: `temp-${Date.now()}`,
      tierName: `Room Tier ${roomTiers.length + 1}`,
      basePrice: 150,
      coverImage:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      gridPosition: { row, col },
      numberOfRooms: 1,
      availabilityDates: { start: '', end: '' },
      services: DEFAULT_SERVICES.map((s) => ({ ...s })),
    };
    setRoomTiers([...roomTiers, newTier]);
  };

  const handleOpenTierEditor = (tier) => {
    setSelectedTierForEdit({ ...tier });
    setShowTierModal(true);
  };

  const handleDragStart = (e, index) => {
    setDraggingTierIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, targetRow, targetCol) => {
    e.preventDefault();
    if (draggingTierIndex === null) return;

    const updated = [...roomTiers];
    const dragged = { ...updated[draggingTierIndex] };
    const existingIdx = updated.findIndex(
      (t) => t.gridPosition?.row === targetRow && t.gridPosition?.col === targetCol
    );

    if (existingIdx !== -1) {
      const tempPos = { ...dragged.gridPosition };
      dragged.gridPosition = { row: targetRow, col: targetCol };
      updated[existingIdx].gridPosition = tempPos;
    } else {
      dragged.gridPosition = { row: targetRow, col: targetCol };
    }

    updated[draggingTierIndex] = dragged;
    setRoomTiers(updated);
    setDraggingTierIndex(null);
  };

  return (
    <div className="font-mono text-xs text-[#212121] space-y-6">

      {/* Onboarding Flow Header */}
      <div className="border-b-2 border-[#212121] pb-4 flex justify-between items-end">
        <div className="space-y-1">
          <Badge variant="terracotta">[ ONBOARDING PIPELINE STEP {editStep} / 2 ]</Badge>
          <h1 className="text-2xl font-bold uppercase">
            {editingRoomId ? 'EDIT SUITE REGISTRY' : 'ESTABLISH NEW ARCHITECTURAL STAY'}
          </h1>
        </div>
        <button
          onClick={onCancel}
          className="bg-white hover:bg-[#C84B31] hover:text-white border-2 border-[#212121] px-3 py-1 font-bold shadow-[2px_2px_0px_#212121]"
        >
          CANCEL SETUP
        </button>
      </div>

      {/* ── STEP 1: GEOLOCATION & INFO ── */}
      {editStep === 1 && (
        <div id="geolocation-container" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left: Form fields */}
          <div className="border-2 border-[#212121] p-5 bg-white shadow-[4px_4px_0px_#212121] space-y-4">
            <div className="space-y-1">
              <label className="font-bold uppercase text-[#212121]">STAY TITLE</label>
              <input
                type="text"
                placeholder="THE CONCRETE PENTHOUSE"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#F1EDEA]/50 border-2 border-[#212121] p-2.5 outline-none font-sans text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase text-[#212121]">NARRATIVE SPECIFICATION DESCRIPTION</label>
              <textarea
                rows={4}
                placeholder="Narrate details of design, concrete walls finishes, workspace desks..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-[#F1EDEA]/50 border-2 border-[#212121] p-2.5 outline-none font-sans text-xs resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold uppercase text-[#212121]">STYLE CATEGORY</label>
                <select
                  value={archStyle}
                  onChange={(e) => setArchStyle(e.target.value)}
                  className="w-full bg-white border-2 border-[#212121] p-2 outline-none"
                >
                  <option value="Board-Formed Concrete">Board-Formed Concrete</option>
                  <option value="Industrial Modernist">Industrial Modernist</option>
                  <option value="Raw Terracotta & Stone">Raw Terracotta &amp; Stone</option>
                  <option value="Japanese Modern & Cedar">Japanese Modern &amp; Cedar</option>
                  <option value="Cast-Iron Brutalism">Cast-Iron Brutalism</option>
                  <option value="Volcanic Basalt & Glass">Volcanic Basalt &amp; Glass</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase text-[#212121]">ACOUSTIC SPEC</label>
                <input
                  type="text"
                  value={acousticLevel}
                  onChange={(e) => setAcousticLevel(e.target.value)}
                  className="w-full bg-[#F1EDEA]/50 border-2 border-[#212121] p-2 outline-none font-sans text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase text-[#212121]">WORKPLACE AMENITIES PROFILE</label>
              <input
                type="text"
                value={workspaceProfile}
                onChange={(e) => setWorkspaceProfile(e.target.value)}
                className="w-full bg-[#F1EDEA]/50 border-2 border-[#212121] p-2 outline-none font-sans text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase text-[#212121]">MATERIALS / SERVICES AMENITIES (COMMA SEPARATED)</label>
              <input
                type="text"
                value={amenitiesInput}
                onChange={(e) => setAmenitiesInput(e.target.value)}
                className="w-full bg-[#F1EDEA]/50 border-2 border-[#212121] p-2 outline-none font-sans text-xs"
              />
            </div>

            <div className="space-y-2 border-2 border-[#212121] p-3 bg-white">
              <label className="font-bold uppercase text-[#212121] flex items-center gap-1.5 cursor-pointer">
                <Upload size={16} className="text-[#C84B31]" />
                <span>UPLOAD STAY PHOTOS (MAX 5 FILES)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImagesFiles(e.target.files)}
                  className="hidden"
                />
              </label>
              {imagesFiles && imagesFiles.length > 0 && (
                <div className="font-sans text-[11px] text-[#212121]/70 font-semibold space-y-1">
                  {Array.from(imagesFiles).map((file, idx) => (
                    <div key={idx}>
                      • {file.name} ({Math.round(file.size / 1024)} KB)
                    </div>
                  ))}
                </div>
              )}
              {editingRoomId && (
                <span className="text-[10px] text-[#212121]/50 block uppercase font-bold mt-1">
                  * Leave empty to retain current active photos.
                </span>
              )}
            </div>
          </div>

          {/* Right: Map picker */}
          <div className="space-y-4">
            <div className="border-2 border-[#212121] p-4 bg-white shadow-[4px_4px_0px_#212121] space-y-3">
              <label className="font-bold uppercase text-[#212121] block">
                [ MAP LOCATION PINPOINT PICKER ]
              </label>

              {/* Search bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search area (e.g. Shibuya, Tokyo)..."
                  value={mapSearchQuery}
                  onChange={(e) => setMapSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleMapSearch(); }}
                  className="flex-grow bg-[#F1EDEA]/50 border-2 border-[#212121] p-2 outline-none font-sans text-xs"
                />
                <button
                  type="button"
                  onClick={handleMapSearch}
                  className="bg-[#212121] hover:bg-[#C84B31] text-white border-2 border-[#212121] px-3 py-2 cursor-pointer flex items-center justify-center shadow-[1px_1px_0px_#212121]"
                >
                  <Search size={14} />
                </button>
              </div>

              {/* Leaflet map container */}
              <div ref={mapRef} className="w-full h-80 border-2 border-[#212121] relative z-10" />

              {/* Coordinate readout */}
              <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-[#212121]/70 pt-1">
                <div>LATITUDE: {lat}</div>
                <div>LONGITUDE: {lng}</div>
              </div>

              {/* Save location */}
              <div className="border-t border-[#212121]/10 pt-2 flex items-center justify-between gap-4">
                <div className="flex-grow font-sans text-[11px] font-semibold text-[#212121]/80 max-w-[65%] truncate">
                  {address || '[ Address not saved yet ]'}
                </div>
                <button
                  type="button"
                  onClick={handleSaveLocation}
                  disabled={locationSaving}
                  className={`px-4 py-2 border-2 border-[#212121] font-bold shadow-[2px_2px_0px_#212121] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all uppercase cursor-pointer ${
                    isLocationSaved ? 'bg-emerald-800 text-white' : 'bg-[#C84B31] text-white'
                  }`}
                >
                  {locationSaving ? 'REVERSING...' : isLocationSaved ? 'LOCATION SAVED ✓' : 'SAVE LOCATION'}
                </button>
              </div>
            </div>

            {/* Proceed CTA */}
            <button
              type="button"
              onClick={handleProceedToStep2}
              className="w-full bg-[#212121] hover:bg-[#C84B31] text-white font-bold p-3.5 border-2 border-[#212121] shadow-[4px_4px_0px_#212121] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all uppercase cursor-pointer text-center text-xs tracking-wider flex items-center justify-center gap-2"
            >
              <span>PROCEED TO ROOMS CONSTRUCTOR GRID</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      )}

      {/* ── STEP 2: ROOM GRID CONSTRUCTOR ── */}
      {editStep === 2 && (
        <div id="grid-editor-container" className="space-y-6">

          <div className="bg-[#212121] text-white p-4 border-2 border-[#212121] shadow-[4px_4px_0px_#212121] space-y-1">
            <h3 className="font-bold uppercase tracking-wider text-amber-500">
              [ 4x4 STRUCTURE ROOM TIERS MATRIX ]
            </h3>
            <p className="font-sans text-[11px] leading-relaxed text-stone-300">
              Click any empty cell block below to define a new suite tier. Double-click a placed room
              tier box to configure pricing, availability date window, and 11 distinct extra services.
              Drag and drop any room tier box to reposition or reorder them.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* 4×4 Grid */}
            <div className="lg:col-span-2 bg-[#EAE5E0] border-2 border-[#212121] p-6 shadow-[5px_5px_0px_#212121] select-none">
              <div className="grid grid-cols-4 gap-4 aspect-square">
                {Array.from({ length: 16 }).map((_, idx) => {
                  const row = Math.floor(idx / 4);
                  const col = idx % 4;
                  const tierIndex = roomTiers.findIndex(
                    (t) => t.gridPosition?.row === row && t.gridPosition?.col === col
                  );
                  const tier = tierIndex !== -1 ? roomTiers[tierIndex] : null;

                  return (
                    <div
                      key={idx}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, row, col)}
                      onClick={() => handleCellClick(row, col)}
                      className={`border-2 border-dashed aspect-square flex flex-col items-center justify-center p-1 transition-all relative cursor-pointer ${
                        tier
                          ? 'bg-white border-[#212121] shadow-[2px_2px_0px_#212121]'
                          : 'border-stone-400 hover:border-[#212121] hover:bg-stone-300/30'
                      }`}
                    >
                      {tier ? (
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, tierIndex)}
                          onDoubleClick={() => handleOpenTierEditor(tier)}
                          className="w-full h-full flex flex-col justify-between p-1 bg-white relative group"
                        >
                          <div className="h-[45%] border border-[#212121] overflow-hidden bg-stone-100">
                            <img
                              src={
                                tier.coverImage ||
                                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
                              }
                              alt={tier.tierName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-grow flex flex-col justify-end">
                            <span className="font-bold text-[9px] uppercase truncate block leading-tight text-[#212121]">
                              {tier.tierName}
                            </span>
                            <span className="font-mono text-[9px] font-bold text-[#C84B31]">
                              ${tier.basePrice}/N
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-[#212121]/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-[9px] text-white font-bold text-center uppercase">
                              DBL-CLK TO EDIT
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-stone-500 font-bold uppercase">[ + ADD ]</span>
                      )}
                      <div className="absolute bottom-1 right-1 text-[8px] text-[#212121]/30 font-bold">
                        R{row}C{col}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar: tier list + nav buttons */}
            <div className="space-y-4">
              <div className="border-2 border-[#212121] p-4 bg-white shadow-[3px_3px_0px_#212121] space-y-3">
                <h4 className="font-bold uppercase border-b border-[#212121] pb-1">
                  [ ESTABLISHED TIERS LIST ]
                </h4>
                {roomTiers.length === 0 ? (
                  <p className="text-[10px] text-[#212121]/50 font-bold">
                    No active tiers. Click a cell inside the grid to create one.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {roomTiers.map((t) => (
                      <div
                        key={t.id}
                        onDoubleClick={() => handleOpenTierEditor(t)}
                        className="border border-[#212121] p-2 bg-[#F1EDEA]/30 flex justify-between items-center group cursor-pointer hover:bg-slate-50"
                      >
                        <div>
                          <span className="font-bold block uppercase text-[10px] text-[#212121]">
                            {t.tierName}
                          </span>
                          <span className="font-mono text-[9px] text-[#C84B31]">
                            ${t.basePrice} per night • {t.numberOfRooms || 1} room(s)
                          </span>
                        </div>
                        <span className="text-[8px] text-[#212121]/40 group-hover:text-[#212121] font-bold">
                          POS: R{t.gridPosition.row}-C{t.gridPosition.col} ✎
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  type="button"
                  onClick={() => setEditStep(1)}
                  className="w-1/2 shadow-[2px_2px_0px_#212121]"
                >
                  STEP 1 INFO
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  type="button"
                  onClick={onSave}
                  className="w-1/2 bg-[#C84B31] text-white border-2 border-[#212121] shadow-[2px_2px_0px_#212121] font-bold"
                >
                  SAVE SETUP
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default VendorListingForm;
