import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { formatMoney } from '../utils/date';

const COLORS = {
  line: '#1F6F54',
  fill: '#EBF3F0',
  grid: '#D9DEDA',
  axis: '#16231F',
  average: '#C77D2B',
};

function TrendTooltip({ active, payload, label, currency = 'USD' }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="border border-line bg-white px-3 py-2 shadow-sm rounded-sm text-xs">
      <p className="font-display font-semibold">{label}</p>
      <p className="tabular mt-1 font-medium text-ink">
        Spend: {formatMoney(point.total, currency)}
      </p>
      {point.delta !== null && (
        <p className="tabular text-ink/60 mt-0.5">
          MoM change:{' '}
          <span className={point.delta > 0 ? 'text-rust font-medium' : point.delta < 0 ? 'text-ledger font-medium' : 'text-ink/60'}>
            {point.delta > 0 ? '+' : ''}{formatMoney(point.delta, currency)}
            {point.deltaPercent !== null ? ` (${point.deltaPercent > 0 ? '+' : ''}${point.deltaPercent}%)` : ''}
          </span>
        </p>
      )}
    </div>
  );
}

export default function TrendChart({
  months = [],
  summary = null,
  currency = 'USD',
  timeframe = 12,
  onTimeframeChange = null,
}) {
  if (!months || months.length === 0) return null;

  const data = months.map((m, i) => {
    const prev = i === 0 ? null : months[i - 1].total;
    const delta = prev !== null ? Number((m.total - prev).toFixed(2)) : null;
    const deltaPercent = prev !== null && prev > 0 ? Number(((delta / prev) * 100).toFixed(1)) : null;
    const monthLabel = m.label || m.month || '';
    return {
      ...m,
      label: monthLabel,
      shortLabel: monthLabel ? monthLabel.split(' ')[0] : '',
      delta,
      deltaPercent,
    };
  });

  const average =
    summary?.average ??
    data.reduce((sum, m) => sum + m.total, 0) / data.length;

  const netDelta = summary?.netDelta ?? (data.length > 1 ? Number((data[data.length - 1].total - data[0].total).toFixed(2)) : 0);
  const netDeltaPercent = summary?.netDeltaPercent ?? 0;
  const peakMonth = summary?.peakMonth ?? data.reduce((max, p) => (p.total > max.total ? p : max), data[0]);

  return (
    <div className="mt-3 border border-line bg-white p-4 shadow-2xs">
      {/* KPI strip */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-3">
        <div>
          <span className="text-xs text-ink/50">Average monthly</span>
          <p className="tabular font-display text-lg font-semibold text-ink">
            {formatMoney(average, currency)}
          </p>
        </div>

        <div>
          <span className="text-xs text-ink/50">Net change ({timeframe}m)</span>
          <p className={`tabular font-display text-lg font-semibold ${netDelta > 0 ? 'text-rust' : netDelta < 0 ? 'text-ledger' : 'text-ink'}`}>
            {netDelta > 0 ? '+' : ''}{formatMoney(netDelta, currency)}
            <span className="text-xs font-normal text-ink/50 ml-1">
              ({netDeltaPercent > 0 ? '+' : ''}{netDeltaPercent}%)
            </span>
          </p>
        </div>

        <div>
          <span className="text-xs text-ink/50">Peak month</span>
          <p className="tabular font-display text-lg font-semibold text-ink">
            {formatMoney(peakMonth.total, currency)}
            <span className="text-xs font-normal text-ink/50 ml-1">
              ({peakMonth.label || peakMonth.month})
            </span>
          </p>
        </div>

        {onTimeframeChange && (
          <div className="flex items-center gap-1 self-center text-xs">
            <span className="text-ink/40 mr-1">Range:</span>
            {[6, 12, 24].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => onTimeframeChange(tf)}
                className={`px-2 py-0.5 rounded-sm border ${
                  timeframe === tf
                    ? 'bg-paper font-semibold text-ledger border-ledger/40'
                    : 'text-ink/60 border-line hover:bg-paper/40'
                }`}
              >
                {tf}m
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.line} stopOpacity={0.25} />
                <stop offset="95%" stopColor={COLORS.line} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="shortLabel"
              tick={{ fontSize: 12, fill: COLORS.axis, opacity: 0.5 }}
              tickLine={false}
              axisLine={{ stroke: COLORS.grid }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: COLORS.axis, opacity: 0.5 }}
              tickLine={false}
              axisLine={false}
              width={64}
              tickFormatter={(v) => formatMoney(v, currency).replace('.00', '')}
            />
            <Tooltip content={<TrendTooltip currency={currency} />} cursor={{ stroke: COLORS.grid }} />
            <ReferenceLine
              y={average}
              stroke={COLORS.average}
              strokeDasharray="4 4"
              label={{
                value: 'avg',
                position: 'right',
                fill: COLORS.average,
                fontSize: 10,
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              name="Spend"
              stroke={COLORS.line}
              strokeWidth={2}
              fill="url(#spendGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
