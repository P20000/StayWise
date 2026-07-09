import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Building2, User, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
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
              [ ARCHITECTURAL STAYS ]
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 font-mono text-xs uppercase tracking-wider font-bold">
          <Link
            to="/explore"
            className="text-[#212121] hover:text-[#C84B31] transition-colors py-1"
          >
            [ EXPLORE SUITES ]
          </Link>
          <Link
            to="/recommender"
            className="text-[#212121] hover:text-[#C84B31] transition-colors py-1 flex items-center gap-1"
          >
            <span>[ AI RECOMMENDER ]</span>
            <span className="text-[10px]" role="img" aria-label="Sparkles">✨</span>
          </Link>
          <Link
            to="/about"
            className="text-[#212121] hover:text-[#C84B31] transition-colors py-1"
          >
            [ ARCHITECTURE ]
          </Link>
        </nav>

        {/* User Actions / Auth compartment */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Badge variant="default" className="hidden sm:inline-flex">
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
                  SIGN IN
                </Button>
              </Link>
              <Link to="/auth?mode=register" className="hidden sm:inline-block">
                <Button variant="primary" size="sm">
                  RESERVE
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
