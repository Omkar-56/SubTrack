import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';

export default function App() {
  const { user, loading } = useAuth();

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
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <main className="w-full">
                <Landing />
              </main>
            )
          }
        />

        {/* Standard container for Auth & App pages with decreased side padding */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                <Login />
              </main>
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                <Register />
              </main>
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <Dashboard />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <Subscriptions />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
