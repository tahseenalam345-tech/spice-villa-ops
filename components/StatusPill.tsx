'use client';

import type { OrderStatus } from '@/lib/db';

const STYLES: Record<OrderStatus, string> = {
  pending: 'bg-warn/12 text-warn',
  preparing: 'bg-brand/10 text-brand',
  ready: 'bg-ok/12 text-ok',
  completed: 'bg-soft text-muted',
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
}: {
  status: OrderStatus;
  size?: 'sm' | 'lg';
  tone?: 'dark' | 'light'; // accepted for backwards compat, ignored
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-bold uppercase tracking-wider ${STYLES[status]} ${
        size === 'lg' ? 'px-4 py-1.5 text-[12.5px]' : 'px-2.5 py-1 text-[10.5px]'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full bg-current ${
          status === 'pending' || status === 'preparing' ? 'animate-pulse-dot' : ''
        }`}
      />
      {LABELS[status]}
    </span>
  );
}
