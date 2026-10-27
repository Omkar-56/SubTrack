'use client';

import { AuthProvider, useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';

function AppShell({ children }) {
  const { loading, authModal, closeAuthModal } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-ink/50">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />
      {children}
      <AuthModal
        isOpen={Boolean(authModal)}
        initialMode={authModal || 'login'}
        onClose={closeAuthModal}
      />
    </div>
  );
}

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
