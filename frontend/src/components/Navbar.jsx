import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReminderBell from './ReminderBell';
import PaymentConfirmModal from './PaymentConfirmModal';
import CancellationGuideModal from './CancellationGuideModal';
import { api } from '../api/client';

const CURRENCIES = [
  { code: 'USD', label: '$ USD' },
  { code: 'EUR', label: '€ EUR' },
  { code: 'GBP', label: '£ GBP' },
  { code: 'INR', label: '₹ INR' },
  { code: 'CAD', label: 'CA$ CAD' },
  { code: 'AUD', label: 'A$ AUD' },
  { code: 'JPY', label: '¥ JPY' },
  { code: 'CHF', label: 'CHF' },
  { code: 'SGD', label: 'SG$ SGD' },
  { code: 'BRL', label: 'R$ BRL' },
];

const linkClass = ({ isActive }) =>
  `px-1 pb-1 border-b-2 text-sm transition-colors ${
    isActive ? 'border-ledger text-ink font-medium' : 'border-transparent text-ink/50 hover:text-ink'
  }`;

const mobileLinkClass = ({ isActive }) =>
  `flex items-center justify-between px-3.5 py-2.5 rounded-sm text-sm font-medium transition-colors ${
    isActive
      ? 'bg-ledger-light text-ledger-dark font-semibold'
      : 'text-ink/75 hover:bg-paper hover:text-ink'
  }`;

