export default function StatCard({ label, value, sublabel, tone = 'default' }) {
  const toneClass = {
    default: 'text-ink',
    ledger: 'text-ledger-dark',
    emerald: 'text-emerald-700',
    amber: 'text-amber',
    rust: 'text-rust',
  }[tone] || 'text-ink';

  return (
    <div className="border border-line bg-white px-5 py-4 shadow-2xs">
      <p className="text-xs sm:text-sm text-ink/50">{label}</p>
      <p className={`mt-2 font-display text-2xl sm:text-3xl font-semibold tabular ${toneClass}`}>
        {value}
      </p>
      {sublabel && (
        <p className="mt-1 text-[11px] text-ink/50 tabular">
          {sublabel}
        </p>
      )}
    </div>
  );
}
