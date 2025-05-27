import React from 'react';
import { Navigate, Outlet } from 'react-router-dom'; // Added Outlet
import { useAuth } from '@/contexts/AuthContext'; // Assuming useAuth hook from AuthContext

interface ProtectedRouteProps {
  // children prop removed
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = () => { // children removed from signature
  const { isAuthenticated } = useAuth(); // Example usage of useAuth

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected.
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // Changed to return Outlet
};

export default ProtectedRoute;
