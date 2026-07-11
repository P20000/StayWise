import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { 
  Plus, Edit3, Trash2, Star, MapPin, Eye, X, Upload, 
  Search, ArrowRight, HelpCircle, MessageSquare, ChevronDown, 
  User, Check, Loader2, Play, Pause, Copy, Calendar
} from 'lucide-react';
import api from '../services/api';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { gsap } from 'gsap';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom brutalist marker icon for Leaflet
const brutalIcon = L.divIcon({
  className: 'brutal-marker',
  html: `<div style="width: 16px; height: 16px; background: #C84B31; border: 2px solid #212121; box-shadow: 2px 2px 0px #212121; transform: rotate(45deg);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// MiniMap component for visual listing cards
const MiniMap = ({ lat, lng }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        zoomControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false
      }).setView([lat, lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
      L.marker([lat, lng], { icon: brutalIcon }).addTo(mapRef.current);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng]);

  return <div ref={containerRef} className="w-full h-36 border-b-2 border-[#212121]" />;
};

export const VendorDashboardPage = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  // Active Tab: bookings | listings | help
  const [activeTab, setActiveTab] = useState('bookings');
  
  // Dashboard Core State
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Editing / Multi-step creation state
  const [isEditing, setIsEditing] = useState(false);
  const [editStep, setEditStep] = useState(1); // 1: Geolocation & Info, 2: Room Grid
  const [editingRoomId, setEditingRoomId] = useState(null);

  // --- Step 1 Form Fields ---
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
  
  // Step 1 Leaflet states
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isLocationSaved, setIsLocationSaved] = useState(false);
  const [locationSaving, setLocationSaving] = useState(false);

  // --- Step 2 Room Tier Grid Fields ---
  // Room tiers array containing: { id, tierName, basePrice, coverImage, gridPosition: {row, col}, services: [...], availabilityDates: {start, end} }
  const [roomTiers, setRoomTiers] = useState([]);
  const [selectedTierForEdit, setSelectedTierForEdit] = useState(null); // When double clicking a tier
  const [showTierModal, setShowTierModal] = useState(false);
  const [draggingTierIndex, setDraggingTierIndex] = useState(null);

  // --- Support Queue States ---
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportRoomId, setSupportRoomId] = useState('');
  const [supportCategory, setSupportCategory] = useState('Getting started');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSuccess, setSupportSuccess] = useState(false);

  // --- Chat Widget State ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'agent', text: 'Welcome to Vendor Business Support. Business hours: 09:00 - 18:00 JST. How can I help you today?' }
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');

  // Leaflet refs
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  // Sync active tab with url search parameter ?tab=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['bookings', 'listings', 'help'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  // Fetch dashboard metrics when user session is loaded
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch Rooms
      const roomsRes = await api.get(`/rooms?vendor=${user._id || user.id}`);
      setRooms(roomsRes.data.data || []);
      
      // Fetch Bookings made on this Vendor's Rooms
      const bookingsRes = await api.get('/bookings/vendor-bookings');
      setBookings(bookingsRes.data.data || []);
    } catch (err) {
      err.message = `[DASHBOARD_ERROR] Could not fetch dashboard metrics: ${err.message}`;
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Geolocation Step 1 Leaflet Logic ---
  useEffect(() => {
    if (isEditing && editStep === 1 && mapRef.current && !mapInstance.current) {
      // Initialize map
      mapInstance.current = L.map(mapRef.current).setView([lat, lng], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      markerInstance.current = L.marker([lat, lng], {
        icon: brutalIcon,
        draggable: true
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
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
      }
    };
  }, [isEditing, editStep]);

  const handleMapSearch = async () => {
    if (!mapSearchQuery.trim()) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}`);
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
        alert("Zero geolocation matches found.");
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    }
  };

  const handleSaveLocation = async () => {
    setLocationSaving(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress(`Coordinates [${lat}, ${lng}]`);
      }
      setIsLocationSaved(true);
    } catch (err) {
      setAddress(`Coordinates [${lat}, ${lng}]`);
      setIsLocationSaved(true);
    } finally {
      setLocationSaving(false);
    }
  };

  // --- Step 2 Grid Constructor Logic ---
  const handleProceedToStep2 = () => {
    if (!title.trim() || !desc.trim() || !address.trim()) {
      alert("Please fill out Title, Description, and Save Geolocation Address first.");
      return;
    }
    if (!isLocationSaved) {
      alert("Please click 'Save Location' to finalize coordinates and resolve address details.");
      return;
    }

    setEditStep(2);
    // GSAP Slide animation
    setTimeout(() => {
      const container = document.getElementById('grid-editor-container');
      if (container) {
        gsap.fromTo(container, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 });
      }
    }, 50);
  };

  const handleBackToStep1 = () => {
    setEditStep(1);
  };

  const handleCellClick = (row, col) => {
    // Check if cell is empty
    const existing = roomTiers.find(t => t.gridPosition?.row === row && t.gridPosition?.col === col);
    if (existing) return; // double-click to edit, single click on occupied does nothing

    // Create a new tier in this position
    const newTier = {
      id: `temp-${Date.now()}`,
      tierName: `Room Tier ${roomTiers.length + 1}`,
      basePrice: 150,
      coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      gridPosition: { row, col },
      availabilityDates: { start: '', end: '' },
      services: [
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
        { name: 'Conference / banquet room reservation', enabled: false, price: 120, priceType: 'one-time', description: 'Cast-iron boardroom, holds up to 12 members.' }
      ]
    };

    setRoomTiers([...roomTiers, newTier]);
  };

  const handleOpenTierEditor = (tier) => {
    setSelectedTierForEdit({ ...tier });
    setShowTierModal(true);
  };

  const handleSaveTierDetails = () => {
    if (!selectedTierForEdit.tierName.trim()) {
      alert("Tier name is required.");
      return;
    }
    if (selectedTierForEdit.basePrice <= 0) {
      alert("Base rate must be greater than zero.");
      return;
    }

    setRoomTiers(roomTiers.map(t => t.id === selectedTierForEdit.id ? selectedTierForEdit : t));
    setShowTierModal(false);
    setSelectedTierForEdit(null);
  };

  const handleRemoveTier = (tierId) => {
    if (window.confirm("Remove this room tier?")) {
      setRoomTiers(roomTiers.filter(t => t.id !== tierId));
      setShowTierModal(false);
      setSelectedTierForEdit(null);
    }
  };

  // --- HTML5 Drag & Drop Logic ---
  const handleDragStart = (e, index) => {
    setDraggingTierIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, row, col) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetRow, targetCol) => {
    e.preventDefault();
    if (draggingTierIndex === null) return;

    const updated = [...roomTiers];
    const dragged = { ...updated[draggingTierIndex] };

    // Find if another tier occupies target row/col (for swap)
    const existingIdx = updated.findIndex(t => t.gridPosition?.row === targetRow && t.gridPosition?.col === targetCol);

    if (existingIdx !== -1) {
      // Swap positions
      const tempPos = { ...dragged.gridPosition };
      dragged.gridPosition = { row: targetRow, col: targetCol };
      updated[existingIdx].gridPosition = tempPos;
    } else {
      // Just move to empty position
      dragged.gridPosition = { row: targetRow, col: targetCol };
    }

    updated[draggingTierIndex] = dragged;
    setRoomTiers(updated);
    setDraggingTierIndex(null);
  };

  // --- Submit to Backend ---
  const handleSaveSetup = async () => {
    // Validations
    if (roomTiers.length === 0) {
      alert("Validation Error: Please establish at least one room tier in the grid.");
      return;
    }
    if (lat === 0 || lng === 0 || !address) {
      alert("Validation Error: Invalid geographical coordinates.");
      return;
    }

    // Verify all tiers have prices > 0 and services are valid
    for (const tier of roomTiers) {
      if (tier.basePrice <= 0) {
        alert(`Validation Error: Room tier "${tier.tierName}" must have a nightly rate greater than $0.`);
        return;
      }
      for (const svc of tier.services) {
        if (svc.enabled && svc.price < 0) {
          alert(`Validation Error: Enabled service "${svc.name}" in tier "${tier.tierName}" has an invalid negative price.`);
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
      
      // Calculate base price as the minimum tier price
      const minBasePrice = Math.min(...roomTiers.map(t => t.basePrice));
      formData.append('basePrice', minBasePrice);

      const amenitiesArr = amenitiesInput.split(',').map(a => a.trim()).filter(Boolean);
      formData.append('amenities', JSON.stringify(amenitiesArr));

      // Normalise coordinates
      const coords = { type: 'Point', coordinates: [parseFloat(lng.toFixed(6)), parseFloat(lat.toFixed(6))] };
      formData.append('locationCoordinates', JSON.stringify(coords));

      // Append roomTiers
      formData.append('roomTiers', JSON.stringify(roomTiers));

      if (imagesFiles && imagesFiles.length > 0) {
        for (let i = 0; i < imagesFiles.length; i++) {
          formData.append('images', imagesFiles[i]);
        }
      }

      if (editingRoomId) {
        // Edit update
        await api.put(`/rooms/${editingRoomId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('[CONFIRMED] Architectural details updated.');
      } else {
        // Create new
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

  // --- CRUD Actions from Listings Tab ---
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

  const handleDuplicateListing = async (room) => {
    try {
      const duplicatedData = {
        title: `${room.title} (DUPLICATE)`,
        description: room.description,
        location: room.location,
        basePrice: room.basePrice,
        architecturalStyle: room.architecturalStyle,
        quietnessLevel: room.quietnessLevel,
        workplaceProfile: room.workplaceProfile,
        amenities: room.amenities,
        locationCoordinates: room.locationCoordinates,
        roomTiers: room.roomTiers,
        status: 'pending', // Seed duplicated stays as pending
      };

      await api.post('/rooms', duplicatedData);
      setSuccess('[DUPLICATE] Listing cloned successfully.');
      fetchDashboardData();
    } catch (err) {
      err.message = `[DUPLICATE_ERROR] Failed to duplicate listing: ${err.message}`;
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
      alert("Dismantling aborted. Title mismatch.");
    }
  };

  // --- Help Tab FAQ and Support Ticket ---
  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportName || !supportEmail || !supportMessage) {
      alert("Please fill all mandatory fields.");
      return;
    }
    setSupportSuccess(true);
    setSupportName('');
    setSupportEmail('');
    setSupportMessage('');
    setTimeout(() => setSupportSuccess(false), 5000);
  };

  // --- Live Chat Logic ---
  const handleSendChatMessage = () => {
    if (!newChatMessage.trim()) return;
    const userMsg = { sender: 'user', text: newChatMessage };
    setChatMessages(prev => [...prev, userMsg]);
    setNewChatMessage('');

    setTimeout(() => {
      let reply = "Support Agent: I've logged this request with your partner account details. We will respond via email shortly.";
      if (newChatMessage.toLowerCase().includes('map') || newChatMessage.toLowerCase().includes('location')) {
        reply = "Support Agent: To set up geolocation, pick coordinates directly from Leaflet, type search area, and hit 'Save Location'.";
      } else if (newChatMessage.toLowerCase().includes('price') || newChatMessage.toLowerCase().includes('tier')) {
        reply = "Support Agent: Double click a room tier box inside Step 2 grid constructor to customize rates and toggle available services.";
      }
      setChatMessages(prev => [...prev, { sender: 'agent', text: reply }]);
    }, 1000);
  };

  // Calculations for Metrics
  const totalReviews = rooms.reduce((sum, r) => sum + (r.reviewsCount || 0), 0);
  const avgRating = rooms.length > 0
    ? (rooms.reduce((sum, r) => sum + (r.rating || 0), 0) / rooms.length).toFixed(2)
    : '0.00';

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
            <button onClick={() => setSuccess('')} className="text-white bg-transparent border-0 cursor-pointer font-bold"><X size={14} /></button>
          </div>
        )}

        {/* SECTION A: MAIN DASHBOARD TABS VIEW */}
        {!isEditing ? (
          <>
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[#212121] pb-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="terracotta">[ STAGE: PORTFOLIO OPERATION ]</Badge>
                  {user?.vendorLocation?.address && (
                    <span className="font-mono text-xs text-[#212121]/70 flex items-center gap-1 font-bold">
                      <MapPin size={12} className="text-[#C84B31]" />
                      HQ: {user.vendorLocation.address.split(',')[0]}
                    </span>
                  )}
                </div>
                <h1 className="font-mono text-3xl sm:text-5xl font-bold uppercase tracking-tight text-[#212121]">
                  VENDORS ARCHITECTURAL HUBS
                </h1>
              </div>
              <div>
                <Button variant="primary" size="lg" onClick={handleOpenCreateFlow} className="w-full md:w-auto uppercase shadow-[4px_4px_0px_#212121]">
                  <Plus size={16} />
                  <span>PUBLISH NEW STAY</span>
                </Button>
              </div>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="p-4 bg-white border-2 border-[#212121] shadow-[3px_3px_0px_#212121]">
                <span className="font-mono text-xs text-[#212121]/60 block font-bold">[ PORTFOLIO PROPERTIES ]</span>
                <span className="font-mono text-3xl font-bold text-[#212121]">{rooms.length} Units</span>
              </Card>
              <Card className="p-4 bg-white border-2 border-[#212121] shadow-[3px_3px_0px_#212121]">
                <span className="font-mono text-xs text-[#212121]/60 block font-bold">[ OVERALL RATING FEEDBACK ]</span>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="text-[#C84B31] fill-[#C84B31]" size={20} />
                  <span className="font-mono text-3xl font-bold text-[#212121]">{avgRating}</span>
                </div>
              </Card>
              <Card className="p-4 bg-white border-2 border-[#212121] shadow-[3px_3px_0px_#212121]">
                <span className="font-mono text-xs text-[#212121]/60 block font-bold">[ TOTAL BOOKINGS INVOICES ]</span>
                <span className="font-mono text-3xl font-bold text-[#212121]">{bookings.length} Orders</span>
              </Card>
            </div>

            {/* Render Tab Contents */}
            {loading ? (
              <div className="text-center py-16 font-mono text-xs uppercase text-[#212121]/50">
                Syncing client indices with remote staywise records...
              </div>
            ) : (
              <>
                {/* 1. MANAGE BOOKINGS TAB */}
                {activeTab === 'bookings' && (
                  <div className="space-y-4">
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#212121]">[ INCOMING GUEST BOOKINGS ]</h2>
                    {bookings.length === 0 ? (
                      <div className="border-2 border-dashed border-[#212121]/30 p-12 text-center bg-white space-y-2">
                        <div className="font-mono text-sm font-bold text-[#212121]">[ NO ACTIVE INCOMING RESERVATIONS ]</div>
                        <p className="font-sans text-xs text-[#212121]/60 max-w-sm mx-auto">
                          Guest booking logs will populate here once active travelers finalize reservations at your modernist stays.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <Card key={booking._id} className="p-4 bg-white border-2 border-[#212121] shadow-[4px_4px_0px_#212121] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="space-y-1">
                              <span className="font-mono text-[9px] uppercase font-bold text-[#C84B31] border border-[#C84B31] px-1 bg-[#C84B31]/5">
                                ORDER: {booking._id.substring(12).toUpperCase()}
                              </span>
                              <h4 className="font-mono text-sm font-bold text-[#212121]">{booking.room?.title}</h4>
                              <div className="flex items-center gap-3 text-[10px] text-[#212121]/70 font-semibold font-sans">
                                <span className="flex items-center gap-1"><User size={10} /> {booking.guest?.name} ({booking.guest?.email})</span>
                                <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}</span>
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
                )}

                {/* 2. LISTINGS TAB */}
                {activeTab === 'listings' && (
                  <div className="space-y-4">
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#212121]">[ YOUR PUBLISHED modernist STAYS ]</h2>
                    {rooms.length === 0 ? (
                      <div className="border-2 border-dashed border-[#212121]/30 p-12 text-center bg-white space-y-2">
                        <div className="font-mono text-sm font-bold text-[#212121]">[ PORTFOLIO IS EMPTY ]</div>
                        <p className="font-sans text-xs text-[#212121]/60 max-w-sm mx-auto">
                          You haven't listed any concrete lofts yet. Start setting up your geolocation.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {rooms.map((room) => (
                          <Card key={room._id} className="p-0 flex flex-col justify-between overflow-hidden bg-white border-2 border-[#212121] shadow-[5px_5px_0px_#212121] relative">
                            {/* Status Badge in corner */}
                            <div className="absolute top-3 right-3 z-10 flex gap-2">
                              <Badge variant={room.status === 'active' ? 'success' : 'default'}>
                                {room.status?.toUpperCase() || 'ACTIVE'}
                              </Badge>
                              <Badge variant="terracotta">{room.architecturalStyle}</Badge>
                            </div>

                            <div>
                              {/* Geo-pin map preview or thumbnail */}
                              {room.locationCoordinates?.coordinates ? (
                                <MiniMap 
                                  lat={room.locationCoordinates.coordinates[1]} 
                                  lng={room.locationCoordinates.coordinates[0]} 
                                />
                              ) : (
                                <div className="w-full h-36 bg-stone-200 border-b-2 border-[#212121] flex items-center justify-center font-mono text-[10px] text-stone-500 uppercase font-bold">[ No location map set ]</div>
                              )}

                              <div className="p-5 space-y-2 font-mono">
                                <div className="flex items-center gap-1 text-xs text-[#C84B31] font-bold">
                                  <MapPin size={12} />
                                  <span className="truncate max-w-[90%]">{room.location}</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#212121] uppercase tracking-wide truncate">{room.title}</h3>
                                <p className="font-sans text-xs text-[#212121]/70 line-clamp-2">{room.description}</p>
                                
                                <div className="pt-2 flex items-center gap-4 text-[10px] text-[#212121]/60 font-bold uppercase">
                                  <span>[ Tiers: {room.roomTiers?.length || 0} ]</span>
                                  <span>[ Feedback: {room.rating} ★ ]</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions footer */}
                            <div className="px-5 py-4 border-t border-[#212121] flex items-center justify-between bg-[#F1EDEA]/30">
                              <div>
                                <span className="text-[9px] uppercase font-bold text-[#212121]/50 block">FROM BASE PRICE</span>
                                <span className="text-lg font-bold text-[#212121]">${room.basePrice}</span>
                                <span className="text-[10px] text-[#212121]/60 uppercase">/ night</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleToggleStatus(room)}
                                  title={room.status === 'paused' ? 'Activate Listing' : 'Pause Listing'}
                                >
                                  {room.status === 'paused' ? <Play size={12} className="text-emerald-800" /> : <Pause size={12} className="text-amber-800" />}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleDuplicateListing(room)}
                                  title="Duplicate Listing"
                                >
                                  <Copy size={12} />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleOpenEditFlow(room)}
                                  title="Edit Listing Details"
                                >
                                  <Edit3 size={12} />
                                </Button>
                                <Button 
                                  variant="primary" 
                                  size="sm" 
                                  onClick={() => handleDeleteListingWithCheck(room)}
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
                )}

                {/* 3. HELP TAB Accordion FAQ */}
                {activeTab === 'help' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* FAQ Area */}
                    <div className="lg:col-span-2 space-y-6">
                      <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#212121]">[ FREQUENTLY ASKED BUSINESS INQUIRIES ]</h2>
                      <div className="space-y-4">
                        {[
                          {
                            cat: 'Getting started',
                            q: 'How do I onboard a new architectural property listing?',
                            a: 'Click "Publish New Stay" in the dashboard header. You will proceed through our step 1 Geolocation setup, pinpointing coordinates on Leaflet, and then transition to our 4x4 Grid room tiers config constructor.'
                          },
                          {
                            cat: 'Managing bookings',
                            q: 'How does StayWise guarantee booking dates concurrency locks?',
                            a: 'We implement stateless high-concurrency Redis locking. When a guest attempts a checkout, the slot locks for 15 minutes. During this period, other users cannot book the same room dates.'
                          },
                          {
                            cat: 'Pricing & services',
                            q: 'Can I add customized services like dining plans or airport pickup?',
                            a: 'Yes. In Step 2 of property creation, you can place multiple room tiers on the grid cells. Double click any room tier to toggle 11 separate customizable addon services and specify pricing structure.'
                          },
                          {
                            cat: 'Geo-location setup',
                            q: 'Why is it critical to input coordinates and address precisely?',
                            a: 'StayWise relies on vector and geographical proximity indexing. Travel searches locate architecture within certain radii, and static previews render the map markers using this coordinate metadata.'
                          },
                          {
                            cat: 'Account & billing',
                            q: 'Where do guest payout fees route to?',
                            a: 'All booking payments flow through Stripe. Verify your Stripe merchant id route under the profile settings slide-out panel to enable smooth processing of payout accounts.'
                          }
                        ].map((faq, idx) => (
                          <details key={idx} className="group border-2 border-[#212121] bg-white p-4 shadow-[2px_2px_0px_#212121] font-mono text-xs">
                            <summary className="font-bold flex items-center justify-between cursor-pointer list-none select-none">
                              <div className="space-y-0.5">
                                <span className="text-[9px] text-[#C84B31] uppercase tracking-wider font-bold">[{faq.cat}]</span>
                                <h4 className="text-xs font-bold text-[#212121]">{faq.q}</h4>
                              </div>
                              <ChevronDown size={14} className="group-open:rotate-180 transition-transform duration-200" />
                            </summary>
                            <p className="font-sans text-xs text-[#212121]/70 mt-3 border-t border-[#212121]/10 pt-2 leading-relaxed">
                              {faq.a}
                            </p>
                          </details>
                        ))}
                      </div>
                    </div>

                    {/* Support Form Queue */}
                    <div className="space-y-4">
                      <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#212121]">[ CONTACT CONSOLE SUPPORT ]</h2>
                      <Card className="bg-white border-2 border-[#212121] p-4 shadow-[3px_3px_0px_#212121] font-mono text-xs">
                        {supportSuccess ? (
                          <div className="text-center py-8 space-y-2 text-emerald-800 font-bold">
                            <Check size={32} className="mx-auto" />
                            <span>TICKET LOGGED IN BUSINESS QUEUE</span>
                            <p className="text-[10px] font-sans text-stone-500">We will evaluate your ticket within 2 business hours.</p>
                          </div>
                        ) : (
                          <form onSubmit={handleSupportSubmit} className="space-y-3">
                            <div className="space-y-1">
                              <label className="font-bold block">PARTNER NAME</label>
                              <input 
                                type="text" 
                                required
                                value={supportName}
                                onChange={(e) => setSupportName(e.target.value)}
                                placeholder={user?.name || "Vendor Name"} 
                                className="w-full bg-[#F1EDEA]/50 border-2 border-[#212121] p-2 outline-none font-sans text-xs" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold block">REPLY EMAIL</label>
                              <input 
                                type="email" 
                                required
                                value={supportEmail}
                                onChange={(e) => setSupportEmail(e.target.value)}
                                placeholder={user?.email || "vendor@staywise.ai"} 
                                className="w-full bg-[#F1EDEA]/50 border-2 border-[#212121] p-2 outline-none font-sans text-xs" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold block">ASSOCIATED LISTING</label>
                              <select 
                                value={supportRoomId}
                                onChange={(e) => setSupportRoomId(e.target.value)}
                                className="w-full bg-white border-2 border-[#212121] p-2 outline-none"
                              >
                                <option value="">None / General Inquiry</option>
                                {rooms.map(r => (
                                  <option key={r._id} value={r._id}>{r.title.substring(0, 20)}...</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold block">ISSUE CATEGORY</label>
                              <select 
                                value={supportCategory}
                                onChange={(e) => setSupportCategory(e.target.value)}
                                className="w-full bg-white border-2 border-[#212121] p-2 outline-none"
                              >
                                <option value="Getting started">Getting started</option>
                                <option value="Managing bookings">Managing bookings</option>
                                <option value="Pricing & services">Pricing & services</option>
                                <option value="Geo-location setup">Geo-location setup</option>
                                <option value="Account & billing">Account & billing</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold block">NARRATIVE CASE DESCRIPTION</label>
                              <textarea 
                                rows={3}
                                required
                                value={supportMessage}
                                onChange={(e) => setSupportMessage(e.target.value)}
                                placeholder="Describe the dashboard error or spatial mapping coordinates discrepancy..."
                                className="w-full bg-[#F1EDEA]/50 border-2 border-[#212121] p-2 outline-none font-sans text-xs resize-none"
                              />
                            </div>
                            <button 
                              type="submit"
                              className="w-full bg-[#212121] hover:bg-[#C84B31] text-white font-bold p-2 border-2 border-[#212121] shadow-[2px_2px_0px_#212121] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all uppercase cursor-pointer text-center"
                            >
                              SUBMIT TICKET
                            </button>
                          </form>
                        )}
                      </Card>
                    </div>

                  </div>
                )}
              </>
            )}
          </>
        ) : (
          // SECTION B: MULTI-STEP CREATION FLOW VIEW
          <div className="font-mono text-xs text-[#212121] space-y-6">
            
            {/* Onboarding Flow Header */}
            <div className="border-b-2 border-[#212121] pb-4 flex justify-between items-end">
              <div className="space-y-1">
                <Badge variant="terracotta">[ ONBOARDING PIPELINE STEP {editStep} / 2 ]</Badge>
                <h1 className="text-2xl font-bold uppercase">{editingRoomId ? 'EDIT SUITE REGISTRY' : 'ESTABLISH NEW ARCHITECTURAL STAY'}</h1>
              </div>
              <button 
                onClick={() => { if (window.confirm("Abort current onboarding progress?")) setIsEditing(false); }}
                className="bg-white hover:bg-[#C84B31] hover:text-white border-2 border-[#212121] px-3 py-1 font-bold shadow-[2px_2px_0px_#212121]"
              >
                CANCEL SETUP
              </button>
            </div>

            {/* STEP 1: GEOLOCATION & STAY INFO DETAILS */}
            {editStep === 1 && (
              <div id="geolocation-container" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* Form fields */}
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
                        <option value="Raw Terracotta & Stone">Raw Terracotta & Stone</option>
                        <option value="Japanese Modern & Cedar">Japanese Modern & Cedar</option>
                        <option value="Cast-Iron Brutalism">Cast-Iron Brutalism</option>
                        <option value="Volcanic Basalt & Glass">Volcanic Basalt & Glass</option>
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
                          <div key={idx}>• {file.name} ({Math.round(file.size / 1024)} KB)</div>
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

                {/* Map picker */}
                <div className="space-y-4">
                  <div className="border-2 border-[#212121] p-4 bg-white shadow-[4px_4px_0px_#212121] space-y-3">
                    <label className="font-bold uppercase text-[#212121] block">[ MAP LOCATION PINPOINT PICKER ]</label>
                    
                    {/* Map Search input */}
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

                    {/* Leaflet container ref */}
                    <div ref={mapRef} className="w-full h-80 border-2 border-[#212121] relative z-10" />

                    <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-[#212121]/70 pt-1">
                      <div>LATITUDE: {lat}</div>
                      <div>LONGITUDE: {lng}</div>
                    </div>

                    <div className="border-t border-[#212121]/10 pt-2 flex items-center justify-between gap-4">
                      <div className="flex-grow font-sans text-[11px] font-semibold text-[#212121]/80 max-w-[65%] truncate">
                        {address || "[ Address not saved yet ]"}
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveLocation}
                        disabled={locationSaving}
                        className={`px-4 py-2 border-2 border-[#212121] font-bold shadow-[2px_2px_0px_#212121] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all uppercase cursor-pointer ${isLocationSaved ? 'bg-emerald-800 text-white' : 'bg-[#C84B31] text-white'}`}
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

            {/* STEP 2: ROOM GRID CONSTRUCTOR */}
            {editStep === 2 && (
              <div id="grid-editor-container" className="space-y-6">
                
                <div className="bg-[#212121] text-white p-4 border-2 border-[#212121] shadow-[4px_4px_0px_#212121] space-y-1">
                  <h3 className="font-bold uppercase tracking-wider text-amber-500">[ 4x4 STRUCTURE ROOM TIERS MATRIX ]</h3>
                  <p className="font-sans text-[11px] leading-relaxed text-stone-300">
                    Click any empty cell block below to define a new suite tier. Double-click a placed room tier box to configure pricing, availability date window, and 11 distinct extra services. Drag and drop any room tier box to reposition or reorder them.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  
                  {/* The Grid Constructor Layout */}
                  <div className="lg:col-span-2 bg-[#EAE5E0] border-2 border-[#212121] p-6 shadow-[5px_5px_0px_#212121] select-none">
                    <div className="grid grid-cols-4 gap-4 aspect-square">
                      {Array.from({ length: 16 }).map((_, idx) => {
                        const row = Math.floor(idx / 4);
                        const col = idx % 4;
                        
                        // Find if there is a tier in this position
                        const tierIndex = roomTiers.findIndex(t => t.gridPosition?.row === row && t.gridPosition?.col === col);
                        const tier = tierIndex !== -1 ? roomTiers[tierIndex] : null;

                        return (
                          <div
                            key={idx}
                            onDragOver={(e) => handleDragOver(e, row, col)}
                            onDrop={(e) => handleDrop(e, row, col)}
                            onClick={() => handleCellClick(row, col)}
                            className={`border-2 border-dashed aspect-square flex flex-col items-center justify-center p-1 transition-all relative cursor-pointer ${tier ? 'bg-white border-[#212121] shadow-[2px_2px_0px_#212121]' : 'border-stone-400 hover:border-[#212121] hover:bg-stone-300/30'}`}
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
                                    src={tier.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'} 
                                    alt={tier.tierName} 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                                <div className="flex-grow flex flex-col justify-end">
                                  <span className="font-bold text-[9px] uppercase truncate block leading-tight text-[#212121]">{tier.tierName}</span>
                                  <span className="font-mono text-[9px] font-bold text-[#C84B31]">${tier.basePrice}/N</span>
                                </div>
                                <div className="absolute inset-0 bg-[#212121]/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <span className="text-[9px] text-white font-bold text-center uppercase">DBL-CLK TO EDIT</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-stone-500 font-bold uppercase">[ + ADD ]</span>
                            )}
                            <div className="absolute bottom-1 right-1 text-[8px] text-[#212121]/30 font-bold">R{row}C{col}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sidebar Info & Tiers List */}
                  <div className="space-y-4">
                    <div className="border-2 border-[#212121] p-4 bg-white shadow-[3px_3px_0px_#212121] space-y-3">
                      <h4 className="font-bold uppercase border-b border-[#212121] pb-1">[ ESTABLISHED TIERS LIST ]</h4>
                      {roomTiers.length === 0 ? (
                        <p className="text-[10px] text-[#212121]/50 font-bold">No active tiers. Click a cell inside the grid to create one.</p>
                      ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {roomTiers.map((t, index) => (
                            <div 
                              key={t.id} 
                              onDoubleClick={() => handleOpenTierEditor(t)}
                              className="border border-[#212121] p-2 bg-[#F1EDEA]/30 flex justify-between items-center group cursor-pointer hover:bg-slate-50"
                            >
                              <div>
                                <span className="font-bold block uppercase text-[10px] text-[#212121]">{t.tierName}</span>
                                <span className="font-mono text-[9px] text-[#C84B31]">${t.basePrice} per night</span>
                              </div>
                              <span className="text-[8px] text-[#212121]/40 group-hover:text-[#212121] font-bold">POS: R{t.gridPosition.row}-C{t.gridPosition.col} ✎</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" size="lg" type="button" onClick={handleBackToStep1} className="w-1/2 shadow-[2px_2px_0px_#212121]">
                        STEP 1 INFO
                      </Button>
                      <Button variant="primary" size="lg" type="button" onClick={handleSaveSetup} className="w-1/2 bg-[#C84B31] text-white border-2 border-[#212121] shadow-[2px_2px_0px_#212121] font-bold">
                        SAVE SETUP
                      </Button>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* --- INLINE ROOM TIER CONFIGURATION MODAL --- */}
      {showTierModal && selectedTierForEdit && (
        <div className="fixed inset-0 z-50 bg-[#212121]/80 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-xl bg-[#F1EDEA] border-3 border-[#212121] shadow-[8px_8px_0px_#212121] max-h-[85vh] flex flex-col p-0 font-mono text-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-[#212121] p-4 bg-[#212121] text-white">
              <h3 className="font-bold uppercase tracking-wider">[ EDIT TIER CONFIGURATION ]</h3>
              <button 
                onClick={() => { setShowTierModal(false); setSelectedTierForEdit(null); }}
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
                    value={selectedTierForEdit.tierName}
                    onChange={(e) => setSelectedTierForEdit({ ...selectedTierForEdit, tierName: e.target.value })}
                    className="w-full bg-white border-2 border-[#212121] p-2 outline-none font-sans text-xs" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold block">BASE NIGHTLY RATE ($)</label>
                  <input 
                    type="number" 
                    value={selectedTierForEdit.basePrice}
                    onChange={(e) => setSelectedTierForEdit({ ...selectedTierForEdit, basePrice: Number(e.target.value) })}
                    className="w-full bg-white border-2 border-[#212121] p-2 outline-none font-sans text-xs" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold block">COVER IMAGE URL</label>
                <input 
                  type="text" 
                  value={selectedTierForEdit.coverImage}
                  onChange={(e) => setSelectedTierForEdit({ ...selectedTierForEdit, coverImage: e.target.value })}
                  className="w-full bg-white border-2 border-[#212121] p-2 outline-none font-sans text-xs" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold block">AVAILABILITY START</label>
                  <input 
                    type="date" 
                    value={selectedTierForEdit.availabilityDates?.start ? selectedTierForEdit.availabilityDates.start.substring(0, 10) : ''}
                    onChange={(e) => setSelectedTierForEdit({
                      ...selectedTierForEdit,
                      availabilityDates: { ...selectedTierForEdit.availabilityDates, start: e.target.value }
                    })}
                    className="w-full bg-white border-2 border-[#212121] p-2 outline-none font-sans text-xs" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold block">AVAILABILITY END</label>
                  <input 
                    type="date" 
                    value={selectedTierForEdit.availabilityDates?.end ? selectedTierForEdit.availabilityDates.end.substring(0, 10) : ''}
                    onChange={(e) => setSelectedTierForEdit({
                      ...selectedTierForEdit,
                      availabilityDates: { ...selectedTierForEdit.availabilityDates, end: e.target.value }
                    })}
                    className="w-full bg-white border-2 border-[#212121] p-2 outline-none font-sans text-xs" 
                  />
                </div>
              </div>

              {/* SERVICES LIST EDITOR */}
              <div className="space-y-3 pt-2">
                <label className="font-bold border-b border-[#212121] pb-1 uppercase tracking-wider block text-[#C84B31]">
                  [ SERVICE CONFIGURATOR ]
                </label>
                
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {selectedTierForEdit.services.map((svc, sIdx) => (
                    <div key={svc.name} className="border border-[#212121] p-3 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold uppercase text-[10px] text-[#212121]">{svc.name}</span>
                        <input 
                          type="checkbox" 
                          checked={svc.enabled}
                          onChange={(e) => {
                            const svcs = [...selectedTierForEdit.services];
                            svcs[sIdx] = { ...svc, enabled: e.target.checked };
                            setSelectedTierForEdit({ ...selectedTierForEdit, services: svcs });
                          }}
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
                              onChange={(e) => {
                                const svcs = [...selectedTierForEdit.services];
                                svcs[sIdx] = { ...svc, price: Number(e.target.value) };
                                setSelectedTierForEdit({ ...selectedTierForEdit, services: svcs });
                              }}
                              className="w-full bg-[#F1EDEA]/50 border border-[#212121] p-1 font-sans text-[10px] outline-none" 
                            />
                          </div>
                          <div>
                            <span className="text-[8px] text-[#212121]/60 block font-bold">PRICE TYPE</span>
                            <select
                              value={svc.priceType}
                              onChange={(e) => {
                                const svcs = [...selectedTierForEdit.services];
                                svcs[sIdx] = { ...svc, priceType: e.target.value };
                                setSelectedTierForEdit({ ...selectedTierForEdit, services: svcs });
                              }}
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
                              onChange={(e) => {
                                const svcs = [...selectedTierForEdit.services];
                                svcs[sIdx] = { ...svc, description: e.target.value };
                                setSelectedTierForEdit({ ...selectedTierForEdit, services: svcs });
                              }}
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
                onClick={() => handleRemoveTier(selectedTierForEdit.id)}
                className="bg-[#C84B31] text-white hover:bg-[#b53a20] font-bold px-3 py-1.5 border-2 border-[#212121] shadow-[2px_2px_0px_#212121] cursor-pointer"
              >
                REMOVE TIER
              </button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { setShowTierModal(false); setSelectedTierForEdit(null); }}
                >
                  CANCEL
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleSaveTierDetails}
                  className="shadow-[2px_2px_0px_#212121]"
                >
                  APPLY CHANGES
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* --- FLOATING CHET WIDGET IN BOTTOM RIGHT --- */}
      <div className="fixed bottom-4 right-4 z-40 font-mono text-xs">
        {isChatOpen ? (
          <div className="w-80 h-96 bg-[#F1EDEA] border-3 border-[#212121] shadow-[5px_5px_0px_#212121] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-[#212121] text-white p-3 flex justify-between items-center border-b border-[#212121]">
              <span className="font-bold flex items-center gap-1.5 uppercase">
                <MessageSquare size={14} className="text-amber-500" />
                Live Business Assistance
              </span>
              <button onClick={() => setIsChatOpen(false)} className="text-white hover:text-[#C84B31] bg-transparent border-0 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            
            {/* Messages box */}
            <div className="flex-grow p-3 space-y-2 overflow-y-auto bg-white font-sans text-xs">
              {chatMessages.map((m, idx) => (
                <div key={idx} className={`max-w-[85%] p-2.5 border-2 border-[#212121] shadow-[1px_1px_0px_#212121] ${m.sender === 'user' ? 'bg-[#F1EDEA] self-end ml-auto' : 'bg-stone-50'}`}>
                  {m.text}
                </div>
              ))}
            </div>

            {/* Input footer */}
            <div className="p-2 border-t-2 border-[#212121] bg-[#F1EDEA] flex gap-2">
              <input 
                type="text" 
                placeholder="Ask about maps, billing, etc..."
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage(); }}
                className="flex-grow border-2 border-[#212121] p-1.5 text-xs outline-none bg-white font-sans"
              />
              <button 
                onClick={handleSendChatMessage}
                className="bg-[#212121] hover:bg-[#C84B31] text-white border-2 border-[#212121] px-2 py-1 cursor-pointer font-bold"
              >
                SEND
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="bg-[#C84B31] hover:bg-[#b53a20] text-white border-2 border-[#212121] p-3 font-bold shadow-[3px_3px_0px_#212121] flex items-center gap-2 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none uppercase tracking-wider"
          >
            <MessageSquare size={16} />
            <span>BUSINESS CHAT</span>
          </button>
        )}
      </div>

    </div>
  );
};

export default VendorDashboardPage;
