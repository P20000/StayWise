import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1EDEA] flex flex-col items-center justify-center font-mono text-xs uppercase text-[#212121]/60 select-none space-y-4">
        <div className="w-10 h-10 border-4 border-[#212121] border-t-[#C84B31] animate-spin shadow-[3px_3px_0px_#212121]"></div>
        <div className="font-bold tracking-wider">[ VERIFYING SESSION... ]</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to auth page, preserving the location they tried to access
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Role not authorized, redirect to home page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
