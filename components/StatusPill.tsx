'use client';

import type { OrderStatus } from '@/lib/db';

const DARK: Record<OrderStatus, string> = {
  pending: 'bg-saffron/15 text-saffron border-saffron/40',
  preparing: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
  ready: 'bg-leaf/15 text-[#8FDCB2] border-leaf/50',
  completed: 'bg-white/5 text-cream/60 border-white/15',
};

const LIGHT: Record<OrderStatus, string> = {
  pending: 'bg-saffron/15 text-[#9A6204] border-saffron/50',
  preparing: 'bg-sky-100 text-sky-800 border-sky-300',
  ready: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  completed: 'bg-ink/5 text-ink-soft border-ink/15',
};

const LABELS: Record<OrderStatus, string> = {
  pending: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
};

export default function StatusPill({
  status,
  size = 'sm',
  tone = 'dark',
}: {
  status: OrderStatus;
  size?: 'sm' | 'lg';
  tone?: 'dark' | 'light';
}) {
  const styles = tone === 'light' ? LIGHT : DARK;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium uppercase tracking-wider ${
        styles[status]
      } ${size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-1 text-[11px]'}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full bg-current ${status === 'pending' || status === 'preparing' ? 'animate-pulse' : ''}`} />
      {LABELS[status]}
    </span>
  );
}
