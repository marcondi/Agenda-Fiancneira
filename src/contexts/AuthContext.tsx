import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId) {
      const data = localStorage.getItem('finance-app-data');
      if (data) {
        const parsed = JSON.parse(data);
        const savedUser = parsed.users.find((u: User) => u.id === savedUserId);
        if (savedUser) {
          setUser(savedUser);
        }
      }
    }
  }, []);

  const login = (user: User) => {
    setUser(user);
    localStorage.setItem('currentUserId', user.id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUserId');
  };

  const isGuest = user?.id.startsWith('guest-') || false;

  return (
    <AuthContext.Provider value={{ user, login, logout, isGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
