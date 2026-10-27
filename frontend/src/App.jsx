import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import AuthModal from './components/AuthModal';

function AuthRouteHandler({ mode }) {
  const { user, setAuthModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    } else {
      setAuthModal(mode);
      const returnTo = location.state?.from || '/';
      navigate(returnTo, { replace: true });
    }
  }, [user, mode, setAuthModal, navigate, location]);

  return null;
}

export default function App() {
  const { user, loading, authModal, closeAuthModal } = useAuth();

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
      <Routes>
        {/* Full-width seamless layout for Landing Page */}
        <Route
          path="/"
          element={
            <main className="w-full">
              <Landing />
            </main>
          }
        />

        {/* /login & /register open the popup card on the same page instead of a separate page */}
        <Route path="/login" element={<AuthRouteHandler mode="login" />} />
        <Route path="/register" element={<AuthRouteHandler mode="register" />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <main className="mx-auto max-w-[1440px] w-full px-6 sm:px-10 lg:px-14 py-8">
                <Dashboard />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <main className="mx-auto max-w-[1440px] w-full px-6 sm:px-10 lg:px-14 py-8">
                <Subscriptions />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Auth Modal Popup Card */}
      <AuthModal
        isOpen={Boolean(authModal)}
        initialMode={authModal || 'login'}
        onClose={closeAuthModal}
      />
    </div>
  );
}
