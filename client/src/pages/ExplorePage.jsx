import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { SearchBar } from '../components/search/SearchBar';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Star, MapPin, Navigation, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const ExplorePage = () => {
  const filters = useSelector((state) => state.search);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [filters, gpsCoords]);

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.location) params.location = filters.location;
      if (filters.priceRange) {
        params.minPrice = filters.priceRange[0];
        params.maxPrice = filters.priceRange[1];
      }
      if (gpsCoords) {
        params.latitude = gpsCoords.latitude;
        params.longitude = gpsCoords.longitude;
      }

      const response = await api.get('/rooms', { params });
      let data = response.data.data || [];

      // Apply client-side sorting based on filters.sortBy
      if (filters.sortBy === 'price_asc') {
        data = [...data].sort((a, b) => a.basePrice - b.basePrice);
      } else if (filters.sortBy === 'price_desc') {
        data = [...data].sort((a, b) => b.basePrice - a.basePrice);
      } else if (filters.sortBy === 'rating') {
        data = [...data].sort((a, b) => b.rating - a.rating);
      }

      setRooms(data);
    } catch (err) {
      setError('[DIRECTORY_ERROR] Failed to fetch architectural listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleFindNearest = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGpsLoading(false);
      },
      (err) => {
        console.error('GPS error:', err);
        alert(`Failed to track location: ${err.message}`);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleClearGps = () => {
    setGpsCoords(null);
  };

  return (
    <div className="min-h-screen bg-[#F1EDEA] py-10 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Header & Active SearchBar */}
        <div className="space-y-6 border-b-2 border-[#212121] pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <Badge variant="terracotta" className="mb-2">
                Listings
              </Badge>
              <h1 className="font-mono text-3xl sm:text-5xl font-bold uppercase tracking-tight text-[#212121]">
                EXPLORE STAYS
              </h1>
              <p className="font-sans text-sm text-[#212121]/70 mt-2">
                {rooms.length} properties available. Browse and book your perfect stay.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              {gpsCoords ? (
                <Button variant="outline" size="sm" onClick={handleClearGps} className="bg-white">
                  Clear Location
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleFindNearest} disabled={gpsLoading} className="bg-white">
                  <Navigation size={12} className="text-[#C84B31]" />
                  <span>{gpsLoading ? 'Locating...' : 'Find Nearest Stays'}</span>
                </Button>
              )}
            </div>
          </div>
          <SearchBar />
        </div>

        {error && (
          <div className="bg-[#C84B31] text-white border-2 border-[#212121] p-4 font-mono text-xs font-bold shadow-[2px_2px_0px_#212121]">
            {error.toUpperCase()}
          </div>
        )}

        {/* Results Grid */}
        {loading ? (
          <div className="font-mono text-xs text-center py-20 uppercase text-[#212121]/50">
            Loading available stays...
          </div>
        ) : rooms.length === 0 ? (
          <div className="border-2 border-dashed border-[#212121]/30 p-12 text-center bg-white space-y-4">
            <div className="font-mono text-sm font-bold text-[#212121] flex items-center justify-center gap-2">
              <AlertCircle size={16} className="text-[#C84B31]" />
              <span>No Stays Found</span>
            </div>
            <p className="font-sans text-xs text-[#212121]/60 max-w-md mx-auto">
              We couldn't find any properties matching your search. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rooms.map((suite) => (
              <Card key={suite._id || suite.id} hoverEffect className="flex flex-col justify-between p-0 bg-white">
                <div>
                  <div className="relative w-full h-56 border-b-2 border-[#212121] overflow-hidden bg-[#212121]">
                    <img
                      src={suite.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                      alt={suite.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="ai">{suite.architecturalStyle}</Badge>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-white border border-[#212121] px-2 py-0.5 shadow-[2px_2px_0px_#212121] flex items-center gap-1 font-mono text-xs font-bold">
                      <Star size={12} className="text-[#C84B31] fill-[#C84B31]" />
                      <span>{suite.rating}</span>
                      <span className="text-[#212121]/50">({suite.reviewsCount})</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-1.5 font-mono text-xs uppercase text-[#C84B31] font-bold mb-1">
                      <MapPin size={14} />
                      <span>{suite.location}</span>
                    </div>
                    <h3 className="font-mono text-lg font-bold text-[#212121] tracking-wide mb-3">
                      {suite.title}
                    </h3>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-[#212121]/15 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xl font-bold text-[#212121]">
                      ${suite.basePrice}
                    </span>
                    <span className="font-mono text-xs text-[#212121]/60 uppercase">
                      {' '}/ night
                    </span>
                  </div>
                  <Link to={`/room/${suite.slug}`}>
                    <Button variant="primary" size="sm">
                      RESERVE
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
