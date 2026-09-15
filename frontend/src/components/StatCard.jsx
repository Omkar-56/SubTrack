export default function StatCard({ label, value, tone = 'default' }) {
  const toneClass = {
    default: 'text-ink',
    ledger: 'text-ledger-dark',
    amber: 'text-amber',
  }[tone];

  return (
    <div className="border border-line bg-white px-5 py-4">
      <p className="text-sm text-ink/50">{label}</p>
      <p className={`mt-2 font-display text-3xl font-semibold tabular ${toneClass}`}>{value}</p>
    </div>
  );
}
