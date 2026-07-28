import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

export interface IUserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  department?: string;
  section?: string;
  rollNo?: string;
  studentId?: string;
}

interface AuthContextType {
  user: IUserProfile | null;
  token: string | null;
  login: (email: string, pass: string, role: string) => Promise<any>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUserProfile | null>(() => {
    const saved = localStorage.getItem('smartattend_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('smartattend_token'));
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, pass: string, role: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password: pass, role });
      const { accessToken, refreshToken, user: userData } = res.data;

      localStorage.setItem('smartattend_token', accessToken);
      localStorage.setItem('smartattend_refresh_token', refreshToken);
      localStorage.setItem('smartattend_user', JSON.stringify(userData));

      setToken(accessToken);
      setUser(userData);
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
