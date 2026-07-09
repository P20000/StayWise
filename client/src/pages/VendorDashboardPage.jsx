import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Plus, Edit3, Trash2, Star, MapPin, Eye, X, Upload } from 'lucide-react';
import api from '../services/api';

export const VendorDashboardPage = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [currentRoomId, setCurrentRoomId] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [basePrice, setBasePrice] = useState(250);
  const [architecturalStyle, setArchitecturalStyle] = useState('Board-Formed Concrete');
  const [quietnessLevel, setQuietnessLevel] = useState('High (dB < 35 certified)');
  const [workplaceProfile, setWorkplaceProfile] = useState('Dedicated Fiber & Ergonomic Task Desk');
  const [description, setDescription] = useState('');
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [lat, setLat] = useState(35.6580);
  const [lng, setLng] = useState(139.7016);
  const [imagesFiles, setImagesFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (user?.role !== 'Vendor') {
      navigate('/');
      return;
    }
    fetchVendorRooms();
  }, [user, isAuthenticated, navigate]);

  const fetchVendorRooms = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/rooms?vendor=${user._id || user.id}`);
      setRooms(response.data.data || []);
    } catch (err) {
      setError('[DASHBOARD_ERROR] Could not fetch your listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setCurrentRoomId(null);
    setTitle('');
    setLocation(user?.vendorLocation?.address || '');
    setBasePrice(250);
    setArchitecturalStyle('Board-Formed Concrete');
    setQuietnessLevel('High (dB < 35 certified)');
    setWorkplaceProfile('Dedicated Fiber & Ergonomic Task Desk');
    setDescription('');
    setAmenitiesInput('Acoustic Double-Glazing, High-Performance Mesh Wi-Fi');
    setLng(user?.vendorLocation?.coordinates?.[0] || 139.7016);
    setLat(user?.vendorLocation?.coordinates?.[1] || 35.6580);
    setImagesFiles([]);
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room) => {
    setModalMode('edit');
    setCurrentRoomId(room._id);
    setTitle(room.title);
    setLocation(room.location);
    setBasePrice(room.basePrice);
    setArchitecturalStyle(room.architecturalStyle || '');
    setQuietnessLevel(room.quietnessLevel || '');
    setWorkplaceProfile(room.workplaceProfile || '');
    setDescription(room.description || '');
    setAmenitiesInput(room.amenities ? room.amenities.join(', ') : '');
    setLng(room.locationCoordinates?.coordinates?.[0] || 139.7016);
    setLat(room.locationCoordinates?.coordinates?.[1] || 35.6580);
    setImagesFiles([]);
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('[CONFIRMATION] Are you absolutely sure you want to dismantle and delete this suite listing?')) {
      return;
    }
    try {
      await api.delete(`/rooms/${roomId}`);
      setSuccess('[DELETED] Listing permanently removed.');
      fetchVendorRooms();
    } catch (err) {
      setError(err.response?.data?.message || '[DELETE_ERROR] Failed to delete listing.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    // Prepare Multipart Form Data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('location', location);
    formData.append('basePrice', basePrice);
    formData.append('architecturalStyle', architecturalStyle);
    formData.append('quietnessLevel', quietnessLevel);
    formData.append('workplaceProfile', workplaceProfile);
    formData.append('description', description);

    // Format coordinates
    const coords = { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] };
    formData.append('locationCoordinates', JSON.stringify(coords));

    // Format amenities
    const amenitiesArr = amenitiesInput.split(',').map((item) => item.trim()).filter(Boolean);
    formData.append('amenities', JSON.stringify(amenitiesArr));

    // Append Images files
    if (imagesFiles && imagesFiles.length > 0) {
      for (let i = 0; i < imagesFiles.length; i++) {
        formData.append('images', imagesFiles[i]);
      }
    }

    try {
      if (modalMode === 'create') {
        await api.post('/rooms', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('[SUCCESS] New architectural stay published.');
      } else {
        await api.put(`/rooms/${currentRoomId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('[SUCCESS] Architectural details updated.');
      }
      setIsModalOpen(false);
      fetchVendorRooms();
    } catch (err) {
      setError(err.response?.data?.message || '[SUBMIT_ERROR] Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalReviews = rooms.reduce((sum, r) => sum + (r.reviewsCount || 0), 0);
  const avgRating = rooms.length > 0
    ? (rooms.reduce((sum, r) => sum + (r.rating || 0), 0) / rooms.length).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen bg-[#F1EDEA] py-10 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[#212121] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="terracotta">[ VERIFIED VENDOR PORTAL ]</Badge>
              {user?.vendorLocation?.address && (
                <span className="font-mono text-xs text-[#212121]/70 flex items-center gap-1">
                  <MapPin size={12} className="text-[#C84B31]" />
                  Hub: {user.vendorLocation.address.split(',')[0]}
                </span>
              )}
            </div>
            <h1 className="font-mono text-3xl sm:text-5xl font-bold uppercase tracking-tight text-[#212121]">
              PUBLISHED ARCHITECTURAL PORTFOLIO
            </h1>
          </div>
          <div>
            <Button variant="primary" size="lg" onClick={handleOpenCreateModal} className="w-full md:w-auto">
              <Plus size={16} />
              <span>PUBLISH NEW STAY</span>
            </Button>
          </div>
        </div>

        {/* Global Messages */}
        {error && (
          <div className="bg-[#C84B31] text-white border-2 border-[#212121] p-4 font-mono text-xs font-bold shadow-[2px_2px_0px_#212121]">
            [ ERROR ]: {error.toUpperCase()}
          </div>
        )}
        {success && (
          <div className="bg-[#F1EDEA] text-emerald-800 border-2 border-[#212121] p-4 font-mono text-xs font-bold shadow-[2px_2px_0px_#212121]">
            [ CONFIRMED ]: {success.toUpperCase()}
          </div>
        )}

        {/* Portfolio metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="p-4 bg-white">
            <span className="font-mono text-xs text-[#212121]/60 block">[ VERIFIED STAYS ]</span>
            <span className="font-mono text-3xl font-bold text-[#212121]">{rooms.length}</span>
          </Card>
          <Card className="p-4 bg-white">
            <span className="font-mono text-xs text-[#212121]/60 block">[ PORTFOLIO AVERAGE FEEDBACK ]</span>
            <div className="flex items-center gap-2 mt-1">
              <Star className="text-[#C84B31] fill-[#C84B31]" size={20} />
              <span className="font-mono text-3xl font-bold text-[#212121]">{avgRating}</span>
            </div>
          </Card>
          <Card className="p-4 bg-white">
            <span className="font-mono text-xs text-[#212121]/60 block">[ GUEST ENGAGEMENT ]</span>
            <span className="font-mono text-3xl font-bold text-[#212121]">{totalReviews} Reviews</span>
          </Card>
        </div>

        {/* List of active rooms */}
        {loading ? (
          <div className="text-center py-12 font-mono text-xs uppercase text-[#212121]/50">
            Fetching verified suites database...
          </div>
        ) : rooms.length === 0 ? (
          <div className="border-2 border-dashed border-[#212121]/30 p-12 text-center bg-white space-y-4">
            <div className="font-mono text-sm font-bold text-[#212121]">
              [ PORTFOLIO IS EMPTY ]
            </div>
            <p className="font-sans text-xs text-[#212121]/60 max-w-md mx-auto">
              You haven't listed any concrete lofts or modernist suites yet. Click "Publish New Stay" to display your structures to architectural travelers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {rooms.map((room) => (
              <Card key={room._id} className="p-0 flex flex-col justify-between overflow-hidden bg-white">
                <div>
                  <div className="h-56 relative border-b-2 border-[#212121] bg-[#212121]">
                    <img
                      src={room.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                      alt={room.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="ai">{room.architecturalStyle}</Badge>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-white border border-[#212121] px-2 py-0.5 shadow-[2px_2px_0px_#212121] flex items-center gap-1 font-mono text-xs font-bold">
                      <Star size={12} className="text-[#C84B31] fill-[#C84B31]" />
                      <span>{room.rating}</span>
                      <span className="text-[#212121]/50">({room.reviewsCount})</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-1.5 font-mono text-xs uppercase text-[#C84B31] font-bold">
                      <MapPin size={14} />
                      <span>{room.location}</span>
                    </div>
                    <h3 className="font-mono text-lg font-bold text-[#212121] tracking-wide">
                      {room.title}
                    </h3>
                    <p className="font-sans text-xs text-[#212121]/70 line-clamp-2">
                      {room.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-[#212121]/15 flex items-center justify-between bg-[#F1EDEA]/30">
                  <div>
                    <span className="font-mono text-xl font-bold text-[#212121]">
                      ${room.basePrice}
                    </span>
                    <span className="font-mono text-xs text-[#212121]/60 uppercase">/ night</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/room/${room.slug}`}>
                      <Button variant="outline" size="sm" title="View details page">
                        <Eye size={14} />
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(room)} title="Edit details">
                      <Edit3 size={14} />
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleDeleteRoom(room._id)} title="Delete stay">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#212121]/80 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl bg-[#F1EDEA] border-3 border-[#212121] shadow-[8px_8px_0px_#212121] max-h-[90vh] flex flex-col p-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-[#212121] p-4 bg-[#212121] text-white">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                {modalMode === 'create' ? '[ PUBLISH NEW ARCHITECTURAL STAY ]' : '[ EDIT SUITE SPECIFICATIONS ]'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-[#C84B31] transition-colors bg-transparent border-0 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Scroll Container */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-[#212121]">STAY TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="THE CONCRETE PENTHOUSE"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border-2 border-[#212121] p-2.5 outline-none font-sans text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase text-[#212121]">BASE RATE / NIGHT ($)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full bg-white border-2 border-[#212121] p-2.5 outline-none font-sans text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-[#212121]">LOCATION ADDRESS</label>
                <input
                  type="text"
                  required
                  placeholder="Shibuya, Tokyo, Japan"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border-2 border-[#212121] p-2.5 outline-none font-sans text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-[#212121]">STYLE CATEGORY</label>
                  <select
                    value={architecturalStyle}
                    onChange={(e) => setArchitecturalStyle(e.target.value)}
                    className="w-full bg-white border-2 border-[#212121] p-2.5 outline-none text-xs"
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
                  <label className="font-bold uppercase text-[#212121]">ACOUSTIC LEVEL</label>
                  <input
                    type="text"
                    required
                    placeholder="High (dB < 32 certified)"
                    value={quietnessLevel}
                    onChange={(e) => setQuietnessLevel(e.target.value)}
                    className="w-full bg-white border-2 border-[#212121] p-2.5 outline-none font-sans text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-[#212121]">WORKPLACE AMENITIES PROFILE</label>
                <input
                  type="text"
                  required
                  placeholder="Symmetric 1 Gbps Fiber & Herman Miller seating"
                  value={workplaceProfile}
                  onChange={(e) => setWorkplaceProfile(e.target.value)}
                  className="w-full bg-white border-2 border-[#212121] p-2.5 outline-none font-sans text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-[#212121]">LONGITUDE COORDINATE</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full bg-white border-2 border-[#212121] p-2.5 outline-none font-sans text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase text-[#212121]">LATITUDE COORDINATE</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full bg-white border-2 border-[#212121] p-2.5 outline-none font-sans text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-[#212121]">MATERIAL & SERVICE AMENITIES (COMMA SEPARATED)</label>
                <input
                  type="text"
                  placeholder="Raw Concrete Walls, Rain Shower, Wi-Fi"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  className="w-full bg-white border-2 border-[#212121] p-2.5 outline-none font-sans text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-[#212121]">NARRATIVE SPECIFICATION DESCRIPTION</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed architectural specifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border-2 border-[#212121] p-2.5 outline-none font-sans text-xs resize-none"
                />
              </div>

              <div className="space-y-2 border-2 border-[#212121] p-3 bg-white">
                <label className="font-bold uppercase text-[#212121] flex items-center gap-1.5 cursor-pointer">
                  <Upload size={16} className="text-[#C84B31]" />
                  <span>UPLOAD PHOTOS (MAX 5 FILES)</span>
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
                {modalMode === 'edit' && (
                  <span className="text-[10px] text-[#212121]/50 block uppercase font-bold mt-1">
                    * Leave empty to retain current active photos.
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t-2 border-[#212121] pt-4 flex justify-end gap-3">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  CANCEL
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'PROCESSING REGISTRY...' : 'PUBLISH SUITE CONFIG'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VendorDashboardPage;