export default function Navbar() {
  const { user, baseCurrency, setBaseCurrency, logout, openLogin, openRegister } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [payingSub, setPayingSub] = useState(null);
  const [guideSub, setGuideSub] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    }
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  async function handleConfirmPayment(paymentData) {
    if (!payingSub) return;
    await api.confirmPayment(payingSub.id, paymentData);
    setPayingSub(null);
    window.dispatchEvent(new CustomEvent('subtrack:refresh'));
  }

  async function handleConvertTrial(sub) {
    try {
      await api.convertTrial(sub.id);
      window.dispatchEvent(new CustomEvent('subtrack:refresh'));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleStatusChange(subscription, newStatus) {
    try {
      await api.updateSubscription(subscription.id, {
        name: subscription.name,
        category: subscription.category || 'other',
        amount: Number(subscription.amount),
        currency: subscription.currency || 'USD',
        billingCycle: subscription.billingCycle || 'monthly',
        nextRenewalDate: String(subscription.nextRenewalDate).slice(0, 10),
        status: newStatus,
        notes: subscription.notes || '',
      });
      window.dispatchEvent(new CustomEvent('subtrack:refresh'));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <>
      <header
        className={`sticky top-0 z-30 bg-paper/95 backdrop-blur-md border-b transition-colors duration-200 ${
          isScrolled ? 'border-line/70 shadow-xs' : 'border-transparent'
        }`}
      >
        <div className="relative mx-auto flex items-center justify-between px-4 sm:px-10 lg:px-14 py-3 sm:py-5 max-w-[1440px] w-full">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <NavLink
              to={user ? '/subscriptions' : '/'}
              className="flex items-center gap-2 sm:gap-2.5 transition-opacity hover:opacity-90"
              onClick={() => setMobileMenuOpen(false)}
            >
              <img
                src="/logo/logo.svg"
                alt="SubTrack"
                className="h-6 sm:h-7 w-auto object-contain"
              />
              <img
                src="/logo/logo-t.svg"
                alt="SubTrack"
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </NavLink>
          </div>

          {/* Centered Desktop Navigation: Hidden on mobile screens */}
          <nav className="hidden md:flex items-center gap-6 sm:gap-8 absolute left-1/2 -translate-x-1/2">
            <NavLink to="/" end className={linkClass}>Home</NavLink>
            <NavLink to="/subscriptions" className={linkClass}>Subscriptions</NavLink>
            <NavLink to="/dashboard" className={linkClass}>Overview</NavLink>
          </nav>

          {/* Right Controls: Desktop */}
          {user ? (
            <div className="hidden md:flex items-center gap-3 sm:gap-4">
              {/* Due Date Reminders Bell & Trial Sentinel */}
              <ReminderBell
                onConfirmPayment={(sub) => setPayingSub(sub)}
                onCancelGuide={(sub) => setGuideSub(sub)}
                onConvertTrial={(sub) => handleConvertTrial(sub)}
              />

              {/* Currency Selector */}
              <div className="relative flex items-center">
                <select
                  value={user.baseCurrency || baseCurrency || 'USD'}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="appearance-none rounded border border-line/80 bg-paper/50 pl-2 pr-5 py-0.5 text-[11px] font-medium text-ink/80 outline-none hover:border-ink/20 focus:border-ink/25 text-center [text-align-last:center] cursor-pointer transition-colors"
                  title="Change default display currency for totals and analytics"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="text-left bg-white text-ink">
                      {c.label}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-1.5 h-3 w-3 text-ink/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <span className="text-xs text-ink/40">|</span>

              {/* Show user's name */}
              <span className="text-xs font-medium text-ink/80 max-w-[160px] truncate" title={user.email}>
                {user.name || user.email}
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-xs text-ink/60 hover:text-rust transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              {/* Currency Selector for guest/unlogged users */}
              <div className="relative flex items-center">
                <select
                  value={baseCurrency || 'USD'}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="appearance-none rounded border border-line/80 bg-paper/50 pl-2 pr-5 py-0.5 text-[11px] font-medium text-ink/80 outline-none hover:border-ink/20 focus:border-ink/25 text-center [text-align-last:center] cursor-pointer transition-colors"
                  title="Change default display currency for totals and analytics"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="text-left bg-white text-ink">
                      {c.label}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-1.5 h-3 w-3 text-ink/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <button
                type="button"
                onClick={openLogin}
                className="text-xs font-semibold text-ink/70 hover:text-ink transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={openRegister}
                className="rounded-sm bg-ledger px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-ledger-dark transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Right Controls: Compact icons + Hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <ReminderBell
                onConfirmPayment={(sub) => setPayingSub(sub)}
                onCancelGuide={(sub) => setGuideSub(sub)}
                onConvertTrial={(sub) => handleConvertTrial(sub)}
              />
            )}

            {/* Compact Currency Selector for Mobile */}
            <div className="relative flex items-center">
              <select
                value={user?.baseCurrency || baseCurrency || 'USD'}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="appearance-none rounded border border-line/80 bg-white/80 pl-2 pr-4 py-1 text-[11px] font-semibold text-ink outline-none cursor-pointer shadow-2xs"
                title="Change currency"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-1 h-2.5 w-2.5 text-ink/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center rounded-sm p-1.5 text-ink/75 hover:bg-stone-100 hover:text-ink transition-colors cursor-pointer border border-line/70 bg-white shadow-2xs"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-line/70 bg-paper/98 backdrop-blur-md px-4 pt-3 pb-5 shadow-lg animate-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col space-y-1">
              <NavLink to="/" end className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}>
                <span>Home</span>
                <span className="text-xs text-ink/30">→</span>
              </NavLink>
              <NavLink to="/subscriptions" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}>
                <span>Subscriptions</span>
                <span className="text-xs text-ink/30">→</span>
              </NavLink>
              <NavLink to="/dashboard" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}>
                <span>Overview</span>
                <span className="text-xs text-ink/30">→</span>
              </NavLink>
            </nav>

            <div className="mt-4 pt-4 border-t border-line/70 flex flex-col gap-3">
              {user ? (
                <div className="flex items-center justify-between gap-3 bg-white/80 border border-line/60 rounded-sm p-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{user.name || 'Account'}</p>
                    <p className="text-[11px] text-ink/50 truncate">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="shrink-0 rounded-xs border border-line bg-paper px-3 py-1.5 text-xs font-medium text-rust hover:bg-rust-light hover:border-rust/30 transition-colors cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openLogin();
                    }}
                    className="w-full rounded-sm border border-line bg-white py-2 text-center text-xs font-semibold text-ink hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openRegister();
                    }}
                    className="w-full rounded-sm bg-ledger py-2 text-center text-xs font-semibold text-white hover:bg-ledger-dark transition-colors cursor-pointer shadow-2xs"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {payingSub && (
        <PaymentConfirmModal
          subscription={payingSub}
          onConfirm={handleConfirmPayment}
          onCancel={() => setPayingSub(null)}
        />
      )}

      {guideSub && (
        <CancellationGuideModal
          subscription={guideSub}
          onClose={() => setGuideSub(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}
