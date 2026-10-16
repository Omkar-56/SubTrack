import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { VALID_CATEGORIES, formatCategoryLabel, normalizeCategory } from '../utils/brands';

const CATEGORIES = VALID_CATEGORIES;
const CYCLES = ['weekly', 'monthly', 'quarterly', 'yearly'];
const COMMON_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'CHF', 'SGD', 'BRL'];

const emptyForm = {
  name: '',
  category: 'other',
  amount: '',
  currency: 'USD',
  billingCycle: 'monthly',
  nextRenewalDate: '',
  status: 'active',
  notes: '',
  reminderDaysBefore: 3,
  // Free Trial Sentinel fields
  isFreeTrial: false,
  trialEndDate: '',
  postTrialAmount: '',
};

export default function SubscriptionForm({ initial, defaultCurrency = 'USD', onSubmit, onCancel }) {
  const [form, setForm] = useState(() => {
    if (!initial) {
      return {
        ...emptyForm,
        currency: defaultCurrency || 'USD',
      };
    }
    return {
      ...emptyForm,
      ...initial,
      category: initial.category ? normalizeCategory(initial.category) : 'other',
      amount: initial.amount !== undefined ? initial.amount : '',
      currency: initial.currency || defaultCurrency || 'USD',
      reminderDaysBefore: initial.reminderDaysBefore || 3,
      postTrialAmount: initial.postTrialAmount !== undefined && initial.postTrialAmount !== null ? initial.postTrialAmount : '',
      trialEndDate: initial.trialEndDate ? String(initial.trialEndDate).slice(0, 10) : initial.nextRenewalDate ? String(initial.nextRenewalDate).slice(0, 10) : '',
      nextRenewalDate: initial.nextRenewalDate ? String(initial.nextRenewalDate).slice(0, 10) : '',
    };
  });

  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  function update(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setErrorCode('');
    setSubmitting(true);

    try {
      const finalCurrency = form.currency.trim().toUpperCase();
      if (!finalCurrency) throw new Error('Please select or specify a 3-letter currency code.');

      const trialEnd = form.isFreeTrial && form.trialEndDate ? form.trialEndDate : null;

      const payload = {
        ...form,
        category: normalizeCategory(form.category),
        currency: finalCurrency,
        amount: form.isFreeTrial ? (Number(form.amount) || 0) : (Number(form.amount) || 0),
        reminderDaysBefore: form.reminderDaysBefore ? Number(form.reminderDaysBefore) : 3,
        isFreeTrial: Boolean(form.isFreeTrial),
        trialEndDate: trialEnd,
        cancellationDeadline: trialEnd,
        postTrialAmount: form.isFreeTrial && form.postTrialAmount !== '' ? Number(form.postTrialAmount) : null,
        postTrialCurrency: finalCurrency,
        nextRenewalDate: form.isFreeTrial && trialEnd ? trialEnd : form.nextRenewalDate,
      };

      await onSubmit(payload);
    } catch (err) {
      setError(err.message);
      if (err.details?.code) {
        setErrorCode(err.details.code);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-md border border-line bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <BrandLogo name={form.name || 'New'} category={form.category} size="md" />
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">
                {initial ? `Edit ${form.name || 'Subscription'}` : 'Add Subscription'}
              </h2>
              <p className="text-xs text-ink/50">
                {form.name ? `Configuring ${form.name}` : 'Enter details to track recurring spend or free trials'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-ink/40 hover:text-ink text-xl font-light p-1 rounded hover:bg-stone-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Mode Switcher: Regular Paid Subscription vs Free Trial Sentinel */}
          <div className="flex rounded-sm bg-stone-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => update('isFreeTrial', false)}
              className={`flex-1 rounded-xs py-1.5 transition-all cursor-pointer ${
                !form.isFreeTrial ? 'bg-white text-ink shadow-2xs' : 'text-ink/50 hover:text-ink'
              }`}
            >
              Paid Subscription
            </button>
            <button
              type="button"
              onClick={() => {
                update('isFreeTrial', true);
                if (form.amount === '') update('amount', 0);
              }}
              className={`flex-1 rounded-xs py-1.5 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                form.isFreeTrial ? 'bg-amber-light text-amber shadow-2xs' : 'text-ink/50 hover:text-ink'
              }`}
            >
              <span>🛡️</span>
              <span>Free Trial Sentinel</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-ink/70">Service Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. Netflix, Claude Pro, Gym"
                className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink/70">Category</label>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="mt-1 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {formatCategoryLabel(c)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional Layout: Trial Mode vs Regular Mode */}
          {form.isFreeTrial ? (
            <div className="rounded-md border border-amber/40 bg-amber-light/25 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber text-white text-xs font-bold">
                  🛡️
                </span>
                <div>
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                    Free Trial Protection Active
                  </h4>
                  <p className="text-[11px] text-ink/65">
                    SubTrack will remind you before this trial expires so you can cancel without getting charged.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-ink">
                    Trial End Date (Cancellation Cutoff)
                  </label>
                  <input
                    required
                    type="date"
                    value={form.trialEndDate}
                    onChange={(e) => {
                      update('trialEndDate', e.target.value);
                      update('nextRenewalDate', e.target.value);
                    }}
                    className="mt-1 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink">
                    Auto-Charge Amount After Trial
                  </label>
                  <div className="mt-1 flex rounded-sm border border-line bg-white focus-within:border-ledger focus-within:ring-1 focus-within:ring-ledger">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.postTrialAmount}
                      onChange={(e) => update('postTrialAmount', e.target.value)}
                      placeholder="e.g. 19.99"
                      className="w-full px-3 py-2 text-sm outline-none tabular"
                    />
                    <select
                      value={form.currency}
                      onChange={(e) => update('currency', e.target.value)}
                      className="border-l border-line bg-stone-50 px-2.5 py-2 text-xs font-semibold text-ink outline-none cursor-pointer"
                    >
                      {COMMON_CURRENCIES.map((curr) => (
                        <option key={curr} value={curr}>
                          {curr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-ink/70">Subsequent Billing Cycle</label>
                  <select
                    value={form.billingCycle}
                    onChange={(e) => update('billingCycle', e.target.value)}
                    className="mt-1 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm capitalize outline-none focus:border-ledger focus:ring-1 focus:ring-ledger cursor-pointer"
                  >
                    {CYCLES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-ink/70">Initial Trial Cost (Usually 0.00)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => update('amount', e.target.value)}
                    placeholder="0.00"
                    className="mt-1 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger tabular"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-ink/70">Recurring Cost</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => update('amount', e.target.value)}
                  placeholder="0.00"
                  className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger tabular"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink/70">Currency</label>
                <div className="mt-1 flex rounded-sm border border-line focus-within:border-ledger focus-within:ring-1 focus-within:ring-ledger">
                  <select
                    value={form.currency}
                    onChange={(e) => update('currency', e.target.value)}
                    className="w-full bg-white px-3 py-2 text-sm outline-none cursor-pointer"
                  >
                    {COMMON_CURRENCIES.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-ink/70">Billing Cycle</label>
                <select
                  value={form.billingCycle}
                  onChange={(e) => update('billingCycle', e.target.value)}
                  className="mt-1 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm capitalize outline-none focus:border-ledger focus:ring-1 focus:ring-ledger cursor-pointer"
                >
                  {CYCLES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-ink/70">
                {form.isFreeTrial ? 'Reminder Alert Date' : 'Next Renewal Date'}
              </label>
              <input
                required
                type="date"
                value={form.nextRenewalDate}
                onChange={(e) => update('nextRenewalDate', e.target.value)}
                className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink/70">Reminder Schedule</label>
              <select
                value={form.reminderDaysBefore}
                onChange={(e) => update('reminderDaysBefore', Number(e.target.value))}
                className="mt-1 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger cursor-pointer"
              >
                <option value={1}>1 day before</option>
                <option value={2}>2 days before (Standard)</option>
                <option value={3}>3 days before</option>
                <option value={5}>5 days before</option>
                <option value={7}>7 days before (1 week)</option>
                <option value={14}>14 days before (2 weeks)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-ink/70">Status</label>
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
                className="mt-1 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm capitalize outline-none focus:border-ledger focus:ring-1 focus:ring-ledger cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-ink/70">Notes (Optional)</label>
              <input
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="e.g. Cancel before 14-day trial ends"
                className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger"
              />
            </div>
          </div>

          {error && (
            <div className="rounded bg-rust/10 border border-rust/30 p-3 text-xs text-rust">
              <p className="font-medium">{error}</p>
              {errorCode === 'SUBSCRIPTION_LIMIT_REACHED' && (
                <div className="mt-2.5 pt-2 border-t border-rust/20 flex items-center justify-between">
                  <span className="text-[11px] text-ink/70">Unlock unlimited tracking with Pro</span>
                  <Link
                    to="/pricing"
                    onClick={onCancel}
                    className="rounded bg-ledger px-3 py-1 text-xs font-semibold text-white hover:bg-ledger-dark transition-colors"
                  >
                    View Plans →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-sm border border-line px-4 py-2 text-sm text-ink/70 hover:text-ink hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-sm bg-ledger px-5 py-2 text-sm font-semibold text-white hover:bg-ledger-dark disabled:opacity-60 transition-colors shadow-2xs cursor-pointer"
            >
              {submitting ? 'Saving…' : form.isFreeTrial ? '🛡️ Save Sentinel' : initial ? 'Save Changes' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
