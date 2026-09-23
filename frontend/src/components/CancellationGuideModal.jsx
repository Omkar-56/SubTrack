import { getCancellationGuide } from '../utils/cancellationGuides';
import BrandLogo from './BrandLogo';
import { formatMoney, formatDate } from '../utils/date';

export default function CancellationGuideModal({ subscription, onClose, onStatusChange }) {
  if (!subscription) return null;

  const guide = getCancellationGuide(subscription.name, subscription.category);
  const isTrial = Boolean(subscription.isFreeTrial);
  const deadline = isTrial
    ? subscription.cancellationDeadline || subscription.trialEndDate || subscription.nextRenewalDate
    : subscription.nextRenewalDate;
  const chargeAmount = isTrial && subscription.postTrialAmount !== null && subscription.postTrialAmount !== undefined
    ? subscription.postTrialAmount
    : subscription.amount;
  const chargeCurrency = isTrial && subscription.postTrialCurrency ? subscription.postTrialCurrency : subscription.currency;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-md border border-line bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <BrandLogo name={subscription.name} category={subscription.category} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-semibold text-ink">
                  How to Cancel {subscription.name}
                </h3>
                {isTrial ? (
                  <span className="rounded bg-amber-light px-2 py-0.5 text-[10px] font-bold text-amber border border-amber/30">
                    🛡️ Trial Cutoff
                  </span>
                ) : guide.difficulty ? (
                  <span className="rounded bg-paper px-2 py-0.5 text-[10px] font-medium text-ink/60 border border-line">
                    {guide.difficulty}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-ink/60 mt-0.5">
                {isTrial ? 'Cancel before: ' : 'Next renewal: '}
                <strong>{formatDate(deadline)}</strong> · Saving{' '}
                <strong className="text-ledger-dark">
                  {formatMoney(chargeAmount, chargeCurrency)}/{subscription.billingCycle || 'mo'}
                </strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-ink/40 hover:bg-stone-100 hover:text-ink transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Direct Link Banner */}
        <div className="mt-4 rounded-md border border-line/80 bg-paper/60 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-ink">
                {guide.isCustom ? 'Search Official Cancellation Portal' : 'Direct Account Cancellation Link'}
              </p>
              <p className="text-[11px] text-ink/60 mt-0.5">
                {guide.isCustom
                  ? `Search verified cancellation steps for ${subscription.name}`
                  : 'Opens directly to the subscription / billing settings page'}
              </p>
            </div>
            <a
              href={guide.directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-ink/80 transition-colors shrink-0"
            >
              <span>{guide.isCustom ? 'Search Guide' : 'Open Page'}</span>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="mt-5 space-y-2.5">
          <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-ink/50">
            Step-by-Step Instructions
          </h4>
          <ol className="space-y-2 text-xs text-ink/80">
            {guide.steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5 rounded bg-stone-50/60 p-2 border border-line/40">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[11px] font-bold text-ink">
                  {idx + 1}
                </span>
                <span className="mt-0.5 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Action Footer: Mark Cancelled in SubTrack */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-[11px] text-ink/50">
            Already cancelled with the provider? Update SubTrack:
          </p>

          <div className="flex items-center gap-2">
            {onStatusChange && subscription.status !== 'cancelled' && (
              <button
                onClick={() => {
                  onStatusChange(subscription, 'cancelled');
                  onClose();
                }}
                className="rounded border border-rust/40 bg-rust-light px-3 py-1.5 text-xs font-semibold text-rust hover:bg-rust hover:text-white transition-colors cursor-pointer"
              >
                Mark as Cancelled
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
