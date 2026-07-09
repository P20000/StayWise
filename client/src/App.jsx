import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from './store/slices/authSlice';
import api from './services/api';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import { RoomDetailsPage } from './pages/RoomDetailsPage';
import { AuthPage } from './pages/AuthPage';
import { VendorSetupPage } from './pages/VendorSetupPage';
import { VendorDashboardPage } from './pages/VendorDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AIPicksPage } from './pages/AIPicksPage';

export const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get('/auth/me');
        const userData = response.data.user || response.data.data;
        dispatch(setUser(userData));
      } catch (err) {
        // Safe to ignore if not logged in
        dispatch(setUser(null));
      }
    };
    checkSession();
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F1EDEA] text-[#212121]">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/recommender" element={<AIPicksPage />} />
          <Route path="/room/:slug" element={<RoomDetailsPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/vendor/setup" element={<VendorSetupPage />} />
          <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;
