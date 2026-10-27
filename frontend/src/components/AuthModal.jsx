import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from './GoogleSignInButton';

export default function AuthModal({ isOpen, initialMode = 'login', onClose }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync mode with initialMode prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setError('');
      setName('');
      setEmail('');
      setPassword('');
      setSubmitting(false);
    }
  }, [isOpen, initialMode]);

  // Handle escape key and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      const hasOtherModal = document.querySelector('.fixed.inset-0.z-50');
      if (!hasOtherModal) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  function handleAuthSuccess() {
    onClose();
    // Only navigate to dashboard if currently on the landing page '/'
    // If on /subscriptions, /dashboard, etc., stay on current page so the user continues their workflow
    if (location.pathname === '/') {
      navigate('/dashboard');
    }
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      handleAuthSuccess();
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(name, email, password);
      handleAuthSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!submitting) onClose();
        }}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-sm rounded-lg border border-line bg-white p-6 sm:p-7 shadow-xl z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* 1. SubTrack Logo and Cross (X) Button */}
        <div className="flex items-center justify-between pb-4 border-b border-line/60">
          <div className="flex items-center gap-2">
            <img
              src="/logo/logo.svg"
              alt="SubTrack"
              className="h-6 w-auto object-contain"
            />
            <img
              src="/logo/logo-t.svg"
              alt="SubTrack"
              className="h-6 w-auto object-contain"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-ink/40 hover:text-ink text-xl font-light p-1 rounded hover:bg-stone-100 disabled:opacity-40 transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* 2. Navigator: Log In <-> Sign Up */}
        <div className="mt-5 flex rounded-sm bg-stone-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 rounded-xs py-1.5 transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-ink shadow-2xs font-semibold'
                : 'text-ink/50 hover:text-ink'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 rounded-xs py-1.5 transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-ink shadow-2xs font-semibold'
                : 'text-ink/50 hover:text-ink'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* 3. Header of the particular card */}
        <div className="mt-5">
          {mode === 'login' ? (
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink">Welcome back</h2>
              <p className="mt-1 text-xs sm:text-sm text-ink/60">
                Sign in to see what's renewing.
              </p>
            </div>
          ) : (
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink">Create your account</h2>
              <p className="mt-1 text-xs sm:text-sm text-ink/60">
                Start tracking what you pay for, monthly.
              </p>
            </div>
          )}
        </div>

        {/* 4. Google Option */}
        <div className="mt-5">
          <GoogleSignInButton
            text={mode === 'login' ? 'signin_with' : 'signup_with'}
            onSuccess={handleAuthSuccess}
            onError={(err) => setError(err)}
          />
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line/70" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-white px-2.5 text-ink/40 font-medium">Or continue with email</span>
          </div>
        </div>

        {/* 5. Form (labels converted to placeholders) */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-sm border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-ledger focus:ring-1 focus:ring-ledger"
              />
            </div>

            <div>
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-sm border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-ledger focus:ring-1 focus:ring-ledger"
              />
            </div>

            {error && <p className="text-xs text-rust font-medium">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-sm bg-ledger py-2.5 text-sm font-semibold text-white shadow-2xs hover:bg-ledger-dark disabled:opacity-60 transition-colors cursor-pointer"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="pt-1 text-center text-xs text-ink/60">
              New here?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className="text-ledger font-semibold hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <input
                type="text"
                required
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-sm border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-ledger focus:ring-1 focus:ring-ledger"
              />
            </div>

            <div>
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-sm border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-ledger focus:ring-1 focus:ring-ledger"
              />
            </div>

            <div>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Password (min. 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-sm border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-ledger focus:ring-1 focus:ring-ledger"
              />
            </div>

            {error && <p className="text-xs text-rust font-medium">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-sm bg-ledger py-2.5 text-sm font-semibold text-white shadow-2xs hover:bg-ledger-dark disabled:opacity-60 transition-colors cursor-pointer"
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>

            <p className="pt-1 text-center text-xs text-ink/60">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="text-ledger font-semibold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
