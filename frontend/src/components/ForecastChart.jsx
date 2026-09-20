import { formatMoney } from '../utils/date';

export default function ForecastChart({ months }) {
  if (!months || months.length === 0) return null;

  const max = Math.max(1, ...months.map((m) => m.total));
  const avg = months.reduce((sum, m) => sum + m.total, 0) / months.length;

  return (
    <div className="mt-3 border border-line bg-white px-5 pb-4 pt-6">
      <div className="flex items-end gap-2" style={{ height: '140px' }}>
        {months.map((m) => {
          const heightPct = (m.total / max) * 100;
          const isSpike = avg > 0 && m.total > avg * 1.3;
          return (
            <div key={m.month} className="flex flex-1 flex-col items-center justify-end" title={`${m.label}: ${formatMoney(m.total)}`}>
              <span className="tabular text-xs text-ink/50">
                {m.total > 0 ? formatMoney(m.total).replace('.00', '') : ''}
              </span>
              <div
                className={`mt-1 w-full ${isSpike ? 'bg-amber' : 'bg-ledger'}`}
                style={{ height: `${Math.max(heightPct, m.total > 0 ? 4 : 0)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2 border-t border-line pt-2">
        {months.map((m) => (
          <div key={m.month} className="flex-1 text-center text-xs text-ink/40">
            {m.label.split(' ')[0]}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink/40">
        Amber bars are months running over 30% above your average — usually a sign several yearly renewals landed together.
      </p>
    </div>
  );
}
