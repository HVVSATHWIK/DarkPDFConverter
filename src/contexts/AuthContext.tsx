import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: any; // Added
  isLoading: boolean; // Added
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null); // Added
  const [isLoading, setIsLoading] = useState(false); // Added

  const login = () => {
    setIsLoading(true); // Added
    setIsAuthenticated(true);
    // setCurrentUser({ name: "Test User" }); // Example: set user on login
    setIsLoading(false); // Added
  };
  const logout = () => {
    setIsLoading(true); // Added
    setIsAuthenticated(false);
    setCurrentUser(null); // Clear user on logout
    setIsLoading(false); // Added
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
