import { formatDate, formatMoney, daysUntil } from '../utils/date';

const STATUS_STYLE = {
  active: 'text-ledger-dark',
  paused: 'text-amber',
  cancelled: 'text-ink/40 line-through',
};

export default function SubscriptionCard({ subscription, onEdit, onDelete, priceIncrease }) {
  const days = daysUntil(subscription.nextRenewalDate);
  const soon = subscription.status === 'active' && days >= 0 && days <= 7;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-1 py-4 last:border-b-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{subscription.name}</p>
          <span className="shrink-0 text-xs text-ink/40">{subscription.category}</span>
          {soon && (
            <span className="shrink-0 bg-amber-light px-2 py-0.5 text-xs text-amber">
              renews in {days}d
            </span>
          )}
          {priceIncrease && (
            <span className="shrink-0 bg-rust-light px-2 py-0.5 text-xs text-rust">
              price up {formatMoney(priceIncrease.oldAmount, subscription.currency)} → {formatMoney(priceIncrease.newAmount, subscription.currency)}
            </span>
          )}
        </div>
        <p className={`mt-0.5 text-sm ${STATUS_STYLE[subscription.status]}`}>
          {subscription.status} · {subscription.billingCycle} · next {formatDate(subscription.nextRenewalDate)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <p className="tabular font-display text-lg">
          {formatMoney(subscription.amount, subscription.currency)}
        </p>
        <button onClick={() => onEdit(subscription)} className="text-sm text-ink/50 hover:text-ledger">
          Edit
        </button>
        <button onClick={() => onDelete(subscription)} className="text-sm text-ink/50 hover:text-rust">
          Delete
        </button>
      </div>
    </div>
  );
}
