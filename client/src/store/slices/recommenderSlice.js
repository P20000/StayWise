import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  preferences: {
    architecturalStyle: 'Modern Brutalist',
    quietnessLevel: 'High',
    workFriendly: true,
  },
  matchScore: 94,
  recommendedRooms: [],
  loading: false,
};

export const recommenderSlice = createSlice({
  name: 'recommender',
  initialState,
  reducers: {
    setPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setMatchScore: (state, action) => {
      state.matchScore = action.payload;
    },
    setRecommendedRooms: (state, action) => {
      state.recommendedRooms = action.payload;
      state.loading = false;
    },
    setRecommenderLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setPreferences,
  setMatchScore,
  setRecommendedRooms,
  setRecommenderLoading,
} = recommenderSlice.actions;
export default recommenderSlice.reducer;
