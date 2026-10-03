'use client';

export default function StatCard({
  label,
  value,
  sub,
  accent = '#F2A413',
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-pine-line/40 bg-pine-card p-5 shadow-card">
      <div className="mb-3 h-1 w-10 rounded-full" style={{ backgroundColor: accent }} />
      <p className="text-xs font-medium uppercase tracking-widest text-cream/50">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold text-cream">{value}</p>
      {sub && <p className="mt-1 text-sm text-cream/50">{sub}</p>}
    </div>
  );
}
