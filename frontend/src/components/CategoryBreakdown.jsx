import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatMoney } from '../utils/date';
import { getCategoryChartColor } from '../utils/brands';

function formatCategoryLabel(cat) {
  if (!cat) return 'Other';
  const c = String(cat).toLowerCase().trim();
  if (c === 'ai') return 'AI';
  if (c === 'software / ai' || c === 'software/ai') return 'Software / AI';
  if (c === 'news and media' || c === 'news & media') return 'News & Media';
  if (c === 'health & fitness' || c === 'health and fitness') return 'Health & Fitness';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
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
    <div className="mt-3 border border-line bg-white p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center gap-5">
        {/* Donut Chart with Center Display */}
        <div className="relative flex items-center justify-center w-full">
          <div className="h-[190px] w-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="monthlySpend"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={78}
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
                        opacity: activeIndex === null || activeIndex === index ? 1 : 0.35,
                        transform: activeIndex === index ? 'scale(1.04)' : 'scale(1)',
                        transformOrigin: 'center center',
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Clean Center Callout (No Tooltip Collisions) */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            {hoveredItem ? (
              <>
                <span className="max-w-[100px] truncate text-[10px] font-bold uppercase tracking-wider text-ink/60">
                  {formatCategoryLabel(hoveredItem.category)}
                </span>
                <span className="tabular font-display text-base font-bold text-ink">
                  {hoveredItem.percentage}%
                </span>
                <span className="tabular text-[11px] font-medium text-ink/70">
                  {formatMoney(hoveredItem.monthlySpend, currency)}
                  <span className="text-[10px] font-normal text-ink/40">/mo</span>
                </span>
                <span className="text-[10px] text-ink/40">
                  {hoveredItem.count} {hoveredItem.count === 1 ? 'sub' : 'subs'}
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-ink/50">
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
        <div className="space-y-2 w-full">
          {chartData.map((item, index) => {
            const isHovered = activeIndex === index;
            return (
              <div
                key={item.category}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`group rounded-sm border p-2 transition-all cursor-pointer ${
                  isHovered
                    ? 'border-line bg-paper/80 shadow-2xs'
                    : 'border-line/40 bg-white hover:border-line hover:bg-paper/40'
                }`}
              >
                {/* Top Row: Color dot, Category Name, Sub Count, Monthly Spend */}
                <div className="flex items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-ink truncate text-[11px] sm:text-xs">
                      {formatCategoryLabel(item.category)}
                    </span>
                    <span className="rounded bg-stone-100 px-1 py-0.2 text-[9px] font-medium text-ink/50 border border-stone-200/50">
                      {item.count}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="tabular font-display font-semibold text-ink text-[11px] sm:text-xs">
                      {formatMoney(item.monthlySpend, currency)}
                    </span>
                    <span className="tabular text-[10px] font-medium text-ink/40 w-7 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-stone-100">
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
                  <div className="mt-1.5 flex flex-wrap items-center gap-1 border-t border-line/40 pt-1.5 text-[9px] text-ink/60">
                    <span>Top:</span>
                    {item.topSubscriptions.map((s, idx) => (
                      <span key={idx} className="rounded bg-paper px-1 py-0.5 font-medium text-ink/70">
                        {s.name}
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
