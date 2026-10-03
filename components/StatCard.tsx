'use client';

export default function StatCard({
  label,
  value,
  sub,
  accent = '#E9A13B',
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#211C14] p-5">
      <div className="mb-3 h-1 w-10 rounded-full" style={{ backgroundColor: accent }} />
      <p className="text-xs font-medium uppercase tracking-widest text-[#FAF6EE]/50">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold text-[#FAF6EE]">{value}</p>
      {sub && <p className="mt-1 text-sm text-[#FAF6EE]/50">{sub}</p>}
    </div>
  );
}
