import { useState } from 'react';
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
};

export default function SubscriptionForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({ ...form, amount: Number(form.amount) });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-center gap-3 border-b border-line pb-4">
        <BrandLogo name={form.name || 'New'} category={form.category} size="lg" />
        <div>
          <h2 className="font-display text-base font-semibold text-ink">
            {initial ? `Edit ${form.name || 'Subscription'}` : 'Add Subscription'}
          </h2>
          <p className="text-xs text-ink/50">
            {form.name ? `Configuring ${form.name}` : 'Enter details to track recurring spend'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-sm font-medium">Name</label>
          <input
            required
            placeholder="e.g. Netflix, GitHub, Spotify"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Category</label>
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

        <div>
          <label className="text-sm font-medium">Status</label>
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

        <div>
          <label className="text-sm font-medium">Amount</label>
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

        <div>
          <label className="text-sm font-medium">Currency</label>
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
              placeholder="USD"
              value={form.currency}
              onChange={(e) => update('currency', e.target.value.toUpperCase())}
              className="w-1/2 rounded-sm border border-line px-3 py-2 text-sm uppercase outline-none focus:border-ledger focus:ring-1 focus:ring-ledger"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Billing cycle</label>
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

        <div>
          <label className="text-sm font-medium">Next renewal</label>
          <input
            required
            type="date"
            value={form.nextRenewalDate}
            onChange={(e) => update('nextRenewalDate', e.target.value)}
            className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger"
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-medium">Notes (optional)</label>
          <textarea
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            rows={2}
            placeholder="e.g. Family plan split with roommates"
            className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-rust">{error}</p>}

      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-sm bg-ledger px-4 py-2 text-sm font-medium text-white hover:bg-ledger-dark disabled:opacity-60 transition-colors shadow-2xs"
        >
          {submitting ? 'Saving…' : 'Save Subscription'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-sm border border-line px-4 py-2 text-sm text-ink/60 hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
