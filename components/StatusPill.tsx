'use client';

import type { OrderStatus } from '@/lib/db';

const STYLES: Record<OrderStatus, string> = {
  pending: 'bg-[#E9A13B]/15 text-[#E9A13B] border-[#E9A13B]/40',
  preparing: 'bg-[#7FB3FF]/15 text-[#9cc2ff] border-[#7FB3FF]/40',
  ready: 'bg-[#4ADE80]/15 text-[#4ADE80] border-[#4ADE80]/40',
  completed: 'bg-white/5 text-[#FAF6EE]/60 border-white/15',
};

const LABELS: Record<OrderStatus, string> = {
  pending: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
};

export default function StatusPill({ status, size = 'sm' }: { status: OrderStatus; size?: 'sm' | 'lg' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium uppercase tracking-wider ${
        STYLES[status]
      } ${size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-1 text-[11px]'}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full bg-current ${status === 'pending' || status === 'preparing' ? 'animate-pulse' : ''}`} />
      {LABELS[status]}
    </span>
  );
}
