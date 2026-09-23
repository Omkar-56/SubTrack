import { useState, useEffect } from 'react';
import BrandLogo from './BrandLogo';

const CATEGORIES = ['streaming', 'software', 'fitness', 'news', 'cloud', 'gaming', 'other'];
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
      amount: initial.amount !== undefined ? initial.amount : '',
      currency: initial.currency || defaultCurrency || 'USD',
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

  function update(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };

      if (field === 'isFreeTrial' && value === true) {
        if (!next.amount || Number(next.amount) === 0) {
          next.amount = '0.00';
        }
      }

      if (field === 'trialEndDate' && value) {
        next.nextRenewalDate = value;
      }

      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const finalCurrency = (form.currency || 'USD').toUpperCase();
      const trialEnd = form.isFreeTrial && form.trialEndDate ? form.trialEndDate : null;

      const payload = {
        ...form,
        currency: finalCurrency,
        amount: form.isFreeTrial ? (Number(form.amount) || 0) : (Number(form.amount) || 0),
        reminderDaysBefore: 3, // Default 3 days Sentinel alert window
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
            type="button"
            className="rounded p-1 text-ink/40 hover:bg-stone-100 hover:text-ink transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Service Name */}
            <div className="col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                Service Name
              </label>
              <input
                required
                placeholder="e.g. Netflix, GitHub, Spotify, Apple TV+"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger"
              />
            </div>

            {/* Simplified Free Trial Toggle Box */}
            <div className="col-span-2 rounded-md border border-amber/40 bg-amber-light/30 p-3.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={form.isFreeTrial}
                    onChange={(e) => update('isFreeTrial', e.target.checked)}
                    className="h-4 w-4 rounded border-amber text-ledger focus:ring-ledger cursor-pointer"
                  />
                  <div>
                    <span className="font-display text-sm font-semibold text-ink flex items-center gap-1.5">
                      🛡️ Free Trial / Promo Mode
                    </span>
                    <p className="text-xs text-ink/65">
                      Get Sentinel alert 3 days before expiry to cancel before being billed.
                    </p>
                  </div>
                </div>
                {form.isFreeTrial && (
                  <span className="rounded bg-amber px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shrink-0">
                    Sentinel Active
                  </span>
                )}
              </label>

              {form.isFreeTrial && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-amber/20">
                  <div>
                    <label className="text-xs font-semibold text-ink">
                      Trial End Date <span className="text-rust">*</span>
                    </label>
                    <input
                      required={form.isFreeTrial}
                      type="date"
                      value={form.trialEndDate}
                      onChange={(e) => update('trialEndDate', e.target.value)}
                      className="mt-1 w-full rounded-sm border border-amber/40 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-ledger"
                    />
                    <p className="text-[10px] text-ink/50 mt-0.5">Alerts trigger 3 days prior</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-ink">
                      Post-Trial Charge ({form.currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 199.00"
                      value={form.postTrialAmount}
                      onChange={(e) => update('postTrialAmount', e.target.value)}
                      className="mt-1 w-full rounded-sm border border-amber/40 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-ledger"
                    />
                    <p className="text-[10px] text-ink/50 mt-0.5">Price if not cancelled in time</p>
                  </div>
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger cursor-pointer capitalize"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
                className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                {form.isFreeTrial ? 'Current Trial Cost' : 'Amount'}
              </label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => update('amount', e.target.value)}
                className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm tabular outline-none focus:border-ledger focus:ring-1 focus:ring-ledger"
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

            {/* Notes */}
            <div className={form.isFreeTrial ? 'col-span-1' : 'col-span-2'}>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                Notes (optional)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                rows={form.isFreeTrial ? 1 : 2}
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
