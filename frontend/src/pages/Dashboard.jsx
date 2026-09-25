import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ForecastChart from '../components/ForecastChart';
import CategoryBreakdown from '../components/CategoryBreakdown';
import BrandLogo from '../components/BrandLogo';
import PaymentConfirmModal from '../components/PaymentConfirmModal';
import CancellationGuideModal from '../components/CancellationGuideModal';
import { formatDate, formatMoney, daysUntil } from '../utils/date';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [payingSub, setPayingSub] = useState(null);
  const [guideSub, setGuideSub] = useState(null);
  const [error, setError] = useState('');

  const currentCurrency = user?.baseCurrency || 'USD';

  function refresh() {
    if (!user) return;
    api.dashboardSummary(14, currentCurrency).then(setSummary).catch((err) => setError(err.message));
    api.dashboardForecast(12, currentCurrency).then(setForecast).catch((err) => setError(err.message));
  }

  useEffect(() => {
    refresh();
  }, [user, currentCurrency]);

  useEffect(() => {
    function onExternalRefresh() {
      refresh();
    }
    window.addEventListener('subtrack:refresh', onExternalRefresh);
    return () => window.removeEventListener('subtrack:refresh', onExternalRefresh);
  }, [user, currentCurrency]);

  async function handleConfirmPayment(paymentData) {
    if (!payingSub) return;
    await api.confirmPayment(payingSub.id, paymentData);
    setPayingSub(null);
    refresh();
  }

  async function handleConvertTrial(sub) {
    try {
      await api.convertTrial(sub.id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStatusChange(subscription, newStatus) {
    try {
      await api.updateSubscription(subscription.id, {
        name: subscription.name,
        category: subscription.category || 'other',
        amount: Number(subscription.amount),
        currency: subscription.currency || 'USD',
        billingCycle: subscription.billingCycle || 'monthly',
        nextRenewalDate: String(subscription.nextRenewalDate).slice(0, 10),
        status: newStatus,
        notes: subscription.notes || '',
      });
      setGuideSub(null);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <p className="text-sm text-rust">{error}</p>;
  if (!summary) return <p className="text-sm text-ink/50">Loading…</p>;

  const baseCurrency = summary.baseCurrency || currentCurrency;
  const pendingReminders = summary.pendingReminders || [];
  const activeTrials = summary.activeTrials || [];
  const savings = summary.savings || {
    monthlySaved: 0,
    yearlySaved: 0,
    cancelledCount: 0,
    pausedCount: 0,
  };

  return (
    <div className="space-y-8">
      {/* Free-Trial Expiry Sentinel Banner */}
      {activeTrials.length > 0 && (
        <div className="rounded-md border border-amber/40 bg-amber-light/40 p-4 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber text-white text-base shadow-xs">
                🛡️
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-bold text-ink">
                    Free-Trial Expiry Sentinel ({activeTrials.length} Active {activeTrials.length === 1 ? 'Trial' : 'Trials'})
                  </h3>
                  <span className="rounded bg-amber px-1.5 py-0.2 text-[10px] font-bold text-white uppercase tracking-wide">
                    Live Sentinel
                  </span>
                </div>
                <p className="text-xs text-ink/75">
                  Cancellation deadlines detected. Cancel before the deadline to avoid auto-converting to full-price recurring charges.
                </p>
              </div>
            </div>

            <Link
              to="/subscriptions"
              className="text-xs font-semibold text-amber-dark hover:underline flex items-center gap-1"
            >
              <span>Manage all trials</span>
              <span>→</span>
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-amber/25">
            {activeTrials.map((t) => {
              const deadline = t.effectiveDeadline;
              const days = t.daysLeft;
              const isUrgent = days <= 2;

              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded bg-white/90 border border-amber/30 p-3 shadow-2xs hover:bg-white transition-colors gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BrandLogo name={t.name} category={t.category} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-xs text-ink truncate">{t.name}</p>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                            isUrgent ? 'bg-rust text-white animate-pulse' : 'bg-amber-light text-amber-dark'
                          }`}
                        >
                          {days <= 0 ? 'Cutoff TODAY!' : `${days}d left`}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink/65 mt-0.5">
                        Cancel cutoff: <strong>{formatDate(deadline)}</strong>
                      </p>
                      <p className="text-[10px] text-ink/50 mt-0.2">
                        Post-trial: {formatMoney(t.postTrialAmount || t.amount, t.postTrialCurrency || t.currency)}/{t.billingCycle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setGuideSub(t)}
                      className="rounded bg-rust px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-rust-dark transition-colors cursor-pointer"
                    >
                      Cancel Guide
                    </button>
                    <button
                      onClick={() => handleConvertTrial(t)}
                      className="rounded border border-line bg-paper px-2 py-1 text-xs font-medium text-ink/70 hover:bg-ledger-light hover:text-ledger-dark transition-colors cursor-pointer"
                      title="Keep this subscription and convert to regular cycle"
                    >
                      Keep Sub
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actionable Due Reminders Banner */}
      {pendingReminders.length > 0 && (
        <div className="rounded-md border border-ledger/30 bg-ledger-light/50 p-4 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ledger text-white text-sm">
                🔔
              </span>
              <div>
                <h3 className="font-display text-sm font-semibold text-ink">
                  {pendingReminders.length} Renewal Reminder{pendingReminders.length === 1 ? '' : 's'} Due
                </h3>
                <p className="text-xs text-ink/70">
                  Payments due shortly. Confirm once charged to advance cycles and log payment history.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {pendingReminders.slice(0, 2).map((r) => (
                <button
                  key={r.id}
                  onClick={() =>
                    setPayingSub({
                      id: r.subscriptionId,
                      name: r.subscriptionName,
                      category: r.category,
                      amount: r.amount,
                      currency: r.currency,
                      billingCycle: r.billingCycle,
                      nextRenewalDate: r.dueDate,
                    })
                  }
                  className="rounded bg-white border border-ledger/40 px-3 py-1 text-xs font-medium text-ledger-dark hover:bg-ledger hover:text-white transition-colors shadow-2xs cursor-pointer"
                >
                  ✓ Confirm {r.subscriptionName} ({formatMoney(r.amount, r.currency)})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ROW 1: Overview (left) and Spend by Category (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Overview Header & Stat Cards */}
        <section className="lg:col-span-6">
          <div>
            <div className="flex items-baseline justify-between">
              <h1 className="font-display text-xl sm:text-2xl font-semibold">Overview</h1>
              <span className="text-xs text-ink/50">
                Normalized in <strong className="text-ink font-medium">{baseCurrency}</strong>
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-ink/60">
              Live summary of your active commitments and financial savings.
            </p>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start">
            <StatCard
              label="Monthly commitment"
              value={formatMoney(summary.totalMonthly, baseCurrency)}
              sublabel="Active recurring charges"
              tone="ledger"
            />
            <StatCard
              label="Yearly run rate"
              value={formatMoney(summary.totalYearly, baseCurrency)}
              sublabel="Projected 12-month total"
            />
            <StatCard
              label="Active subscriptions"
              value={summary.activeCount}
              sublabel={`${summary.trialsCount || 0} active trial${summary.trialsCount === 1 ? '' : 's'}`}
            />
            <StatCard
              label="Monthly savings"
              value={formatMoney(savings.monthlySaved, baseCurrency)}
              sublabel={`≈ ${formatMoney(savings.yearlySaved, baseCurrency)}/yr (${savings.cancelledCount} cancelled, ${savings.pausedCount} paused)`}
              tone={savings.monthlySaved > 0 ? 'emerald' : 'default'}
            />
          </div>
        </section>

        {/* Right Side: Spend by category with Interactive Donut Chart */}
        <section className="lg:col-span-6">
          <div className="flex justify-between mb-1">
            <h2 className="font-display text-lg sm:text-xl font-semibold">Spend by category</h2>
            <span className="text-xs text-ink/50">
              {summary.categoryBreakdown.length} {summary.categoryBreakdown.length === 1 ? 'category' : 'categories'}
            </span>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-ink/60">
            See how much you spend on each category.
          </p>
          <CategoryBreakdown
            categories={summary.categoryBreakdown}
            totalMonthly={summary.totalMonthly}
            currency={baseCurrency}
          />
        </section>
      </div>

      {/* ROW 2: 12-month forecast (left) and Renewing soon (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Side: 12-month forecast */}
        <section className="lg:col-span-8">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg sm:text-xl font-semibold">12-month forecast</h2>
            <span className="text-xs text-ink/50">Normalized in {baseCurrency}</span>
          </div>
          {forecast ? (
            <ForecastChart months={forecast.months} currency={baseCurrency} />
          ) : (
            <div className="mt-3 border border-line bg-white p-8 text-center text-sm text-ink/50 shadow-2xs">
              Calculating forecast…
            </div>
          )}
        </section>

        {/* Right Side: Renewing soon */}
        <section className="lg:col-span-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg sm:text-xl font-semibold">Renewing soon</h2>
            <Link to="/subscriptions" className="text-xs sm:text-sm text-ledger hover:underline font-medium">
              See all →
            </Link>
          </div>
          <div className="mt-3 border border-line bg-white shadow-2xs">
            {summary.upcomingRenewals.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-ink/50">Nothing renewing in the next two weeks.</p>
            )}
            {summary.upcomingRenewals.map((s) => {
              const isDifferentCurrency = s.currency !== baseCurrency && s.convertedAmount;
              const days = daysUntil(s.nextRenewalDate);
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between border-b border-line px-4 py-3 last:border-b-0 hover:bg-paper/30 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <BrandLogo name={s.name} category={s.category} size="sm" />
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{s.name}</p>
                      <p className="text-[11px] sm:text-xs text-ink/50">
                        {formatDate(s.nextRenewalDate)} · in {days}d
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right">
                      <p className="tabular font-display font-semibold text-xs sm:text-sm">
                        {formatMoney(s.amount, s.currency)}
                      </p>
                      {isDifferentCurrency && (
                        <p className="tabular text-[10px] sm:text-[11px] text-ink/40">
                          ≈ {formatMoney(s.convertedAmount, baseCurrency)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setPayingSub(s)}
                      className="rounded bg-ledger-light border border-ledger/30 px-2.5 py-1 text-[11px] font-semibold text-ledger-dark hover:bg-ledger hover:text-white transition-colors cursor-pointer"
                      title="Confirm payment & roll over to next billing cycle"
                    >
                      ✓ Paid
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {summary.recentPriceIncreases?.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold">Price alerts</h2>
          <p className="mt-1 text-sm text-ink/60">
            These went up in the last 30 days — worth a second look.
          </p>
        </section>
      )}

      {payingSub && (
        <PaymentConfirmModal
          subscription={payingSub}
          onConfirm={handleConfirmPayment}
          onCancel={() => setPayingSub(null)}
        />
      )}

      {guideSub && (
        <CancellationGuideModal
          subscription={guideSub}
          onClose={() => setGuideSub(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
