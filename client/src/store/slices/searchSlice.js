import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  location: '',
  checkIn: '',
  checkOut: '',
  guests: 1,
  priceRange: [0, 5000],
  amenities: [],
  sortBy: 'recommended', // 'recommended', 'price_asc', 'price_desc', 'rating'
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchFilters: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetSearchFilters: () => initialState,
  },
});

export const { setSearchFilters, resetSearchFilters } = searchSlice.actions;
export default searchSlice.reducer;
