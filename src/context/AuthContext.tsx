import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/index.ts';
import { api, getStoredToken, getStoredUser, setStoredAuth, clearStoredAuth, AuthApiError } from '../services/api.ts';

export interface AuthFeedback {
  type: 'error' | 'success';
  message: string;
  code?: 'USER_NOT_FOUND' | 'EMAIL_ALREADY_EXISTS' | 'INVALID_PASSWORD' | 'VALIDATION_ERROR' | string;
  email?: string;
  suggestedAction?: 'switch_to_register' | 'switch_to_login' | 'reset_password';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  authFeedback: AuthFeedback | null;
  clearAuthFeedback: () => void;
  setAuthFeedback: (feedback: AuthFeedback | null) => void;
  login: (email: string, pass: string) => Promise<User>;
  loginWithGoogle: (email?: string, name?: string) => Promise<User>;
  register: (name: string, email: string, pass: string, confirm: string, role?: 'customer' | 'admin') => Promise<User>;
  resetPassword: (email: string, pass: string, confirm?: string) => Promise<User>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [loading, setLoading] = useState<boolean>(() => !!getStoredToken());
  const [authFeedback, setAuthFeedback] = useState<AuthFeedback | null>(null);

  // Verify and hydrate stored session with authoritative backend Firestore user profile on load / page refresh
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res?.user) {
          setUser(res.user);
          setToken(storedToken);
          setStoredAuth(storedToken, res.user);
        } else {
          clearStoredAuth();
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.warn('Session verification note:', err);
        clearStoredAuth();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const clearAuthFeedback = () => setAuthFeedback(null);

  const login = async (email: string, pass: string) => {
    try {
      setAuthFeedback(null);
      const res = await api.login(email, pass);
      setUser(res.user);
      setToken(res.token);
      setStoredAuth(res.token, res.user);
      setAuthFeedback({
        type: 'success',
        message: 'Welcome back! Signed in successfully.'
      });
      return res.user;
    } catch (err: any) {
      const feedback: AuthFeedback = {
        type: 'error',
        message: err.message || 'Login failed.',
        code: err instanceof AuthApiError ? err.code : undefined,
        email: (err instanceof AuthApiError && err.email) ? err.email : email.trim().toLowerCase(),
        suggestedAction: err instanceof AuthApiError ? err.suggestedAction : undefined
      };
      setAuthFeedback(feedback);
      throw err;
    }
  };

  const loginWithGoogle = async (email?: string, name?: string) => {
    try {
      setAuthFeedback(null);
      const res = await api.loginWithGoogle(email, name);
      setUser(res.user);
      setToken(res.token);
      setStoredAuth(res.token, res.user);
      setAuthFeedback({
        type: 'success',
        message: 'Signed in with Google successfully!'
      });
      return res.user;
    } catch (err: any) {
      const feedback: AuthFeedback = {
        type: 'error',
        message: err.message || 'Google sign-in failed.',
        code: err instanceof AuthApiError ? err.code : undefined,
        email: (err instanceof AuthApiError && err.email) ? err.email : email,
        suggestedAction: err instanceof AuthApiError ? err.suggestedAction : undefined
      };
      setAuthFeedback(feedback);
      throw err;
    }
  };

  const register = async (name: string, email: string, pass: string, confirm: string, role?: 'customer' | 'admin') => {
    try {
      setAuthFeedback(null);
      const res = await api.register(name, email, pass, confirm, role);
      setUser(res.user);
      setToken(res.token);
      setStoredAuth(res.token, res.user);
      setAuthFeedback({
        type: 'success',
        message: `${res.user.role === 'admin' ? 'Admin' : 'Customer'} account created successfully!`
      });
      return res.user;
    } catch (err: any) {
      const feedback: AuthFeedback = {
        type: 'error',
        message: err.message || 'Registration failed.',
        code: err instanceof AuthApiError ? err.code : undefined,
        email: (err instanceof AuthApiError && err.email) ? err.email : email.trim().toLowerCase(),
        suggestedAction: err instanceof AuthApiError ? err.suggestedAction : undefined
      };
      setAuthFeedback(feedback);
      throw err;
    }
  };

  const resetPassword = async (email: string, pass: string, confirm?: string) => {
    try {
      setAuthFeedback(null);
      const res = await api.resetPassword(email, pass, confirm);
      setUser(res.user);
      setToken(res.token);
      setStoredAuth(res.token, res.user);
      setAuthFeedback({
        type: 'success',
        message: 'Password reset successfully! You are now logged in.'
      });
      return res.user;
    } catch (err: any) {
      const feedback: AuthFeedback = {
        type: 'error',
        message: err.message || 'Password reset failed.',
        code: err instanceof AuthApiError ? err.code : undefined,
        email: (err instanceof AuthApiError && err.email) ? err.email : email.trim().toLowerCase(),
        suggestedAction: err instanceof AuthApiError ? err.suggestedAction : undefined
      };
      setAuthFeedback(feedback);
      throw err;
    }
  };

  const logout = () => {
    api.logout().catch(() => {});
    clearStoredAuth();
    setAuthFeedback(null);
    setUser(null);
    setToken(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      isAdmin, 
      authFeedback, 
      clearAuthFeedback, 
      setAuthFeedback, 
      login, 
      loginWithGoogle, 
      register, 
      resetPassword, 
      logout, 
      setUser 
    }}>
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
