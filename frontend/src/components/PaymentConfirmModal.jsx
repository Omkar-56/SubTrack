import { useState } from 'react';
import BrandLogo from './BrandLogo';
import { formatDate, formatMoney, parseLocalDate } from '../utils/date';

export default function PaymentConfirmModal({ subscription, onConfirm, onCancel }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [amount, setAmount] = useState(subscription?.amount || 0);
  const [currency, setCurrency] = useState(subscription?.currency || 'USD');
  const [paidDate, setPaidDate] = useState(todayStr);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!subscription) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onConfirm({
        amount: Number(amount),
        currency,
        paidDate,
        notes: notes || `Payment confirmed for ${subscription.billingCycle} cycle`,
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-md border border-line bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <BrandLogo name={subscription.name} category={subscription.category} size="md" />
            <div>
              <h3 className="font-display text-base font-semibold text-ink">
                Confirm Payment
              </h3>
              <p className="text-xs text-ink/60">
                {subscription.name} · <span className="capitalize">{subscription.billingCycle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="rounded p-1 text-ink/40 hover:bg-stone-100 hover:text-ink transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Due Date & Rollover notice */}
        <div className="mt-4 rounded bg-ledger-light/60 border border-ledger/20 p-3 text-xs text-ledger-dark space-y-1">
          <p className="font-medium">
            Current due date: <strong>{formatDate(subscription.nextRenewalDate)}</strong>
          </p>
          <p className="text-[11px] opacity-90">
            Confirming this payment logs it to your history and advances the subscription's due date to the next {subscription.billingCycle} billing cycle.
          </p>
        </div>

        {error && <p className="mt-3 text-xs text-rust">{error}</p>}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-ink/80">Amount Paid</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded border border-line px-3 py-1.5 text-sm tabular outline-none focus:border-ledger focus:ring-1 focus:ring-ledger"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/80">Currency</label>
              <input
                type="text"
                maxLength={3}
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                className="mt-1 w-full rounded border border-line px-3 py-1.5 text-sm uppercase outline-none focus:border-ledger focus:ring-1 focus:ring-ledger"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ink/80">Payment Date</label>
            <input
              type="date"
              required
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              className="mt-1 w-full rounded border border-line px-3 py-1.5 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink/80">Notes (optional)</label>
            <input
              type="text"
              placeholder="e.g. Card ending in 4242"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded border border-line px-3 py-1.5 text-xs outline-none focus:border-ledger focus:ring-1 focus:ring-ledger"
            />
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-line pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded px-3.5 py-1.5 text-xs font-medium text-ink/60 hover:bg-stone-100 hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-ledger px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-ledger-dark disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Confirming…' : '✓ Confirm & Go to Next Cycle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
