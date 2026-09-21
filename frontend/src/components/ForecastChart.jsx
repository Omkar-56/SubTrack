import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatMoney } from '../utils/date';

const COLORS = {
  due: '#1F6F54',
  cumulative: '#C77D2B',
  grid: '#D9DEDA',
  axis: '#16231F',
};

function ForecastTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="max-w-xs border border-line bg-white px-3 py-2 shadow-sm">
      <p className="font-display text-sm font-semibold">{label}</p>
      <p className="tabular mt-1 text-sm" style={{ color: COLORS.due }}>
        Due this month: {formatMoney(point.total)}
      </p>
      <p className="tabular text-sm" style={{ color: COLORS.cumulative }}>
        Cumulative: {formatMoney(point.cumulative)}
      </p>
      {point.charges.length > 0 && (
        <ul className="mt-2 space-y-0.5 border-t border-line pt-2">
          {point.charges.map((c, i) => (
            <li key={`${c.name}-${i}`} className="flex justify-between gap-4 text-xs text-ink/60">
              <span className="truncate">{c.name}</span>
              <span className="tabular shrink-0">{formatMoney(c.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ForecastChart({ months }) {
  const [showCumulative, setShowCumulative] = useState(false);

  const data = useMemo(() => {
    let running = 0;
    return (months || []).map((m) => {
      running += m.total;
      return {
        ...m,
        shortLabel: m.label.split(' ')[0],
        cumulative: Number(running.toFixed(2)),
      };
    });
  }, [months]);

  if (data.length === 0) return null;

  return (
    <div className="mt-3 border border-line bg-white px-4 pb-4 pt-5">
      <div className="mb-2 flex justify-end">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/60">
          <input
            type="checkbox"
            checked={showCumulative}
            onChange={(e) => setShowCumulative(e.target.checked)}
            className="accent-amber"
          />
          Show cumulative total
        </label>
      </div>

      <ResponsiveContainer width="100%" height={260}>
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
            width={56}
            tickFormatter={(v) => formatMoney(v).replace('.00', '')}
          />
          <Tooltip content={<ForecastTooltip />} cursor={{ stroke: COLORS.grid }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="total"
            name="Due that month"
            stroke={COLORS.due}
            strokeWidth={2}
            dot={{ r: 3, fill: COLORS.due }}
            activeDot={{ r: 5 }}
          />
          {showCumulative && (
            <Line
              type="monotone"
              dataKey="cumulative"
              name="Cumulative"
              stroke={COLORS.cumulative}
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 5 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <p className="mt-2 text-xs text-ink/40">
        Hover any month to see exactly which subscriptions fall due in it.
      </p>
    </div>
  );
}
