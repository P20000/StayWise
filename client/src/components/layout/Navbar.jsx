import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Building2, User, LogOut } from 'lucide-react';
import api from '../../services/api';
import { ProfileSettingsPanel } from '../profile/ProfileSettingsPanel';

export const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    dispatch(logoutUser());
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F1EDEA] border-b-2 border-[#212121] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group text-[#212121] no-underline"
          aria-label="StayWise.ai Home"
        >
          <div className="bg-[#212121] text-[#F1EDEA] p-1.5 border border-[#212121] shadow-[2px_2px_0px_#C84B31] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
            <Building2 size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-bold text-lg tracking-wider leading-none">
              STAYWISE.AI
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#C84B31] font-semibold">
              Architectural Stays
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 font-mono text-xs uppercase tracking-wider font-bold">
          {!(isAuthenticated && user?.role === 'Vendor') && (
            <Link
              to="/explore"
              className="text-[#212121] hover:text-[#C84B31] transition-colors py-1"
            >
              Explore Stays
            </Link>
          )}
          {!(isAuthenticated && user?.role === 'Vendor') && (
            <>
              <Link
                to="/recommender"
                className="text-[#212121] hover:text-[#C84B31] transition-colors py-1 flex items-center gap-1"
              >
                <span>AI Picks</span>
                <span className="text-[10px]" role="img" aria-label="Sparkles">✨</span>
              </Link>
              <Link
                to="/ai-chat"
                className="bg-[#212121] text-[#F1EDEA] hover:bg-[#C84B31] transition-colors px-2.5 py-1 border border-[#212121] shadow-[2px_2px_0px_#C84B31] flex items-center gap-1.5 font-bold no-underline"
              >
                <span>Concierge</span>
                <span className="text-[10px]" role="img" aria-label="Chat">💬</span>
              </Link>
            </>
          )}
          {isAuthenticated && user?.role === 'Vendor' && (
            <>
              <Link
                to="/vendor/dashboard?tab=bookings"
                className="text-[#C84B31] hover:text-[#212121] transition-colors py-1"
              >
                Manage Bookings
              </Link>
              <Link
                to="/vendor/dashboard?tab=listings"
                className="text-[#C84B31] hover:text-[#212121] transition-colors py-1"
              >
                Listings
              </Link>
              <Link
                to="/vendor/dashboard?tab=help"
                className="text-[#C84B31] hover:text-[#212121] transition-colors py-1"
              >
                Help
              </Link>
            </>
          )}
          <Link
            to="/about"
            className="text-[#212121] hover:text-[#C84B31] transition-colors py-1"
          >
            About
          </Link>
        </nav>

        {/* User Actions / Auth compartment */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Badge 
                variant="default" 
                className="hidden sm:inline-flex cursor-pointer hover:bg-slate-200 transition-colors border-2 border-[#212121]"
                onClick={() => setIsSettingsOpen(true)}
              >
                <User size={12} />
                <span>{user?.name || user?.email || 'GUEST'}</span>
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                title="Sign out"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">LOGOUT</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth?mode=login">
                <Button variant="secondary" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?mode=register" className="hidden sm:inline-block">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <ProfileSettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
};

export default Navbar;
