import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainApplication } from '@/components/layout/MainApplication'; // Import the new component

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainApplication />} /> {/* Use MainApplication here */}
        {/* Add other protected routes here as children of ProtectedRoute */}
      </Route>

      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
