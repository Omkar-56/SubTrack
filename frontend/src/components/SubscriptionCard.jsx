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
                {subscription.category}
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

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink/60">
            {isTrial ? (
              <>
                <span className="text-amber-dark font-medium">
                  Cutoff: <strong>{formatDate(deadlineDate)}</strong>
                </span>
                <span>·</span>
                <span>
                  Post-trial: <strong>{formatMoney(subscription.postTrialAmount || subscription.amount, subscription.postTrialCurrency || subscription.currency)}</strong>/{subscription.billingCycle === 'yearly' ? 'yr' : 'mo'}
                </span>
              </>
            ) : (
              <>
                <span className="capitalize">{subscription.billingCycle}</span>
                <span>·</span>
                <span>Next: <strong>{formatDate(subscription.nextRenewalDate)}</strong></span>
              </>
            )}

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
            {isTrial && Number(subscription.amount) === 0 ? (
              <span className="text-emerald-700 font-bold">FREE TRIAL</span>
            ) : (
              <>
                {formatMoney(subscription.amount, subscription.currency)}
                <span className="text-xs font-normal text-ink/50">
                  /{subscription.billingCycle === 'yearly' ? 'yr' : subscription.billingCycle === 'weekly' ? 'wk' : 'mo'}
                </span>
              </>
            )}
          </p>
          {isDifferentCurrency && (
            <p className="tabular text-[11px] text-ink/40">
              ≈ {formatMoney(subscription.convertedAmount, baseCurrency)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-90 transition-opacity">
          {/* Trial Convert to Active action */}
          {isTrial && subscription.status === 'active' && onConvertTrial && (
            <button
              onClick={() => onConvertTrial(subscription)}
              className="rounded bg-ledger-light border border-ledger/30 px-2 py-1 text-xs font-semibold text-ledger-dark hover:bg-ledger hover:text-white transition-colors shadow-2xs"
              title="Convert this free trial to a regular ongoing subscription"
            >
              ✓ Keep Sub
            </button>
          )}

          {/* Regular Confirm Payment button */}
          {!isTrial && subscription.status === 'active' && onConfirmPayment && (
            <button
              onClick={() => onConfirmPayment(subscription)}
              className="rounded bg-ledger-light border border-ledger/30 px-2 py-1 text-xs font-semibold text-ledger-dark hover:bg-ledger hover:text-white transition-colors shadow-2xs"
              title="Confirm you paid this cycle and roll over to the next due date"
            >
              ✓ Paid
            </button>
          )}

          {/* Cancellation Guide / Direct Link Assistant */}
          {subscription.status !== 'cancelled' && onCancelGuide && (
            <button
              onClick={() => onCancelGuide(subscription)}
              className={`rounded border px-2 py-1 text-xs font-medium transition-colors ${
                isTrial
                  ? 'border-rust/40 bg-rust-light text-rust hover:bg-rust hover:text-white'
                  : 'border-line bg-paper text-ink/70 hover:border-rust/40 hover:bg-rust-light hover:text-rust'
              }`}
              title={isTrial ? 'Cancel trial before deadline to avoid post-trial bill' : 'View direct cancellation link and instructions'}
            >
              Cancel Guide
            </button>
          )}

          {/* Receipts button */}
          {onViewPayments && !isTrial && (
            <button
              onClick={() => onViewPayments(subscription)}
              className="hidden sm:inline-block rounded px-2 py-1 text-xs font-medium text-ink/60 hover:bg-stone-100 hover:text-ink transition-colors"
              title="View past confirmed payments for this subscription"
            >
              Receipts
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
