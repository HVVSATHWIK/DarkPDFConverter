import React from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Assuming useAuth hook
// import { Button } from '@/components/ui/button'; // Assuming a Button component might be used

const LogoutButton: React.FC = () => {
  const { logout } = useAuth(); // Example usage

  const handleLogout = () => {
    logout();
    // Optionally, redirect to home or login page after logout
    // e.g., window.location.href = '/login';
  };

  return (
    // <Button onClick={handleLogout}>Logout</Button> // Placeholder if using a Button component
    <button onClick={handleLogout}>Logout</button> // Basic button for now
  );
};

export default LogoutButton;
