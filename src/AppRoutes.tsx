import { Routes, Route, Navigate } from 'react-router-dom';
// import LoginPage from '@/pages/LoginPage';
// import SignupPage from '@/pages/SignupPage';
import { MainApplication } from '@/components/layout/MainApplication'; // Import the new component

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainApplication />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
