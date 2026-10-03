'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { RequireRole } from '@/lib/auth';
import {
  getActiveOrders,
  tableNumber,
  updateOrderStatus,
  useLiveDb,
  type Order,
  type OrderStatus,
} from '@/lib/db';
import { fmtElapsed } from '@/lib/format';
import TopBar from '@/components/TopBar';
import StatusPill from '@/components/StatusPill';

type Filter = 'all' | OrderStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'New' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
];

function beep(): void {
  try {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    [0, 0.25, 0.5].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 880;
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.4, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  } catch {
    // Audio not available — the visual flash still fires.
  }
}

function useClock(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  return now;
}

function OrderCard({ order, tableNo, flash }: { order: Order; tableNo?: number; flash: boolean }) {
  const now = useClock();
  const elapsedMs = now.getTime() - new Date(order.created_at).getTime();
  const late = elapsedMs > 20 * 60000 && order.status !== 'ready';

  return (
    <article
      className={`rounded-3xl border bg-pine-card p-6 shadow-card ${
        flash ? 'animate-flash-new border-saffron' : 'border-pine-line/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-4xl font-bold text-cream">#{order.order_number}</p>
          <p className="mt-1 text-xl font-semibold text-saffron">
            {tableNo ? `Table ${tableNo}` : 'Takeaway'}
          </p>
        </div>
        <div className="text-right">
          <StatusPill status={order.status} size="lg" />
          <p className={`mt-2 font-mono text-2xl font-bold ${late ? 'animate-pulse text-chili' : 'text-cream/80'}`}>
            {fmtElapsed(elapsedMs)}
          </p>
          {late && <p className="text-xs font-bold uppercase tracking-wider text-chili">Running late</p>}
        </div>
      </div>

      {order.notes && (
        <p className="mt-3 rounded-xl bg-saffron/10 px-4 py-2.5 text-sm font-medium text-saffron">
          Note: {order.notes}
        </p>
      )}

      <ul className="mt-4 space-y-2.5 border-t border-pine-line/40 pt-4">
        {order.items.map((it) => (
          <li key={it.id} className="flex items-start justify-between gap-3">
            <span className="text-lg leading-snug text-cream">
              <span className="mr-2 inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-saffron px-2 font-display text-lg font-bold text-pine-deep">
                {it.quantity}
              </span>
              {it.item_name}
              {it.notes && <span className="block pl-10 text-sm text-cream/50">↳ {it.notes}</span>}
            </span>
          </li>
        ))}
      </ul>

      {order.customer_name && (
        <p className="mt-3 text-sm text-cream/45">Guest: {order.customer_name}</p>
      )}

      <div className="mt-5 flex gap-3">
        {order.status === 'pending' && (
          <button
            onClick={() => updateOrderStatus(order.id, 'preparing')}
            className="flex-1 rounded-2xl bg-saffron py-4 text-lg font-bold text-pine-deep transition hover:bg-saffron-deep"
          >
            Start preparing
          </button>
        )}
        {order.status === 'preparing' && (
          <button
            onClick={() => updateOrderStatus(order.id, 'ready')}
            className="flex-1 rounded-2xl bg-leaf py-4 text-lg font-bold text-pine-deep transition hover:bg-[#46b57c]"
          >
            Mark ready
          </button>
        )}
        {order.status === 'ready' && (
          <p className="flex-1 rounded-2xl border border-leaf/50 bg-leaf/10 py-4 text-center text-lg font-bold text-[#8FDCB2]">
            Waiting for pickup
          </p>
        )}
      </div>
    </article>
  );
}

function KitchenApp() {
  const db = useLiveDb(5000);
  const [filter, setFilter] = useState<Filter>('all');
  const seenRef = useRef<Set<string>>(new Set());
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());

  const orders = useMemo(() => getActiveOrders(db), [db]);

  // New-order alert: beep + card flash.
  useEffect(() => {
    const seen = seenRef.current;
    const fresh = orders.filter((o) => !seen.has(o.id));
    orders.forEach((o) => seen.add(o.id));
    if (fresh.length > 0 && seen.size > fresh.length) {
      beep();
      const ids = new Set(fresh.map((o) => o.id));
      setFlashIds(ids);
      const t = window.setTimeout(() => setFlashIds(new Set()), 4000);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [orders]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: orders.length, pending: 0, preparing: 0, ready: 0, completed: 0 };
    for (const o of orders) c[o.status as OrderStatus] += 1;
    return c;
  }, [orders]);

  const visible = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  const now = useClock();

  return (
    <div className="min-h-screen bg-pine-deep text-cream">
      <TopBar title="Kitchen Display" subtitle="Live order queue" />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-2xl px-5 py-3 text-base font-bold transition ${
                  filter === f.key
                    ? 'bg-saffron text-pine-deep'
                    : 'border border-cream/15 text-cream/70 hover:border-cream/30'
                }`}
              >
                {f.label}
                <span className="ml-2 opacity-70">{counts[f.key]}</span>
              </button>
            ))}
          </div>
          <p className="font-mono text-2xl font-bold text-cream/80">
            {now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </p>
        </div>

        {visible.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-cream/15 p-16 text-center">
            <p className="font-display text-3xl text-cream/60">All clear</p>
            <p className="mt-2 text-cream/40">New orders will appear here automatically.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                tableNo={tableNumber(db, o.table_id)}
                flash={flashIds.has(o.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function KitchenPage() {
  return (
    <RequireRole roles={['kitchen', 'manager']}>
      <KitchenApp />
    </RequireRole>
  );
}
