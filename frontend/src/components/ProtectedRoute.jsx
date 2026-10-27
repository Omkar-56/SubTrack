'use client';

import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-ink/50">Loading…</div>;
  }
  return children;
}
