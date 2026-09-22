import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import BrandLogo from './BrandLogo';
import { formatMoney, formatDate } from '../utils/date';

export default function ReminderBell({ onConfirmPayment }) {
  const [reminders, setReminders] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  async function loadReminders() {
    try {
      const res = await api.getReminders();
      setReminders(res.reminders || []);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadReminders();
    const interval = setInterval(loadReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  async function handleDismiss(id, e) {
    e.stopPropagation();
    try {
      await api.dismissReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  const count = reminders.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-full p-1.5 text-ink/60 hover:bg-paper hover:text-ink transition-colors"
        title="Due date reminders & payment confirmations"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rust px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {count}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-md border border-line bg-white shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between border-b border-line px-4 py-3 bg-paper/30">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-semibold text-ink">
                Renewal Reminders
              </span>
              <span className="rounded-full bg-ledger-light px-2 py-0.2 text-[11px] font-medium text-ledger-dark">
                {count} pending
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-ink/40 hover:text-ink"
            >
              ✕
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-line/60">
            {reminders.length === 0 ? (
              <div className="p-6 text-center text-xs text-ink/50">
                <p className="font-medium text-ink/70">All caught up!</p>
                <p className="mt-1">No upcoming renewal payments due right now.</p>
              </div>
            ) : (
              reminders.map((r) => (
                <div key={r.id} className="p-3.5 hover:bg-paper/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <BrandLogo name={r.subscriptionName} category={r.category} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-xs text-ink truncate">
                          {r.subscriptionName}
                        </p>
                        <p className="text-[11px] text-ink/60 mt-0.5">
                          Due: <strong>{formatDate(r.dueDate)}</strong>
                        </p>
                        <p className="tabular text-xs font-semibold text-ink mt-0.5">
                          {formatMoney(r.amount, r.currency)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setOpen(false);
                          if (onConfirmPayment) {
                            onConfirmPayment({
                              id: r.subscriptionId,
                              name: r.subscriptionName,
                              category: r.category,
                              amount: r.amount,
                              currency: r.currency,
                              billingCycle: r.billingCycle,
                              nextRenewalDate: r.dueDate,
                            });
                          }
                        }}
                        className="rounded bg-ledger px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs hover:bg-ledger-dark transition-colors"
                      >
                        ✓ Confirm Paid
                      </button>
                      <button
                        onClick={(e) => handleDismiss(r.id, e)}
                        className="text-[10px] text-ink/40 hover:text-rust transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
