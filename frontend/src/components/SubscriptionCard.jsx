import BrandLogo from './BrandLogo';
import { formatDate, formatMoney, daysUntil } from '../utils/date';
import { formatCategoryLabel } from '../utils/brands';

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
  onCancelGuide,
  onConvertTrial,
  priceIncrease,
}) {
  const isTrial = subscription.isFreeTrial;
  const deadlineDate = isTrial
    ? subscription.cancellationDeadline || subscription.trialEndDate || subscription.nextRenewalDate
    : subscription.nextRenewalDate;

  const days = daysUntil(deadlineDate);
  const soon = subscription.status === 'active' && days >= 0 && days <= 7;
  const overdue = subscription.status === 'active' && days < 0;
  const isDifferentCurrency = baseCurrency && subscription.currency !== baseCurrency && subscription.convertedAmount;

  return (
    <div className={`group flex items-center justify-between gap-4 border-b border-line px-2 py-3.5 transition-colors hover:bg-paper/40 last:border-b-0 ${isTrial ? 'bg-amber-light/10' : ''}`}>
      <div className="flex min-w-0 items-center gap-3.5">
        <BrandLogo name={subscription.name} category={subscription.category} size="md" />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate font-medium text-ink">{subscription.name}</p>

            {isTrial ? (
              <span className="rounded bg-amber-light border border-amber/40 px-1.5 py-0.5 text-[11px] font-bold text-amber tracking-wide flex items-center gap-1">
                <span>🛡️</span>
                <span>TRIAL</span>
              </span>
            ) : (
              <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-ink/60 border border-stone-200/60">
                {formatCategoryLabel(subscription.category)}
              </span>
            )}

            <span
              className={`rounded border px-1.5 py-0.5 text-xs font-medium ${
                STATUS_BADGE[subscription.status] || STATUS_BADGE.active
              }`}
            >
              {subscription.status}
            </span>

            {/* Trial Sentinel Urgency Badges */}
            {isTrial && subscription.status === 'active' && (
              <span
                className={`rounded border px-1.5 py-0.5 text-xs font-bold ${
                  days <= 1
                    ? 'bg-rust text-white border-rust animate-pulse'
                    : days <= 3
                    ? 'bg-amber text-white border-amber'
                    : 'bg-amber-light text-amber border-amber/40'
                }`}
              >
                {days < 0
                  ? `Deadline passed (${Math.abs(days)}d ago)`
                  : days === 0
                  ? '🚨 Deadline TODAY!'
                  : days === 1
                  ? '⚠️ Deadline tomorrow!'
                  : `⏳ Deadline in ${days}d`}
              </span>
            )}

            {!isTrial && soon && (
              <span className="rounded bg-amber-light border border-amber/30 px-1.5 py-0.5 text-xs font-medium text-amber">
                {days === 0 ? 'renews today' : `renews in ${days}d`}
              </span>
            )}

            {!isTrial && overdue && (
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

          <p className="mt-0.5 text-xs text-ink/60">
            {isTrial ? (
              <>
                <span>
                  Trial ends {formatDate(subscription.trialEndDate || subscription.nextRenewalDate)}
                </span>
                {subscription.postTrialAmount && (
                  <span className="ml-2 font-medium text-ink/80">
                    • Then {formatMoney(subscription.postTrialAmount, subscription.postTrialCurrency || subscription.currency)} / {subscription.billingCycle}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="capitalize">{subscription.billingCycle}</span>
                <span className="mx-1">•</span>
                <span>Next: {formatDate(subscription.nextRenewalDate)}</span>
              </>
            )}
            {subscription.notes && (
              <>
                <span className="mx-1">•</span>
                <span className="italic text-ink/50">{subscription.notes}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="text-right">
          <p className="tabular font-display text-base font-semibold text-ink">
            {formatMoney(subscription.amount, subscription.currency)}
          </p>
          {isDifferentCurrency ? (
            <p className="tabular text-[11px] font-medium text-ledger-dark" title={`Converted using live rates`}>
              ≈ {formatMoney(subscription.convertedAmount, baseCurrency)}
            </p>
          ) : (
            <p className="text-[11px] text-ink/50 capitalize">per {subscription.billingCycle}</p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-80 transition-opacity group-hover:opacity-100">
          {/* Trial Sentinel Convert Button */}
          {isTrial && subscription.status === 'active' && onConvertTrial && (
            <button
              onClick={() => onConvertTrial(subscription)}
              className="rounded-xs border border-ledger/30 bg-ledger-light px-2 py-1 text-xs font-semibold text-ledger-dark hover:bg-ledger hover:text-white transition-colors cursor-pointer"
              title="Convert this trial into an active paid subscription"
            >
              Keep & Convert
            </button>
          )}

          {/* Cancellation Guide Button */}
          {onCancelGuide && subscription.status === 'active' && (
            <button
              onClick={() => onCancelGuide(subscription)}
              className="rounded-xs border border-line bg-paper px-2 py-1 text-xs font-medium text-ink hover:bg-line/40 transition-colors cursor-pointer"
              title="How to cancel this subscription (direct link & instructions)"
            >
              Cancel Guide
            </button>
          )}

          {/* Payment Receipts History Button */}
          {onViewPayments && (
            <button
              onClick={() => onViewPayments(subscription)}
              className="rounded-xs border border-line bg-paper px-2 py-1 text-xs font-medium text-ink hover:bg-line/40 transition-colors cursor-pointer"
              title="View payment receipt history for this subscription"
            >
              Receipts
            </button>
          )}

          {/* Mark as Paid / Confirm Payment Button */}
          {onConfirmPayment && subscription.status === 'active' && (
            <button
              onClick={() => onConfirmPayment(subscription)}
              className="rounded-xs border border-ledger/40 bg-ledger/10 px-2 py-1 text-xs font-semibold text-ledger hover:bg-ledger hover:text-white transition-colors cursor-pointer"
              title="Record that you paid this renewal"
            >
              ✓ Paid
            </button>
          )}

          {/* Advance renewal by 1 cycle */}
          {subscription.status === 'active' && onAdvance && !isTrial && (
            <button
              onClick={() => onAdvance(subscription)}
              className="rounded-xs border border-line px-2 py-1 text-xs text-ink/60 hover:border-line hover:text-ink hover:bg-paper transition-colors cursor-pointer"
              title="Skip or advance next renewal by one cycle without logging payment"
            >
              +1 cycle
            </button>
          )}

          <button
            onClick={() => onEdit(subscription)}
            className="rounded-xs border border-line px-2 py-1 text-xs text-ink/60 hover:border-line hover:text-ink hover:bg-paper transition-colors cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(subscription)}
            className="rounded-xs border border-transparent px-2 py-1 text-xs text-rust/70 hover:border-rust/20 hover:bg-rust-light hover:text-rust transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
