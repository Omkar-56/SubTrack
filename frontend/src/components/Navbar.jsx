import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReminderBell from './ReminderBell';
import PaymentConfirmModal from './PaymentConfirmModal';
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
  const [payingSub, setPayingSub] = useState(null);

  async function handleConfirmPayment(paymentData) {
    if (!payingSub) return;
    await api.confirmPayment(payingSub.id, paymentData);
    setPayingSub(null);
    // Trigger page refresh if on dashboard or subscriptions
    window.dispatchEvent(new CustomEvent('subtrack:refresh'));
  }

  return (
    <>
      <header className="border-b border-line bg-white/70 backdrop-blur-xs sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-8">
            <NavLink to="/" className="font-display text-lg font-bold tracking-tight text-ink flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-ledger"></span>
              SubTrack
            </NavLink>
            {user && (
              <nav className="flex gap-6">
                <NavLink to="/" end className={linkClass}>Overview</NavLink>
                <NavLink to="/subscriptions" className={linkClass}>Subscriptions</NavLink>
              </nav>
            )}
          </div>
          {user && (
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Due Date Reminders Bell */}
              <ReminderBell onConfirmPayment={(sub) => setPayingSub(sub)} />

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
                className="text-xs text-ink/60 hover:text-rust transition-colors"
              >
                Sign out
              </button>
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
    </>
  );
}
