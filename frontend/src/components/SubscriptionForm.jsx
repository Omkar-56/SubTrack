import { useState, useEffect } from 'react';
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
            {/* Service Name */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                Service / Merchant
              </label>
              <input
                required
                placeholder="e.g. Netflix, Spotify, AWS"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {formatCategoryLabel(cat)}
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional Trial Sentinel Fields */}
            {form.isFreeTrial ? (
              <>
                <div className="col-span-1 sm:col-span-2 rounded border border-amber/30 bg-amber-light/20 p-3">
                  <p className="text-xs font-bold text-amber flex items-center gap-1.5">
                    <span>🛡️ Sentinel Trial Protection</span>
                  </p>
                  <p className="text-[11px] text-ink/70 mt-1">
                    Track cancellation deadlines so you cancel before being charged.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                    Trial Expiry / Cancel By
                  </label>
                  <input
                    required
                    type="date"
                    value={form.trialEndDate}
                    onChange={(e) => update('trialEndDate', e.target.value)}
                    className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-amber focus:ring-1 focus:ring-amber"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                    Post-Trial Cost (if not cancelled)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 19.99"
                    value={form.postTrialAmount}
                    onChange={(e) => update('postTrialAmount', e.target.value)}
                    className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger font-mono"
                  />
                </div>
              </>
            ) : null}

            {/* Amount */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                {form.isFreeTrial ? 'Initial Charge (usually 0.00)' : 'Amount'}
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => update('amount', e.target.value)}
                className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger font-mono"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                Currency
              </label>
              <div className="mt-1 flex gap-2">
                <select
                  value={COMMON_CURRENCIES.includes(form.currency) ? form.currency : 'OTHER'}
                  onChange={(e) => {
                    if (e.target.value !== 'OTHER') update('currency', e.target.value);
                  }}
                  className="w-1/2 rounded-sm border border-line px-2 py-2 text-sm outline-none focus:border-ledger cursor-pointer"
                >
                  {COMMON_CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="OTHER">Other…</option>
                </select>
                <input
                  required
                  maxLength={3}
                  placeholder="INR"
                  value={form.currency}
                  onChange={(e) => update('currency', e.target.value.toUpperCase())}
                  className="w-1/2 rounded-sm border border-line px-3 py-2 text-sm uppercase outline-none focus:border-ledger focus:ring-1 focus:ring-ledger"
                />
              </div>
            </div>

            {/* Billing Cycle */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                {form.isFreeTrial ? 'Post-Trial Cycle' : 'Billing Cycle'}
              </label>
              <select
                value={form.billingCycle}
                onChange={(e) => update('billingCycle', e.target.value)}
                className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger cursor-pointer capitalize"
              >
                {CYCLES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Next Renewal / Start Date */}
            {!form.isFreeTrial && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                  Next Renewal Date
                </label>
                <input
                  required
                  type="date"
                  value={form.nextRenewalDate}
                  onChange={(e) => update('nextRenewalDate', e.target.value)}
                  className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger"
                />
              </div>
            )}

            {/* Email Reminder Timing */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                Email Reminder
              </label>
              <select
                value={form.reminderDaysBefore || 3}
                onChange={(e) => update('reminderDaysBefore', Number(e.target.value))}
                className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger cursor-pointer"
              >
                <option value={1}>1 day before due</option>
                <option value={2}>2 days before due</option>
                <option value={3}>3 days before due (Recommended)</option>
                <option value={7}>7 days before due</option>
              </select>
            </div>

            {/* Notes */}
            <div className={form.isFreeTrial ? 'col-span-1' : 'col-span-1 sm:col-span-2'}>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                Notes (optional)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                rows={1}
                placeholder="e.g. Cancel before 14-day trial ends"
                className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger"
              />
            </div>
          </div>

          {error && <p className="text-xs text-rust font-medium">{error}</p>}

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
