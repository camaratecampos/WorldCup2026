import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api';

interface User {
  id: number;
  username: string;
  teamPick: string | null;
  isAdmin: boolean;
  phone: string | null;
  forceReset: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, phone: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (username: string, password: string) => {
    const data = await api.login(username, password);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    await refreshUser();
  };

  const register = async (username: string, password: string, phone: string) => {
    const data = await api.register(username, password, phone);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    await refreshUser();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
