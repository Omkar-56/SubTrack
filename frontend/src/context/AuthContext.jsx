'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestCurrency, setGuestCurrency] = useState('USD');
  const [authModal, setAuthModal] = useState(null); // null | 'login' | 'register'

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCurrency = localStorage.getItem('subtrack_base_currency');
      if (savedCurrency) setGuestCurrency(savedCurrency);
    }
  }, []);

  const openLogin = useCallback(() => setAuthModal('login'), []);
  const openRegister = useCallback(() => setAuthModal('register'), []);
  const closeAuthModal = useCallback(() => setAuthModal(null), []);

  useEffect(() => {
    const token = localStorage.getItem('subtrack_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem('subtrack_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user, token } = await api.login({ email, password });
    localStorage.setItem('subtrack_token', token);
    setUser(user);
    setAuthModal(null);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { user, token } = await api.register({ name, email, password });
    localStorage.setItem('subtrack_token', token);
    setUser(user);
    setAuthModal(null);
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    const { user, token } = await api.googleAuth(credential);
    localStorage.setItem('subtrack_token', token);
    setUser(user);
    setAuthModal(null);
  }, []);

  const setBaseCurrency = useCallback(async (currency) => {
    localStorage.setItem('subtrack_base_currency', currency);
    setGuestCurrency(currency);
    if (user) {
      try {
        const { user: updated } = await api.updateCurrency(currency);
        setUser(updated);
      } catch (err) {
        console.error('Failed to update currency preference:', err);
      }
    }
  }, [user]);

  const logout = useCallback(() => {
    localStorage.removeItem('subtrack_token');
    setUser(null);
  }, []);

  const isPro = Boolean(user && (user.plan === 'pro' || user.plan === 'lifetime'));
  const baseCurrency = user?.baseCurrency || guestCurrency || 'USD';

  return (
    <AuthContext.Provider
      value={{
        user,
        baseCurrency,
        loading,
        isPro,
        authModal,
        openLogin,
        openRegister,
        closeAuthModal,
        setAuthModal,
        login,
        register,
        loginWithGoogle,
        setBaseCurrency,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
