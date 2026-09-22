import { useEffect, useState } from 'react';
import { api } from '../api/client';
import BrandLogo from './BrandLogo';
import { formatDate, formatMoney } from '../utils/date';

export default function PaymentHistoryModal({ subscription, onClose }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!subscription) return;
    setLoading(true);
    api
      .getPayments(subscription.id)
      .then((res) => setPayments(res.payments || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [subscription]);

  if (!subscription) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-md border border-line bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <BrandLogo name={subscription.name} category={subscription.category} size="md" />
            <div>
              <h3 className="font-display text-base font-semibold text-ink">
                Payment History
              </h3>
              <p className="text-xs text-ink/60">
                {subscription.name} · {payments.length} confirmed payment{payments.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-ink/40 hover:bg-stone-100 hover:text-ink transition-colors"
          >
            ✕
          </button>
        </div>

        {loading && <p className="py-8 text-center text-xs text-ink/50">Loading history…</p>}
        {error && <p className="mt-3 text-xs text-rust">{error}</p>}

        {!loading && !error && (
          <div className="mt-4 max-h-72 overflow-y-auto divide-y divide-line/60 border border-line rounded-sm">
            {payments.length === 0 && (
              <p className="py-8 text-center text-xs text-ink/50">
                No confirmed payments recorded yet. Confirm your next renewal to log payment records.
              </p>
            )}
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 text-xs hover:bg-paper/30">
                <div>
                  <p className="font-medium text-ink">
                    {formatDate(p.paidDate)}
                  </p>
                  <p className="text-[11px] text-ink/50 capitalize">
                    {p.billingCycle} cycle {p.notes ? `· ${p.notes}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <span className="tabular font-display font-semibold text-ledger-dark">
                    {formatMoney(p.amount, p.currency)}
                  </span>
                  <p className="text-[10px] text-ink/40">✓ Confirmed</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex justify-end border-t border-line pt-3">
          <button
            onClick={onClose}
            className="rounded border border-line bg-paper px-4 py-1.5 text-xs font-medium text-ink hover:bg-stone-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
