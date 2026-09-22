import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ForecastChart from '../components/ForecastChart';
import CategoryBreakdown from '../components/CategoryBreakdown';
import BrandLogo from '../components/BrandLogo';
import PaymentConfirmModal from '../components/PaymentConfirmModal';
import { formatDate, formatMoney, daysUntil } from '../utils/date';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [payingSub, setPayingSub] = useState(null);
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

  if (error) return <p className="text-sm text-rust">{error}</p>;
  if (!summary) return <p className="text-sm text-ink/50">Loading…</p>;

  const baseCurrency = summary.baseCurrency || currentCurrency;
  const pendingReminders = summary.pendingReminders || [];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold">Overview</h1>
        <p className="mt-1 text-sm text-ink/60">
          What your subscriptions are costing you, normalized in real-time in{' '}
          <strong className="text-ink font-medium">{baseCurrency}</strong>.
        </p>
      </div>

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
                  className="rounded bg-white border border-ledger/40 px-3 py-1 text-xs font-medium text-ledger-dark hover:bg-ledger hover:text-white transition-colors shadow-2xs"
                >
                  ✓ Confirm {r.subscriptionName} ({formatMoney(r.amount, r.currency)})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Monthly spend"
          value={formatMoney(summary.totalMonthly, baseCurrency)}
          tone="ledger"
        />
        <StatCard
          label="Yearly spend"
          value={formatMoney(summary.totalYearly, baseCurrency)}
        />
        <StatCard label="Active subscriptions" value={summary.activeCount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Renewing soon */}
        <section className="lg:col-span-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">Renewing soon</h2>
            <Link to="/subscriptions" className="text-sm text-ledger hover:underline">See all</Link>
          </div>
          <div className="mt-3 border border-line bg-white shadow-2xs">
            {summary.upcomingRenewals.length === 0 && (
              <p className="px-4 py-6 text-sm text-ink/50">Nothing renewing in the next two weeks.</p>
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
                      <p className="font-medium truncate">{s.name}</p>
                      <p className="text-xs text-ink/50">
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
                        <p className="tabular text-[11px] text-ink/40">
                          ≈ {formatMoney(s.convertedAmount, baseCurrency)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setPayingSub(s)}
                      className="rounded bg-ledger-light border border-ledger/30 px-2 py-1 text-[11px] font-semibold text-ledger-dark hover:bg-ledger hover:text-white transition-colors"
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

        {/* Spend by category with Interactive Donut Chart */}
        <section className="lg:col-span-7">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">Spend by category</h2>
            <span className="text-xs text-ink/50">
              {summary.categoryBreakdown.length} {summary.categoryBreakdown.length === 1 ? 'category' : 'categories'}
            </span>
          </div>
          <CategoryBreakdown
            categories={summary.categoryBreakdown}
            totalMonthly={summary.totalMonthly}
            currency={baseCurrency}
          />
        </section>
      </div>

      {forecast && (
        <section>
          <h2 className="font-display text-lg font-semibold">12-month forecast</h2>
          <p className="mt-1 text-sm text-ink/60">
            What's actually due each month in {baseCurrency}, based on real renewal dates.
          </p>
          <ForecastChart months={forecast.months} currency={baseCurrency} />
        </section>
      )}

      {summary.recentPriceIncreases.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold">Price alerts</h2>
          <p className="mt-1 text-sm text-ink/60">
            These went up in the last 30 days — worth a second look.
          </p>
          <div className="mt-3 border border-rust/30 bg-rust-light">
            {summary.recentPriceIncreases.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-rust/20 px-4 py-3 last:border-b-0">
                <div className="flex items-center gap-3 min-w-0">
                  <BrandLogo name={p.name} category="other" size="sm" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-xs text-ink/50">{formatDate(p.changedAt)}</p>
                  </div>
                </div>
                <p className="tabular text-sm shrink-0">
                  <span className="text-ink/50 line-through">{formatMoney(p.oldAmount, p.currency)}</span>
                  {' → '}
                  <span className="font-display font-semibold text-rust">{formatMoney(p.newAmount, p.currency)}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Payment Confirmation Modal */}
      {payingSub && (
        <PaymentConfirmModal
          subscription={payingSub}
          onConfirm={handleConfirmPayment}
          onCancel={() => setPayingSub(null)}
        />
      )}
    </div>
  );
}
