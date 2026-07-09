import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchFilters } from '../../store/slices/searchSlice';
import { Button } from '../common/Button';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

export const SearchBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentFilters = useSelector((state) => state.search);

  const [location, setLocation] = useState(currentFilters.location || '');
  const [checkIn, setCheckIn] = useState(currentFilters.checkIn || '');
  const [checkOut, setCheckOut] = useState(currentFilters.checkOut || '');
  const [guests, setGuests] = useState(currentFilters.guests || 1);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(
      setSearchFilters({
        location,
        checkIn,
        checkOut,
        guests: Number(guests),
      })
    );
    navigate('/explore');
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white border-3 border-[#212121] shadow-[6px_6px_0px_#212121] p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full select-none"
    >
      {/* Location Input */}
      <div className="flex-1 flex flex-col gap-1 border-b md:border-b-0 md:border-r-2 border-[#212121]/20 pb-3 md:pb-0 md:pr-4">
        <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#C84B31] flex items-center gap-1.5">
          <MapPin size={14} />
          <span>[ DESTINATION ]</span>
        </label>
        <input
          type="text"
          placeholder="Tokyo, Berlin, New York..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="font-mono text-sm uppercase text-[#212121] bg-transparent outline-none placeholder:text-[#212121]/40 w-full font-semibold"
        />
      </div>

      {/* Check-In Date */}
      <div className="flex flex-col gap-1 border-b md:border-b-0 md:border-r-2 border-[#212121]/20 pb-3 md:pb-0 md:pr-4">
        <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#212121] flex items-center gap-1.5">
          <Calendar size={14} />
          <span>[ ARRIVAL ]</span>
        </label>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="font-mono text-xs uppercase text-[#212121] bg-transparent outline-none cursor-pointer"
        />
      </div>

      {/* Check-Out Date */}
      <div className="flex flex-col gap-1 border-b md:border-b-0 md:border-r-2 border-[#212121]/20 pb-3 md:pb-0 md:pr-4">
        <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#212121] flex items-center gap-1.5">
          <Calendar size={14} />
          <span>[ DEPARTURE ]</span>
        </label>
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="font-mono text-xs uppercase text-[#212121] bg-transparent outline-none cursor-pointer"
        />
      </div>

      {/* Guests */}
      <div className="flex flex-col gap-1 pb-2 md:pb-0 md:pr-2">
        <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#212121] flex items-center gap-1.5">
          <Users size={14} />
          <span>[ GUESTS ]</span>
        </label>
        <select
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="font-mono text-xs uppercase text-[#212121] bg-transparent outline-none cursor-pointer font-bold"
        >
          <option value={1}>1 Guest</option>
          <option value={2}>2 Guests</option>
          <option value={3}>3 Guests</option>
          <option value={4}>4+ Guests</option>
        </select>
      </div>

      {/* Search Button — Exclusively Terracotta #C84B31 per conversion rule */}
      <div className="pt-2 md:pt-0">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full md:w-auto px-8"
        >
          <Search size={16} />
          <span>FIND SUITES</span>
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
