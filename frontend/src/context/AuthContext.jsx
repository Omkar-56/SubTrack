import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { user, token } = await api.register({ name, email, password });
    localStorage.setItem('subtrack_token', token);
    setUser(user);
  }, []);

  const setBaseCurrency = useCallback(async (currency) => {
    try {
      const { user } = await api.updateCurrency(currency);
      setUser(user);
    } catch (err) {
      console.error('Failed to update currency preference:', err);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('subtrack_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, setBaseCurrency, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
