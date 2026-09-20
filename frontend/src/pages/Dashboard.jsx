import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import StatCard from '../components/StatCard';
import ForecastChart from '../components/ForecastChart';
import { formatDate, formatMoney, daysUntil } from '../utils/date';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.dashboardSummary().then(setSummary).catch((err) => setError(err.message));
    api.dashboardForecast(12).then(setForecast).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-sm text-rust">{error}</p>;
  if (!summary) return <p className="text-sm text-ink/50">Loading…</p>;

  const maxCategory = Math.max(1, ...summary.categoryBreakdown.map((c) => c.monthlySpend));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold">Overview</h1>
        <p className="mt-1 text-sm text-ink/60">What your subscriptions are costing you, at a glance.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Monthly spend" value={formatMoney(summary.totalMonthly)} tone="ledger" />
        <StatCard label="Yearly spend" value={formatMoney(summary.totalYearly)} />
        <StatCard label="Active subscriptions" value={summary.activeCount} />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">Renewing soon</h2>
            <Link to="/subscriptions" className="text-sm text-ledger hover:underline">See all</Link>
          </div>
          <div className="mt-3 border border-line bg-white">
            {summary.upcomingRenewals.length === 0 && (
              <p className="px-4 py-6 text-sm text-ink/50">Nothing renewing in the next two weeks.</p>
            )}
            {summary.upcomingRenewals.map((s) => (
              <div key={s.id} className="flex items-center justify-between border-b border-line px-4 py-3 last:border-b-0">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-ink/50">{formatDate(s.nextRenewalDate)} · in {daysUntil(s.nextRenewalDate)}d</p>
                </div>
                <p className="tabular font-display">{formatMoney(s.amount, s.currency)}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Spend by category</h2>
          <div className="mt-3 space-y-3 border border-line bg-white px-4 py-4">
            {summary.categoryBreakdown.length === 0 && (
              <p className="text-sm text-ink/50">Add a subscription to see the breakdown.</p>
            )}
            {summary.categoryBreakdown.map((c) => (
              <div key={c.category}>
                <div className="flex items-baseline justify-between text-sm">
                  <span>{c.category}</span>
                  <span className="tabular text-ink/60">{formatMoney(c.monthlySpend)}/mo</span>
                </div>
                <div className="mt-1 h-1.5 w-full bg-ledger-light">
                  <div
                    className="h-1.5 bg-ledger"
                    style={{ width: `${(c.monthlySpend / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {forecast && (
        <section>
          <h2 className="font-display text-lg font-semibold">12-month forecast</h2>
          <p className="mt-1 text-sm text-ink/60">
            What's actually due each month, based on real renewal dates — not an average.
          </p>
          <ForecastChart months={forecast.months} />
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
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-ink/50">{formatDate(p.changedAt)}</p>
                </div>
                <p className="tabular text-sm">
                  <span className="text-ink/50 line-through">{formatMoney(p.oldAmount, p.currency)}</span>
                  {' → '}
                  <span className="font-display font-semibold text-rust">{formatMoney(p.newAmount, p.currency)}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
