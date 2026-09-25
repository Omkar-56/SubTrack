import { useState } from 'react';
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
  const { user, setBaseCurrency, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [payingSub, setPayingSub] = useState(null);
  const [guideSub, setGuideSub] = useState(null);

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
      <header className="border-b border-line bg-white/80 backdrop-blur-xs sticky top-0 z-30">
        <div className={`mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 max-w-7xl`}>
          <div className="flex items-center gap-8">
            <NavLink to={user ? '/dashboard' : '/'} className="font-display text-lg font-bold tracking-tight text-ink flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-ledger"></span>
              SubTrack
            </NavLink>
            {user && (
              <nav className="flex gap-6">
                <NavLink to="/dashboard" className={linkClass}>Overview</NavLink>
                <NavLink to="/subscriptions" className={linkClass}>Subscriptions</NavLink>
              </nav>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Due Date Reminders Bell & Trial Sentinel */}
              <ReminderBell
                onConfirmPayment={(sub) => setPayingSub(sub)}
                onCancelGuide={(sub) => setGuideSub(sub)}
                onConvertTrial={(sub) => handleConvertTrial(sub)}
              />

              {/* Currency Selector */}
              <div className="flex items-center gap-1.5 text-xs text-ink/60">
                <span className="hidden sm:inline">Base:</span>
                <select
                  value={user.baseCurrency || 'USD'}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="rounded border border-line bg-paper/60 px-2 py-1 font-medium text-ink outline-none hover:border-line focus:border-ledger cursor-pointer"
                  title="Change default display currency for totals and analytics"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
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
              <Link
                to="/login"
                className="text-xs font-semibold text-ink/70 hover:text-ink transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-sm bg-ledger px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-ledger-dark transition-colors"
              >
                Get Started Free
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
