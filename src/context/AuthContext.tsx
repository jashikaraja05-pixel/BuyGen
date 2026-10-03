import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';
import { api, getStoredToken, getStoredUser, setStoredAuth, clearStoredAuth } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: (email?: string, name?: string) => Promise<void>;
  register: (name: string, email: string, pass: string, confirm: string, role?: 'customer' | 'admin') => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
          setStoredAuth(storedToken, res.user);
        } catch {
          // If token expired or invalid, reset
          clearStoredAuth();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    setToken(res.token);
    setStoredAuth(res.token, res.user);
  };

  const loginWithGoogle = async (email?: string, name?: string) => {
    const res = await api.loginWithGoogle(email, name);
    setUser(res.user);
    setToken(res.token);
    setStoredAuth(res.token, res.user);
  };

  const register = async (name: string, email: string, pass: string, confirm: string, role?: 'customer' | 'admin') => {
    const res = await api.register(name, email, pass, confirm, role);
    setUser(res.user);
    setToken(res.token);
    setStoredAuth(res.token, res.user);
  };

  const logout = () => {
    api.logout().catch(() => {});
    clearStoredAuth();
    setUser(null);
    setToken(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, isAdmin, login, loginWithGoogle, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
