import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatMoney } from '../utils/date';
import { getCategoryChartColor } from '../utils/brands';

function CustomDonutTooltip({ active, payload, currency = 'USD' }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded border border-line bg-white px-3 py-2 shadow-md">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <span className="font-display text-sm font-semibold capitalize text-ink">
          {data.category}
        </span>
      </div>
      <p className="tabular mt-1 text-sm font-bold text-ink">
        {formatMoney(data.monthlySpend, currency)}
        <span className="text-xs font-normal text-ink/50">/mo</span>
      </p>
      <div className="mt-1 flex items-center gap-2 text-xs text-ink/60">
        <span>{data.percentage}% of spend</span>
        <span>·</span>
        <span>{data.count} {data.count === 1 ? 'sub' : 'subs'}</span>
      </div>
      {data.yearlySpend > 0 && (
        <p className="tabular mt-1 border-t border-line/60 pt-1 text-[11px] text-ink/50">
          ≈ {formatMoney(data.yearlySpend, currency)}/year
        </p>
      )}
    </div>
  );
}

export default function CategoryBreakdown({ categories = [], totalMonthly = 0, currency = 'USD' }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!categories || categories.length === 0) {
    return (
      <div className="mt-3 border border-line bg-white px-4 py-8 text-center text-sm text-ink/50 shadow-2xs">
        Add subscriptions to see your spend distributed by category.
      </div>
    );
  }

  const chartData = categories.map((c, i) => ({
    ...c,
    color: getCategoryChartColor(c.category),
    index: i,
  }));

  const hoveredItem = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <div className="mt-3 border border-line bg-white p-4 shadow-2xs">
      <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-12">
        {/* Donut Chart with Center Display */}
        <div className="relative flex items-center justify-center sm:col-span-5">
          <div className="h-[190px] w-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="monthlySpend"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="cursor-pointer transition-opacity duration-200"
                      style={{
                        opacity: activeIndex === null || activeIndex === index ? 1 : 0.4,
                        transform: activeIndex === index ? 'scale(1.04)' : 'scale(1)',
                        transformOrigin: 'center center',
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomDonutTooltip currency={currency} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Center Callout */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {hoveredItem ? (
              <>
                <span className="max-w-[100px] truncate text-[11px] font-semibold uppercase tracking-wider text-ink/50">
                  {hoveredItem.category}
                </span>
                <span className="tabular font-display text-sm font-bold text-ink">
                  {hoveredItem.percentage}%
                </span>
                <span className="tabular text-[10px] text-ink/40">
                  {formatMoney(hoveredItem.monthlySpend, currency)}
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] uppercase tracking-wider text-ink/50">
                  Total
                </span>
                <span className="tabular font-display text-sm font-bold text-ink">
                  {formatMoney(totalMonthly, currency)}
                </span>
                <span className="text-[10px] text-ink/40">/month</span>
              </>
            )}
          </div>
        </div>

        {/* Category List & Metrics */}
        <div className="space-y-2.5 sm:col-span-7">
          {chartData.map((item, index) => {
            const isHovered = activeIndex === index;
            return (
              <div
                key={item.category}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`group rounded-sm border p-2.5 transition-all cursor-pointer ${
                  isHovered
                    ? 'border-line bg-paper/80 shadow-2xs'
                    : 'border-line/40 bg-white hover:border-line hover:bg-paper/40'
                }`}
              >
                {/* Top Row: Color dot, Category Name, Sub Count, Monthly Spend */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium capitalize text-ink truncate">
                      {item.category}
                    </span>
                    <span className="rounded bg-stone-100 px-1.5 py-0.2 text-[10px] font-medium text-ink/50 border border-stone-200/50">
                      {item.count} {item.count === 1 ? 'sub' : 'subs'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="tabular font-display font-semibold text-ink">
                      {formatMoney(item.monthlySpend, currency)}
                      <span className="text-[10px] font-normal text-ink/50">/mo</span>
                    </span>
                    <span className="tabular text-[11px] font-medium text-ink/40 w-10 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                      opacity: isHovered ? 1 : 0.85,
                    }}
                  />
                </div>

                {/* Expanded Details when Hovered */}
                {isHovered && item.topSubscriptions?.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-line/40 pt-1.5 text-[10px] text-ink/60">
                    <span className="text-ink/40">Includes:</span>
                    {item.topSubscriptions.map((sub, i) => (
                      <span
                        key={i}
                        className="rounded bg-white px-1.5 py-0.5 border border-line/60 font-medium text-ink/80"
                      >
                        {sub.name} ({formatMoney(sub.amount, currency)})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
