import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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
import { ItineraryBuilderPage } from './pages/ItineraryBuilderPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';

export const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isAiChat = location.pathname === '/itinerary-builder' || location.pathname === '/ai-chat';

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
          <Route path="/itinerary-builder" element={<ItineraryBuilderPage />} />
          <Route path="/ai-chat" element={<ItineraryBuilderPage />} />
          <Route path="/room/:slug" element={<RoomDetailsPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/vendor/setup"
            element={
              <ProtectedRoute allowedRoles={['Vendor']}>
                <VendorSetupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Vendor']}>
                <VendorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      {!isAiChat && <Footer />}
    </div>
  );
};

export default App;
