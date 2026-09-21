import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ForecastChart from '../components/ForecastChart';
import TrendChart from '../components/TrendChart';
import BrandLogo from '../components/BrandLogo';
import { formatDate, formatMoney, daysUntil } from '../utils/date';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [trend, setTrend] = useState(null);
  const [error, setError] = useState('');

  const currentCurrency = user?.baseCurrency || 'USD';

  useEffect(() => {
    if (!user) return;
    api.dashboardSummary(14, currentCurrency).then(setSummary).catch((err) => setError(err.message));
    api.dashboardForecast(12, currentCurrency).then(setForecast).catch((err) => setError(err.message));
    api.dashboardTrend(12, currentCurrency).then(setTrend).catch((err) => setError(err.message));
  }, [user, currentCurrency]);

  if (error) return <p className="text-sm text-rust">{error}</p>;
  if (!summary) return <p className="text-sm text-ink/50">Loading…</p>;

  const baseCurrency = summary.baseCurrency || currentCurrency;
  const maxCategory = Math.max(1, ...summary.categoryBreakdown.map((c) => c.monthlySpend));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold">Overview</h1>
        <p className="mt-1 text-sm text-ink/60">
          What your subscriptions are costing you, normalized in{' '}
          <strong className="text-ink font-medium">{baseCurrency}</strong>.
        </p>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
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
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between border-b border-line px-4 py-3 last:border-b-0 hover:bg-paper/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <BrandLogo name={s.name} category={s.category} size="sm" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{s.name}</p>
                      <p className="text-xs text-ink/50">
                        {formatDate(s.nextRenewalDate)} · in {daysUntil(s.nextRenewalDate)}d
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="tabular font-display font-semibold">
                      {formatMoney(s.amount, s.currency)}
                    </p>
                    {isDifferentCurrency && (
                      <p className="tabular text-[11px] text-ink/40">
                        ≈ {formatMoney(s.convertedAmount, baseCurrency)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Spend by category</h2>
          <div className="mt-3 space-y-3 border border-line bg-white px-4 py-4 shadow-2xs">
            {summary.categoryBreakdown.length === 0 && (
              <p className="text-sm text-ink/50">Add a subscription to see the breakdown.</p>
            )}
            {summary.categoryBreakdown.map((c) => (
              <div key={c.category}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="capitalize">{c.category}</span>
                  <span className="tabular text-ink/60">
                    {formatMoney(c.monthlySpend, baseCurrency)}/mo
                  </span>
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

      {trend && (
        <section>
          <h2 className="font-display text-lg font-semibold">Spend trend</h2>
          <p className="mt-1 text-sm text-ink/60">
            What your recurring monthly spend in {baseCurrency} has been over the past year.
          </p>
          <TrendChart months={trend.months} currency={baseCurrency} />
        </section>
      )}

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
    </div>
  );
}
