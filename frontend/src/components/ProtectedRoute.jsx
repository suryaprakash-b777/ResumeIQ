import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FC] dark:bg-[#0F172A]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#3867F5] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#7C879B]">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

