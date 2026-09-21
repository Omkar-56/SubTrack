import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { formatMoney } from '../utils/date';

const COLORS = {
  line: '#1F6F54',
  grid: '#D9DEDA',
  axis: '#16231F',
  average: '#C77D2B',
};

function TrendTooltip({ active, payload, label, currency = 'USD' }) {
  if (!active || !payload?.length) return null;
  const { total, delta } = payload[0].payload;

  return (
    <div className="border border-line bg-white px-3 py-2 shadow-sm rounded-sm">
      <p className="font-display text-sm font-semibold">{label}</p>
      <p className="tabular mt-1 text-sm font-medium" style={{ color: COLORS.line }}>
        {formatMoney(total, currency)}/mo
      </p>
      {delta !== null && (
        <p className={`tabular text-xs ${delta > 0 ? 'text-rust' : delta < 0 ? 'text-ledger' : 'text-ink/40'}`}>
          {delta > 0 ? '+' : ''}{formatMoney(delta, currency)} vs. previous month
        </p>
      )}
    </div>
  );
}

export default function TrendChart({ months, currency = 'USD' }) {
  if (!months || months.length === 0) return null;

  const data = months.map((m, i) => ({
    ...m,
    shortLabel: m.label.split(' ')[0],
    delta: i === 0 ? null : Number((m.total - months[i - 1].total).toFixed(2)),
  }));

  const average = data.reduce((sum, m) => sum + m.total, 0) / data.length;

  return (
    <div className="mt-3 border border-line bg-white px-4 pb-4 pt-5 shadow-2xs">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
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
            label={{ value: 'avg', position: 'right', fontSize: 11, fill: COLORS.average }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke={COLORS.line}
            strokeWidth={2}
            dot={{ r: 3, fill: COLORS.line }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
