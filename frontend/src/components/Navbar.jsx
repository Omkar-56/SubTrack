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

export default function Navbar() {
  const { user, baseCurrency, setBaseCurrency, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [payingSub, setPayingSub] = useState(null);
  const [guideSub, setGuideSub] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLandingPage = !user && location.pathname === '/';

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
        className={`sticky top-0 z-30 bg-paper/90 backdrop-blur-xs border-b transition-colors duration-200 ${
          isScrolled ? 'border-line/70' : 'border-transparent'
        }`}
      >
        <div className="relative mx-auto flex items-center justify-between px-6 sm:px-10 lg:px-14 py-5 sm:py-6 max-w-[1440px] w-full">
          <div className="flex items-center">
            <NavLink to={user ? '/subscriptions' : '/'} className="flex items-center gap-2 sm:gap-2.5 transition-opacity hover:opacity-90">
              <img
                src="/logo/logo.svg"
                alt="SubTrack"
                className="h-7 w-auto object-contain"
              />
              <img
                src="/logo/logo-t.svg"
                alt="SubTrack"
                className="h-7 w-auto object-contain"
              />
            </NavLink>
          </div>

          {/* Centered Navigation: Home, Subscriptions & Overview */}
          <nav className="flex items-center gap-6 sm:gap-8 absolute left-1/2 -translate-x-1/2">
            <NavLink to="/" end className={linkClass}>Home</NavLink>
            <NavLink to="/subscriptions" className={linkClass}>Subscriptions</NavLink>
            <NavLink to="/dashboard" className={linkClass}>Overview</NavLink>
          </nav>

          {user ? (
            <div className="flex items-center gap-3 sm:gap-4">
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

              <span className="hidden md:inline text-xs text-ink/40">|</span>

              <span className="hidden md:inline text-xs text-ink/50">{user.email}</span>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="text-xs text-ink/60 hover:text-rust transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
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

              <Link
                to="/login"
                className="text-xs font-semibold text-ink/70 hover:text-ink transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="rounded-sm bg-ledger px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-ledger-dark transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
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
