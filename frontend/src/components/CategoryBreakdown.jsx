import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatMoney } from '../utils/date';
import { getCategoryChartColor, formatCategoryLabel } from '../utils/brands';

export default function CategoryBreakdown({ categories = [], totalMonthly = 0, currency = 'USD' }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!categories || categories.length === 0) {
    return (
      <div className="rounded-sm border border-line bg-white p-5 shadow-2xs">
        <h2 className="font-display text-sm font-semibold text-ink">Spend by Category</h2>
        <p className="mt-6 text-xs text-ink/40 text-center">
          Add subscriptions to see your spend distributed by category.
        </p>
      </div>
    );
  }

  // Pre-process items with color and ensure normalized spend & percentage
  const chartData = categories.map((c) => {
    const spend = Number(c.monthlySpend ?? c.amount ?? 0);
    const percentage = c.percentage !== undefined && c.percentage !== null
      ? Number(c.percentage)
      : (totalMonthly > 0 ? Math.round((spend / totalMonthly) * 100) : 0);
    return {
      ...c,
      monthlySpend: spend,
      percentage,
      color: getCategoryChartColor(c.category),
    };
  });

  const activeCategory = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <div className="rounded-sm border border-line bg-white p-5 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-ink">Spend by Category</h2>
          <span className="text-xs text-ink/40">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          </span>
        </div>

        {/* Donut Chart with Centered Metric */}
        <div className="relative mt-4 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="monthlySpend"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={54}
                outerRadius={78}
                paddingAngle={2}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="transition-all duration-200 cursor-pointer"
                    stroke={activeIndex === index ? '#1F6F54' : '#fff'}
                    strokeWidth={activeIndex === index ? 2 : 1}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.45}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Donut Label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {activeCategory ? (
              <div className="px-2">
                <p className="text-[11px] font-medium text-ink/60 truncate max-w-[110px]">
                  {formatCategoryLabel(activeCategory.category)}
                </p>
                <p className="font-display text-sm font-bold text-ink">
                  {formatMoney(activeCategory.monthlySpend, currency)}
                </p>
                <p className="text-[10px] text-ledger font-semibold">
                  {activeCategory.percentage}%
                </p>
              </div>
            ) : (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-ink/40 font-medium">Monthly</p>
                <p className="font-display text-sm font-bold text-ink">
                  {formatMoney(totalMonthly, currency)}
                </p>
                <p className="text-[10px] text-ink/40">total</p>
              </div>
            )}
          </div>
        </div>

        {/* Legend / Hover Hint */}
        <div className="mt-2 text-center">
          <span className="text-[11px] text-ink/40 italic">
            {activeCategory ? `${activeCategory.count} active subscription${activeCategory.count > 1 ? 's' : ''}` : 'Hover or tap chart slice for details'}
          </span>
        </div>
      </div>

      {/* Category List & Metrics */}
      <div className="mt-4 border-t border-line/60 pt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
        {chartData.map((item, index) => {
          const isHovered = activeIndex === index;
          return (
            <div
              key={item.category}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`rounded-xs p-1.5 transition-colors cursor-pointer ${
                isHovered ? 'bg-stone-50' : 'hover:bg-stone-50/60'
              }`}
            >
              {/* Top Row: Color dot, Category Name, Sub Count, Monthly Spend */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-ink truncate capitalize">
                    {formatCategoryLabel(item.category)}
                  </span>
                  <span className="text-[10px] text-ink/40 font-mono">
                    ({item.count})
                  </span>
                </div>
                <div className="flex items-center gap-2 tabular font-mono">
                  <span className="text-ink font-semibold">
                    {formatMoney(item.monthlySpend, currency)}
                    <span className="text-[10px] font-sans text-ink/40">/mo</span>
                  </span>
                  <span className="text-[10px] text-ink/40 w-10 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar Showing Percentage Share */}
              <div className="mt-1 h-1 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(2, item.percentage))}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
