import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { formatMoney } from '../utils/date';

const COLORS = {
  line: '#1F6F54',
  grid: '#E2E8F0',
  axis: '#16231F',
  average: '#C77D2B',
};

function TrendTooltip({ active, payload, label, currency = 'USD' }) {
  if (!active || !payload?.length) return null;
  const { total, delta, deltaPercent } = payload[0].payload;

  return (
    <div className="rounded border border-line bg-white px-3.5 py-2.5 shadow-md">
      <p className="font-display text-sm font-semibold text-ink">{label}</p>
      <p className="tabular mt-1 font-display text-base font-bold" style={{ color: COLORS.line }}>
        {formatMoney(total, currency)}
        <span className="text-xs font-normal text-ink/50">/mo</span>
      </p>
      {delta !== null && (
        <div className="mt-1.5 flex items-center gap-1.5 border-t border-line/60 pt-1.5">
          <span
            className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${
              delta > 0
                ? 'bg-rust-light text-rust border border-rust/30'
                : delta < 0
                ? 'bg-ledger-light text-ledger-dark border border-ledger/20'
                : 'bg-stone-100 text-ink/50'
            }`}
          >
            {delta > 0 ? `▲ +${formatMoney(delta, currency)}` : delta < 0 ? `▼ ${formatMoney(delta, currency)}` : 'No change'}
            {deltaPercent !== null && ` (${delta > 0 ? '+' : ''}${deltaPercent}%)`}
          </span>
          <span className="text-[11px] text-ink/40">vs prev month</span>
        </div>
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
    return {
      ...m,
      shortLabel: m.label.split(' ')[0],
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
      {/* Top Header: Metrics & Timeframe Switcher */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-3.5">
        {/* Metric Badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Net Growth */}
          <div className="flex items-center gap-1.5 rounded-sm bg-paper px-2.5 py-1 border border-line/70">
            <span className="text-ink/50">Change ({timeframe}M):</span>
            <span
              className={`tabular font-semibold ${
                netDelta > 0 ? 'text-rust' : netDelta < 0 ? 'text-ledger-dark' : 'text-ink/60'
              }`}
            >
              {netDelta > 0 ? '+' : ''}{formatMoney(netDelta, currency)}/mo
              {netDeltaPercent !== 0 && ` (${netDelta > 0 ? '+' : ''}${netDeltaPercent}%)`}
            </span>
          </div>

          {/* Average */}
          <div className="flex items-center gap-1.5 rounded-sm bg-paper px-2.5 py-1 border border-line/70">
            <span className="text-ink/50">Period Avg:</span>
            <span className="tabular font-semibold text-ink">
              {formatMoney(average, currency)}/mo
            </span>
          </div>

          {/* Peak Month */}
          {peakMonth && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-sm bg-paper px-2.5 py-1 border border-line/70">
              <span className="text-ink/50">Peak:</span>
              <span className="tabular font-medium text-ink">
                {formatMoney(peakMonth.total, currency)} ({peakMonth.label})
              </span>
            </div>
          )}
        </div>

        {/* Timeframe selector pills */}
        {onTimeframeChange && (
          <div className="inline-flex rounded-sm bg-paper p-0.5 text-xs font-medium border border-line">
            {[
              { id: 3, label: '3M' },
              { id: 6, label: '6M' },
              { id: 12, label: '12M' },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => onTimeframeChange(tf.id)}
                className={`rounded-xs px-2.5 py-1 transition-all ${
                  timeframe === tf.id
                    ? 'bg-white font-semibold text-ink shadow-2xs'
                    : 'text-ink/60 hover:text-ink'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.line} stopOpacity={0.22} />
              <stop offset="95%" stopColor={COLORS.line} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="shortLabel"
            tick={{ fontSize: 11, fill: COLORS.axis, opacity: 0.55 }}
            tickLine={false}
            axisLine={{ stroke: COLORS.grid }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: COLORS.axis, opacity: 0.55 }}
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
            label={{ value: 'avg', position: 'insideTopRight', fontSize: 11, fill: COLORS.average }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke={COLORS.line}
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#spendGradient)"
            dot={{ r: 3, fill: COLORS.line, strokeWidth: 1, stroke: '#ffffff' }}
            activeDot={{ r: 5, fill: COLORS.line }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
