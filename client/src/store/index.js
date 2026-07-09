import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import searchReducer from './slices/searchSlice';
import recommenderReducer from './slices/recommenderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    search: searchReducer,
    recommender: recommenderReducer,
  },
  devTools: import.meta.env.MODE !== 'production',
});
