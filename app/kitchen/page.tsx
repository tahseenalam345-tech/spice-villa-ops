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
import { AppHeader, Btn, Empty, Pill } from '@/components/ui';
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
      className={`rounded-card border-2 bg-surface p-5 shadow-card sm:p-6 ${
        flash ? 'animate-flash-new !border-brand' : 'border-line'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[34px] font-extrabold leading-none tracking-tight text-ink">
            #{order.order_number}
          </p>
          <p className="mt-1.5 text-[17px] font-extrabold text-brand">
            {tableNo ? `Table ${tableNo}` : 'Takeaway'}
          </p>
        </div>
        <div className="text-right">
          <StatusPill status={order.status} size="lg" />
          <p className={`mt-2 font-mono text-[22px] font-extrabold ${late ? 'animate-pulse text-danger' : 'text-ink'}`}>
            {fmtElapsed(elapsedMs)}
          </p>
          {late && <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-danger">Running late</p>}
        </div>
      </div>

      {order.notes && (
        <p className="mt-3 rounded-[12px] bg-warn/10 px-4 py-2.5 text-[13px] font-semibold text-warn">
          Note: {order.notes}
        </p>
      )}

      <ul className="mt-4 space-y-2.5 border-t border-line pt-4">
        {order.items.map((it) => (
          <li key={it.id} className="flex items-start justify-between gap-3">
            <span className="text-[15px] leading-snug text-body">
              <span className="mr-2 inline-flex h-8 min-w-8 items-center justify-center rounded-[10px] border-2 border-ink bg-brand px-2 font-display text-[15px] font-extrabold text-white">
                {it.quantity}
              </span>
              <span className="font-semibold text-ink">{it.item_name}</span>
              {it.notes && <span className="block pl-10 text-[13px] text-muted">↳ {it.notes}</span>}
            </span>
          </li>
        ))}
      </ul>

      {order.customer_name && <p className="mt-3 text-[13px] text-muted">Guest: {order.customer_name}</p>}

      <div className="mt-5">
        {order.status === 'pending' && (
          <Btn onClick={() => updateOrderStatus(order.id, 'preparing')} className="w-full" size="lg">
            Start preparing
          </Btn>
        )}
        {order.status === 'preparing' && (
          <Btn variant="dark" onClick={() => updateOrderStatus(order.id, 'ready')} className="w-full" size="lg">
            Mark ready
          </Btn>
        )}
        {order.status === 'ready' && (
          <p className="rounded-btn border-2 border-ok/40 bg-ok/10 py-4 text-center font-display text-[16px] font-extrabold text-ok">
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
    <div className="min-h-screen bg-page">
      <AppHeader title="Kitchen Display" subtitle="Live order queue" active="/kitchen" />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-[12px] border-2 px-4 py-2.5 text-sm font-extrabold transition-all ${
                  filter === f.key
                    ? 'border-ink bg-ink text-white shadow-[0_3px_0_var(--c-hard)]'
                    : 'border-line bg-surface text-muted hover:border-ink/40 hover:text-ink'
                }`}
              >
                {f.label}
                <span className="ml-2 opacity-70">{counts[f.key]}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Pill tone="ok"><span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse-dot" /> Live</Pill>
            <p className="font-mono text-xl font-extrabold text-ink">
              {now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </p>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="mt-10">
            <Empty title="All clear" sub="New orders will appear here automatically." />
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((o) => (
              <OrderCard key={o.id} order={o} tableNo={tableNumber(db, o.table_id)} flash={flashIds.has(o.id)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function KitchenPage() {
  return (
    <RequireRole roles={['kitchen', 'manager', 'owner']}>
      <KitchenApp />
    </RequireRole>
  );
}
