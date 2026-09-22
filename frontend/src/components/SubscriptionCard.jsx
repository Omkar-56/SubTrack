import BrandLogo from './BrandLogo';
import { formatDate, formatMoney, daysUntil } from '../utils/date';

const STATUS_BADGE = {
  active: 'bg-ledger-light text-ledger-dark border-ledger/20',
  paused: 'bg-amber-light text-amber border-amber/30',
  cancelled: 'bg-stone-100 text-ink/40 border-stone-200 line-through',
};

export default function SubscriptionCard({
  subscription,
  baseCurrency = 'USD',
  onEdit,
  onDelete,
  onAdvance,
  onConfirmPayment,
  onViewPayments,
  priceIncrease,
}) {
  const days = daysUntil(subscription.nextRenewalDate);
  const soon = subscription.status === 'active' && days >= 0 && days <= 7;
  const overdue = subscription.status === 'active' && days < 0;
  const isDifferentCurrency = baseCurrency && subscription.currency !== baseCurrency && subscription.convertedAmount;

  return (
    <div className="group flex items-center justify-between gap-4 border-b border-line px-2 py-3.5 transition-colors hover:bg-paper/40 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3.5">
        <BrandLogo name={subscription.name} category={subscription.category} size="md" />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate font-medium text-ink">{subscription.name}</p>

            <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-ink/60 border border-stone-200/60">
              {subscription.category}
            </span>

            <span
              className={`rounded border px-1.5 py-0.5 text-xs font-medium ${
                STATUS_BADGE[subscription.status] || STATUS_BADGE.active
              }`}
            >
              {subscription.status}
            </span>

            {soon && (
              <span className="rounded bg-amber-light border border-amber/30 px-1.5 py-0.5 text-xs font-medium text-amber">
                {days === 0 ? 'renews today' : `renews in ${days}d`}
              </span>
            )}

            {overdue && (
              <span className="rounded bg-rust-light border border-rust/30 px-1.5 py-0.5 text-xs font-medium text-rust">
                renewal due ({Math.abs(days)}d ago)
              </span>
            )}

            {priceIncrease && (
              <span className="rounded bg-rust-light border border-rust/30 px-1.5 py-0.5 text-xs font-medium text-rust">
                price hike {formatMoney(priceIncrease.oldAmount, subscription.currency)} →{' '}
                {formatMoney(priceIncrease.newAmount, subscription.currency)}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-ink/60">
            <span className="capitalize">{subscription.billingCycle}</span>
            <span>·</span>
            <span>Next: <strong>{formatDate(subscription.nextRenewalDate)}</strong></span>
            {subscription.notes && (
              <>
                <span>·</span>
                <span className="truncate max-w-[200px] text-ink/40 italic" title={subscription.notes}>
                  "{subscription.notes}"
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <div className="text-right">
          <p className="tabular font-display text-base font-semibold text-ink">
            {formatMoney(subscription.amount, subscription.currency)}
            <span className="text-xs font-normal text-ink/50">
              /{subscription.billingCycle === 'yearly' ? 'yr' : subscription.billingCycle === 'weekly' ? 'wk' : 'mo'}
            </span>
          </p>
          {isDifferentCurrency && (
            <p className="tabular text-[11px] text-ink/40">
              ≈ {formatMoney(subscription.convertedAmount, baseCurrency)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-90 transition-opacity">
          {/* Confirm Payment button (rolls over to next cycle upon user confirmation) */}
          {subscription.status === 'active' && onConfirmPayment && (
            <button
              onClick={() => onConfirmPayment(subscription)}
              className="rounded bg-ledger-light border border-ledger/30 px-2 py-1 text-xs font-semibold text-ledger-dark hover:bg-ledger hover:text-white transition-colors shadow-2xs"
              title="Confirm you paid this cycle and roll over to the next due date"
            >
              ✓ Paid
            </button>
          )}

          {/* History / Receipts button */}
          {onViewPayments && (
            <button
              onClick={() => onViewPayments(subscription)}
              className="hidden sm:inline-block rounded px-2 py-1 text-xs font-medium text-ink/60 hover:bg-stone-100 hover:text-ink transition-colors"
              title="View past confirmed payments for this subscription"
            >
              Receipts
            </button>
          )}

          {subscription.status === 'active' && onAdvance && (
            <button
              onClick={() => onAdvance(subscription)}
              className="rounded px-2 py-1 text-xs font-medium text-ink/60 hover:bg-stone-100 hover:text-ledger transition-colors"
              title="Advance renewal date without creating payment record"
            >
              ↻ Next
            </button>
          )}

          <button
            onClick={() => onEdit(subscription)}
            className="rounded px-2 py-1 text-xs font-medium text-ink/60 hover:bg-stone-100 hover:text-ledger transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(subscription)}
            className="rounded px-2 py-1 text-xs font-medium text-ink/60 hover:bg-rust-light hover:text-rust transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
