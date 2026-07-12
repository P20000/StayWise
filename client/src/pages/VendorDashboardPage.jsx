import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Plus, Star } from 'lucide-react';
import api from '../services/api';
import { ErrorBanner } from '../components/common/ErrorBanner';

// Tab panels
import VendorBookingsTab from './vendor/VendorBookingsTab';
import VendorListingsTab from './vendor/VendorListingsTab';
import VendorHelpTab from './vendor/VendorHelpTab';

// Multi-step listing form
import VendorListingForm from './vendor/VendorListingForm';

// Modals
import VendorTierModal from './vendor/VendorTierModal';
import VendorAvailabilityModal from './vendor/VendorAvailabilityModal';

// Floating chat widget (fully self-contained)
import VendorChatWidget from './vendor/VendorChatWidget';

const TABS = ['bookings', 'listings', 'help'];

export const VendorDashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  // ── Tab State ──
  const [activeTab, setActiveTab] = useState('bookings');

  // ── Dashboard Data ──
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // ── Editing / Form Flow ──
  const [isEditing, setIsEditing] = useState(false);
  const [editStep, setEditStep] = useState(1);
  const [editingRoomId, setEditingRoomId] = useState(null);

  // Step 1 form fields
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(35.6580);
  const [lng, setLng] = useState(139.7016);
  const [archStyle, setArchStyle] = useState('Board-Formed Concrete');
  const [acousticLevel, setAcousticLevel] = useState('High (dB < 35 certified)');
  const [workspaceProfile, setWorkspaceProfile] = useState('Dedicated Fiber & Ergonomic Task Desk');
  const [amenitiesInput, setAmenitiesInput] = useState('Acoustic Double-Glazing, High-Performance Mesh Wi-Fi');
  const [imagesFiles, setImagesFiles] = useState([]);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isLocationSaved, setIsLocationSaved] = useState(false);
  const [locationSaving, setLocationSaving] = useState(false);

  // Step 2 room tier grid fields
  const [roomTiers, setRoomTiers] = useState([]);
  const [selectedTierForEdit, setSelectedTierForEdit] = useState(null);
  const [showTierModal, setShowTierModal] = useState(false);
  const [draggingTierIndex, setDraggingTierIndex] = useState(null);

  // Availability modal state
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedRoomForAvailability, setSelectedRoomForAvailability] = useState(null);
  const [selectedTierId, setSelectedTierId] = useState('');
  const [currentAvailabilityDates, setCurrentAvailabilityDates] = useState({ start: '', end: '' });
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);

  // ── Sync tab from URL param ──
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && TABS.includes(tab)) setActiveTab(tab);
  }, [location]);

  // ── Data fetch ──
  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const roomsRes = await api.get(`/rooms?vendor=${user._id || user.id}`);
      const roomsData = roomsRes.data.data || [];
      setRooms(roomsData);
      localStorage.setItem(`stay_count_${user._id || user.id}`, roomsData.length);

      const bookingsRes = await api.get('/bookings/vendor-bookings');
      const bookingsData = bookingsRes.data.data || [];
      setBookings(bookingsData);
      localStorage.setItem(`booking_count_${user._id || user.id}`, bookingsData.length);
    } catch (err) {
      err.message = `[DASHBOARD_ERROR] Could not fetch dashboard metrics: ${err.message}`;
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Metrics ──
  const totalReviews = rooms.reduce((sum, r) => sum + (r.reviewsCount || 0), 0);
  const reviewedRooms = rooms.filter((r) => r.reviewsCount > 0);
  const avgRating =
    totalReviews > 0
      ? (reviewedRooms.reduce((sum, r) => sum + r.rating * r.reviewsCount, 0) / totalReviews).toFixed(2)
      : null;

  // ── CRUD Handlers (passed to VendorListingsTab) ──
  const handleOpenCreateFlow = () => {
    setEditingRoomId(null);
    setTitle('');
    setDesc('');
    setAddress(user?.vendorLocation?.address || '');
    setLat(user?.vendorLocation?.coordinates?.[1] || 35.6580);
    setLng(user?.vendorLocation?.coordinates?.[0] || 139.7016);
    setArchStyle('Board-Formed Concrete');
    setAcousticLevel('High (dB < 35 certified)');
    setWorkspaceProfile('Dedicated Fiber & Ergonomic Task Desk');
    setAmenitiesInput('Acoustic Double-Glazing, High-Performance Mesh Wi-Fi');
    setImagesFiles([]);
    setRoomTiers([]);
    setIsLocationSaved(!!user?.vendorLocation?.address);
    setEditStep(1);
    setIsEditing(true);
  };

  const handleOpenEditFlow = (room) => {
    setEditingRoomId(room._id);
    setTitle(room.title);
    setDesc(room.description || '');
    setAddress(room.location);
    setLat(room.locationCoordinates?.coordinates?.[1] || 35.6580);
    setLng(room.locationCoordinates?.coordinates?.[0] || 139.7016);
    setArchStyle(room.architecturalStyle || 'Board-Formed Concrete');
    setAcousticLevel(room.quietnessLevel || 'High (dB < 35 certified)');
    setWorkspaceProfile(room.workplaceProfile || 'Dedicated Fiber & Ergonomic Task Desk');
    setAmenitiesInput(room.amenities ? room.amenities.join(', ') : '');
    setImagesFiles([]);
    setRoomTiers(room.roomTiers || []);
    setIsLocationSaved(true);
    setEditStep(1);
    setIsEditing(true);
  };

  const handleToggleStatus = async (room) => {
    const nextStatus = room.status === 'paused' ? 'active' : 'paused';
    try {
      await api.put(`/rooms/${room._id}`, { status: nextStatus });
      setSuccess(`[UPDATED] Listing status updated to: ${nextStatus.toUpperCase()}`);
      fetchDashboardData();
    } catch (err) {
      err.message = `[STATUS_ERROR] Failed to modify listing status: ${err.message}`;
      setError(err);
    }
  };

  const handleDeleteListingWithCheck = async (room) => {
    const confirmName = window.prompt(
      `[DANGER] To dismantle this stay, please type the exact title name "${room.title}":`
    );
    if (confirmName === room.title) {
      try {
        await api.delete(`/rooms/${room._id}`);
        setSuccess('[DELETED] Listing permanently dismantled.');
        fetchDashboardData();
      } catch (err) {
        err.message = `[DELETE_ERROR] Failed to delete listing: ${err.message}`;
        setError(err);
      }
    } else {
      alert('Dismantling aborted. Title mismatch.');
    }
  };

  // ── Availability Modal Handlers ──
  const handleOpenAvailabilityModal = (room) => {
    setSelectedRoomForAvailability(room);
    if (room.roomTiers?.length > 0) {
      const firstTier = room.roomTiers[0];
      setSelectedTierId(firstTier._id || firstTier.id);
      setCurrentAvailabilityDates({
        start: firstTier.availabilityDates?.start ? new Date(firstTier.availabilityDates.start) : '',
        end: firstTier.availabilityDates?.end ? new Date(firstTier.availabilityDates.end) : '',
      });
    } else {
      setSelectedTierId('');
      setCurrentAvailabilityDates({ start: '', end: '' });
    }
    setShowAvailabilityModal(true);
  };

  const handleTierChange = (e) => {
    const tierId = e.target.value;
    setSelectedTierId(tierId);
    const tier = selectedRoomForAvailability?.roomTiers.find(
      (t) => (t._id || t.id) === tierId
    );
    if (tier) {
      setCurrentAvailabilityDates({
        start: tier.availabilityDates?.start ? new Date(tier.availabilityDates.start) : '',
        end: tier.availabilityDates?.end ? new Date(tier.availabilityDates.end) : '',
      });
    } else {
      setCurrentAvailabilityDates({ start: '', end: '' });
    }
  };

  const handleSaveAvailability = async () => {
    if (!selectedTierId || !selectedRoomForAvailability) return;
    setIsSavingAvailability(true);
    try {
      const updatedTiers = selectedRoomForAvailability.roomTiers.map((t) => {
        if ((t._id || t.id) === selectedTierId) {
          return {
            ...t,
            availabilityDates: {
              start: currentAvailabilityDates.start
                ? currentAvailabilityDates.start.toISOString()
                : '',
              end: currentAvailabilityDates.end
                ? currentAvailabilityDates.end.toISOString()
                : '',
            },
          };
        }
        return t;
      });

      const response = await api.put(`/rooms/${selectedRoomForAvailability._id}`, {
        roomTiers: updatedTiers,
      });

      setRooms((prev) =>
        prev.map((r) => (r._id === selectedRoomForAvailability._id ? response.data.data : r))
      );
      alert('Availability dates updated successfully.');
      setShowAvailabilityModal(false);
      setSelectedRoomForAvailability(null);
    } catch (err) {
      alert(`Failed to save availability: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSavingAvailability(false);
    }
  };

  // ── Tier Modal Handlers ──
  const handleSaveTierDetails = () => {
    if (!selectedTierForEdit.tierName.trim()) {
      alert('Tier name is required.');
      return;
    }
    if (selectedTierForEdit.basePrice <= 0) {
      alert('Base rate must be greater than zero.');
      return;
    }
    setRoomTiers((prev) =>
      prev.map((t) => (t.id === selectedTierForEdit.id ? selectedTierForEdit : t))
    );
    setShowTierModal(false);
    setSelectedTierForEdit(null);
  };

  const handleRemoveTier = (tierId) => {
    if (window.confirm('Remove this room tier?')) {
      setRoomTiers((prev) => prev.filter((t) => t.id !== tierId));
      setShowTierModal(false);
      setSelectedTierForEdit(null);
    }
  };

  // ── Form Submit (backend) ──
  const handleSaveSetup = async () => {
    if (roomTiers.length === 0) {
      alert('Validation Error: Please establish at least one room tier in the grid.');
      return;
    }
    if (lat === 0 || lng === 0 || !address) {
      alert('Validation Error: Invalid geographical coordinates.');
      return;
    }
    for (const tier of roomTiers) {
      if (tier.basePrice <= 0) {
        alert(`Validation Error: Room tier "${tier.tierName}" must have a nightly rate greater than $0.`);
        return;
      }
      for (const svc of tier.services) {
        if (svc.enabled && svc.price < 0) {
          alert(
            `Validation Error: Enabled service "${svc.name}" in tier "${tier.tierName}" has an invalid negative price.`
          );
          return;
        }
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', desc);
      formData.append('location', address);
      formData.append('architecturalStyle', archStyle);
      formData.append('quietnessLevel', acousticLevel);
      formData.append('workplaceProfile', workspaceProfile);
      formData.append('basePrice', Math.min(...roomTiers.map((t) => t.basePrice)));
      formData.append('amenities', JSON.stringify(amenitiesInput.split(',').map((a) => a.trim()).filter(Boolean)));
      formData.append(
        'locationCoordinates',
        JSON.stringify({ type: 'Point', coordinates: [parseFloat(lng.toFixed(6)), parseFloat(lat.toFixed(6))] })
      );
      formData.append('roomTiers', JSON.stringify(roomTiers));
      if (imagesFiles?.length > 0) {
        for (let i = 0; i < imagesFiles.length; i++) formData.append('images', imagesFiles[i]);
      }

      if (editingRoomId) {
        await api.put(`/rooms/${editingRoomId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('[CONFIRMED] Architectural details updated.');
      } else {
        await api.post('/rooms', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('[CONFIRMED] New modernist stay successfully published.');
      }

      setIsEditing(false);
      fetchDashboardData();
    } catch (err) {
      err.message = `[REGISTRY_ERROR] Submission process aborted: ${err.response?.data?.message || err.message}`;
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const userId = user?._id || user?.id;

  return (
    <div className="min-h-screen bg-[#F1EDEA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Global Notifications */}
        {error && (
          <ErrorBanner error={error} className="mb-6 shadow-[3px_3px_0px_#212121]" onClose={() => setError(null)} />
        )}
        {success && (
          <div className="bg-emerald-800 text-white border-2 border-[#212121] p-4 font-mono text-xs font-bold shadow-[3px_3px_0px_#212121] flex justify-between items-center">
            <span>[ CONFIRMED ]: {success.toUpperCase()}</span>
            <button onClick={() => setSuccess('')} className="text-white bg-transparent border-0 cursor-pointer font-bold">✕</button>
          </div>
        )}

        {/* ── SECTION A: MAIN DASHBOARD VIEW ── */}
        {!isEditing ? (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[#212121] pb-6">
              <div className="space-y-1.5">
                <Badge variant="terracotta">[ STAGE: PORTFOLIO OPERATION ]</Badge>
                <h1 className="font-mono text-3xl sm:text-5xl font-bold uppercase tracking-tight text-[#212121]">
                  VENDORS ARCHITECTURAL HUBS
                </h1>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={handleOpenCreateFlow}
                className="w-full md:w-auto uppercase shadow-[4px_4px_0px_#212121]"
              >
                <Plus size={16} />
                <span>PUBLISH NEW STAY</span>
              </Button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="p-4 bg-white border-2 border-[#212121] shadow-[3px_3px_0px_#212121]">
                <span className="font-mono text-xs text-[#212121]/60 block font-bold">[ PORTFOLIO PROPERTIES ]</span>
                <span className="font-mono text-3xl font-bold text-[#212121]">{rooms.length} Units</span>
              </Card>
              <Card className="p-4 bg-white border-2 border-[#212121] shadow-[3px_3px_0px_#212121]">
                <span className="font-mono text-xs text-[#212121]/60 block font-bold">[ OVERALL RATING FEEDBACK ]</span>
                {avgRating === null ? (
                  <div className="mt-1 space-y-0.5">
                    <span className="font-mono text-sm font-bold text-amber-600 flex items-center gap-1.5">
                      <span className="animate-pulse">✦</span>
                      <span>NO REVIEWS YET</span>
                    </span>
                    <p className="font-sans text-[10px] text-[#212121]/40">Rating appears once guests review your stays.</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="text-[#C84B31] fill-[#C84B31]" size={20} />
                    <span className="font-mono text-3xl font-bold text-[#212121]">{avgRating}</span>
                    <span className="font-mono text-xs text-[#212121]/50 self-end pb-1">({totalReviews} reviews)</span>
                  </div>
                )}
              </Card>
              <Card className="p-4 bg-white border-2 border-[#212121] shadow-[3px_3px_0px_#212121]">
                <span className="font-mono text-xs text-[#212121]/60 block font-bold">[ TOTAL BOOKINGS INVOICES ]</span>
                <span className="font-mono text-3xl font-bold text-[#212121]">{bookings.length} Orders</span>
              </Card>
            </div>

            {/* Tab nav */}
            <div className="flex gap-0 border-b-2 border-[#212121]">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`font-mono text-xs font-bold uppercase px-6 py-3 border-r-2 border-[#212121] tracking-wider transition-colors cursor-pointer ${
                    activeTab === tab
                      ? 'bg-[#212121] text-white'
                      : 'bg-white text-[#212121] hover:bg-[#F1EDEA]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab panels */}
            {activeTab === 'bookings' && (
              <VendorBookingsTab bookings={bookings} loading={loading} userId={userId} />
            )}
            {activeTab === 'listings' && (
              <VendorListingsTab
                rooms={rooms}
                loading={loading}
                userId={userId}
                onEdit={handleOpenEditFlow}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteListingWithCheck}
                onOpenAvailability={handleOpenAvailabilityModal}
              />
            )}
            {activeTab === 'help' && (
              <VendorHelpTab rooms={rooms} user={user} />
            )}
          </>
        ) : (
          /* ── SECTION B: MULTI-STEP FORM ── */
          <VendorListingForm
            editingRoomId={editingRoomId}
            editStep={editStep}
            setEditStep={setEditStep}
            title={title} setTitle={setTitle}
            desc={desc} setDesc={setDesc}
            address={address} setAddress={setAddress}
            lat={lat} setLat={setLat}
            lng={lng} setLng={setLng}
            archStyle={archStyle} setArchStyle={setArchStyle}
            acousticLevel={acousticLevel} setAcousticLevel={setAcousticLevel}
            workspaceProfile={workspaceProfile} setWorkspaceProfile={setWorkspaceProfile}
            amenitiesInput={amenitiesInput} setAmenitiesInput={setAmenitiesInput}
            imagesFiles={imagesFiles} setImagesFiles={setImagesFiles}
            mapSearchQuery={mapSearchQuery} setMapSearchQuery={setMapSearchQuery}
            isLocationSaved={isLocationSaved} setIsLocationSaved={setIsLocationSaved}
            locationSaving={locationSaving} setLocationSaving={setLocationSaving}
            roomTiers={roomTiers} setRoomTiers={setRoomTiers}
            selectedTierForEdit={selectedTierForEdit}
            setSelectedTierForEdit={setSelectedTierForEdit}
            setShowTierModal={setShowTierModal}
            draggingTierIndex={draggingTierIndex}
            setDraggingTierIndex={setDraggingTierIndex}
            onSave={handleSaveSetup}
            onCancel={() => {
              if (window.confirm('Abort current onboarding progress?')) setIsEditing(false);
            }}
          />
        )}

      </div>

      {/* ── TIER CONFIGURATION MODAL ── */}
      {showTierModal && selectedTierForEdit && (
        <VendorTierModal
          tier={selectedTierForEdit}
          onChange={setSelectedTierForEdit}
          onSave={handleSaveTierDetails}
          onRemove={handleRemoveTier}
          onClose={() => { setShowTierModal(false); setSelectedTierForEdit(null); }}
        />
      )}

      {/* ── AVAILABILITY CALENDAR MODAL ── */}
      {showAvailabilityModal && selectedRoomForAvailability && (
        <VendorAvailabilityModal
          room={selectedRoomForAvailability}
          selectedTierId={selectedTierId}
          availabilityDates={currentAvailabilityDates}
          isSaving={isSavingAvailability}
          onTierChange={handleTierChange}
          onDatesChange={setCurrentAvailabilityDates}
          onClearDates={() => setCurrentAvailabilityDates({ start: '', end: '' })}
          onSave={handleSaveAvailability}
          onClose={() => { setShowAvailabilityModal(false); setSelectedRoomForAvailability(null); }}
        />
      )}

      {/* ── FLOATING CHAT WIDGET ── */}
      <VendorChatWidget />

    </div>
  );
};

export default VendorDashboardPage;
