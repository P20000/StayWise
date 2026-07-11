import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../store/slices/authSlice';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { MapPin, Search, Navigation, Check, AlertCircle } from 'lucide-react';
import api from '../services/api';

export const VendorSetupPage = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState([139.7016, 35.6580]); // [lng, lat]
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '', errorObj: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (user?.role !== 'Vendor') {
      navigate('/');
      return;
    }
    // Populate if existing
    if (user?.vendorLocation) {
      setAddress(user.vendorLocation.address || '');
      if (user.vendorLocation.coordinates) {
        setCoordinates(user.vendorLocation.coordinates);
      }
    }
  }, [user, isAuthenticated, navigate]);

  // Query OpenStreetMap Nominatim for autocomplete search
  const handleAddressSearch = async (val) => {
    setAddress(val);
    if (val.length < 3) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(val)}&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      console.error('Nominatim query error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSuggestion = (sug) => {
    setAddress(sug.display_name);
    // Nominatim coordinates are string lat, lon
    setCoordinates([parseFloat(sug.lon), parseFloat(sug.lat)]);
    setSuggestions([]);
    setStatusMessage({
      type: 'success',
      text: `Location matched via Nominatim: [${parseFloat(sug.lon).toFixed(4)}, ${parseFloat(sug.lat).toFixed(4)}]`,
      errorObj: null,
    });
  };

  // Browser HTML5 GPS Geolocation tracking
  const handleGpsAutodetect = () => {
    if (!navigator.geolocation) {
      setStatusMessage({
        type: 'error',
        text: 'Geolocation is not supported by your browser.',
        errorObj: new Error('Geolocation unsupported.'),
      });
      return;
    }
    setGpsLoading(true);
    setStatusMessage({ type: '', text: '', errorObj: null });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates([longitude, latitude]);

        // Attempt reverse geocoding to retrieve address name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(`GPS Coordinates: [${longitude.toFixed(4)}, ${latitude.toFixed(4)}]`);
          }
        } catch (err) {
          setAddress(`GPS Coordinates: [${longitude.toFixed(4)}, ${latitude.toFixed(4)}]`);
        }

        setGpsLoading(false);
        setStatusMessage({
          type: 'success',
          text: `Direct GPS tracking completed: [${longitude.toFixed(4)}, ${latitude.toFixed(4)}]`,
          errorObj: null,
        });
      },
      (error) => {
        setGpsLoading(false);
        setStatusMessage({
          type: 'error',
          text: `GPS Access Denied: ${error.message}. Please use manual search.`,
          errorObj: error,
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveSetup = async () => {
    if (!address) {
      setStatusMessage({
        type: 'error',
        text: 'Please input a business location address.',
        errorObj: new Error('Missing address input.'),
      });
      return;
    }
    setSaving(true);
    setStatusMessage({ type: '', text: '', errorObj: null });

    try {
      const response = await api.put('/users/profile', {
        vendorLocation: {
          address,
          coordinates,
        },
      });

      const updatedUser = response.data.data;
      dispatch(setUser(updatedUser));
      setStatusMessage({
        type: 'success',
        text: '[SUCCESS] Vendor Setup details committed successfully. Redirecting to Panel...',
        errorObj: null,
      });
      setTimeout(() => {
        navigate('/vendor/dashboard');
      }, 1500);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || '[SETUP_ERROR] Saving profile failed.',
        errorObj: err,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1EDEA] py-10 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="border-b-2 border-[#212121] pb-6">
          <Badge variant="terracotta" className="mb-2">
            [ VENDOR CONFIGURATION ]
          </Badge>
          <h1 className="font-mono text-3xl sm:text-5xl font-bold uppercase tracking-tight text-[#212121]">
            VENDOR LOCATION SETUP
          </h1>
          <p className="font-sans text-sm text-[#212121]/70 mt-2">
            Define your operational hub. All architectural hotel listings you publish will query distance sorting relative to this center point.
          </p>
        </div>

        {statusMessage.text && (
          statusMessage.type === 'error' ? (
            <ErrorBanner
              error={statusMessage.errorObj || statusMessage.text}
              className="mb-2 shadow-[3px_3px_0px_#212121]"
              onClose={() => setStatusMessage({ type: '', text: '', errorObj: null })}
            />
          ) : (
            <div className="border-2 border-[#212121] p-4 font-mono text-xs font-bold flex items-center gap-2 shadow-[3px_3px_0px_#212121] bg-[#F1EDEA] text-emerald-800">
              <Check size={16} />
              <span>{statusMessage.text.toUpperCase()}</span>
            </div>
          )
        )}

        <Card className="p-6 sm:p-8 space-y-6">
          {/* Geolocation autodetect */}
          <div className="border-2 border-[#212121] p-4 bg-[#212121]/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-mono text-sm font-bold text-[#212121] flex items-center gap-2">
                <Navigation size={16} className="text-[#C84B31]" />
                AUTOMATED GPS GEOLOCATION
              </h3>
              <p className="font-sans text-xs text-[#212121]/60">
                Instantly track your browser's physical coordinates using standard HTML5 navigation telemetry.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGpsAutodetect}
              disabled={gpsLoading}
              className="w-full sm:w-auto shrink-0 bg-white"
            >
              {gpsLoading ? 'RESOLVING TELEMETRY...' : 'TRACK CURRENT LOCATION'}
            </Button>
          </div>

          <div className="border-t border-[#212121]/15 pt-6 space-y-4">
            {/* Manual Search Autocomplete */}
            <div className="space-y-1 relative">
              <label className="font-mono text-xs font-bold uppercase text-[#212121] flex items-center gap-1.5">
                <Search size={14} className="text-[#C84B31]" />
                SEARCH OPERATION HUB ADDRESS
              </label>
              <input
                type="text"
                placeholder="Search matching address (e.g. Shibuya, Tokyo)"
                value={address}
                onChange={(e) => handleAddressSearch(e.target.value)}
                className="w-full bg-white border-2 border-[#212121] p-3 text-sm outline-none font-mono"
              />

              {searching && (
                <div className="absolute right-3 top-9 font-mono text-[10px] text-[#212121]/50 uppercase">
                  Searching OpenStreetMap...
                </div>
              )}

              {suggestions.length > 0 && (
                <div className="absolute z-10 left-0 right-0 bg-white border-2 border-[#212121] shadow-[4px_4px_0px_#212121] mt-1 divide-y-2 divide-[#212121] max-h-60 overflow-y-auto">
                  {suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSuggestion(sug)}
                      className="p-3 font-mono text-[11px] text-[#212121] hover:bg-[#F1EDEA] hover:text-[#C84B31] cursor-pointer transition-colors"
                    >
                      {sug.display_name.toUpperCase()}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coordinates Display Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="border-2 border-[#212121] p-3 font-mono text-xs">
                <span className="text-[#C84B31] font-bold block mb-1">[ LONGITUDE COORDINATE ]</span>
                <span className="text-sm font-bold">{coordinates[0].toFixed(6)}</span>
              </div>
              <div className="border-2 border-[#212121] p-3 font-mono text-xs">
                <span className="text-[#C84B31] font-bold block mb-1">[ LATITUDE COORDINATE ]</span>
                <span className="text-sm font-bold">{coordinates[1].toFixed(6)}</span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-[#212121] pt-6 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSaveSetup}
              disabled={saving}
              className="w-full sm:w-auto px-12"
            >
              {saving ? 'SAVING HUB METADATA...' : 'SAVE & SECURE HUB'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VendorSetupPage;
