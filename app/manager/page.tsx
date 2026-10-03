'use client';

import { useMemo, useState } from 'react';
import { RequireRole, useSession } from '@/lib/auth';
import {
  dashboardStats,
  getOrdersToday,
  getReviews,
  getTables,
  getWasteLogs,
  logWaste,
  ordersPerHour,
  tableActiveOrder,
  tableNumber,
  updateOrderStatus,
  useLiveDb,
  type OrderStatus,
  type WasteReason,
} from '@/lib/db';
import { fmtAgo, fmtTime, pkr } from '@/lib/format';
import TopBar from '@/components/TopBar';
import StatCard from '@/components/StatCard';
import StatusPill from '@/components/StatusPill';

const NEXT: Record<OrderStatus, { next: OrderStatus; label: string } | null> = {
  pending: { next: 'preparing', label: 'Start preparing' },
  preparing: { next: 'ready', label: 'Mark ready' },
  ready: { next: 'completed', label: 'Complete' },
  completed: null,
};

type OrderFilter = 'all' | OrderStatus;
const ORDER_FILTERS: { key: OrderFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'New' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'completed', label: 'Completed' },
];

const WASTE_REASONS: { value: WasteReason; label: string }[] = [
  { value: 'spoilage', label: 'Spoilage' },
  { value: 'theft', label: 'Theft' },
  { value: 'overprep', label: 'Over-preparation' },
  { value: 'other', label: 'Other' },
];

function ManagerApp() {
  const db = useLiveDb();
  const { user } = useSession();
  const stats = useMemo(() => dashboardStats(db), [db]);
  const ordersToday = useMemo(() => getOrdersToday(db), [db]);
  const tables = useMemo(() => getTables(db), [db]);
  const wasteLogs = useMemo(() => getWasteLogs(db), [db]);
  const reviews = useMemo(() => getReviews(db), [db]);
  const hourly = useMemo(() => ordersPerHour(db), [db]);

  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');

  // Waste form
  const [wItem, setWItem] = useState(db.items[0]?.id ?? '');
  const [wQty, setWQty] = useState('1');
  const [wReason, setWReason] = useState<WasteReason>('spoilage');
  const [wCost, setWCost] = useState('');
  const [wMsg, setWMsg] = useState<string | null>(null);

  const visibleOrders =
    orderFilter === 'all' ? ordersToday : ordersToday.filter((o) => o.status === orderFilter);

  const maxHour = Math.max(1, ...hourly);
  const nowHour = new Date().getHours();

  const submitWaste = (e: React.FormEvent) => {
    e.preventDefault();
    const item = db.items.find((i) => i.id === wItem);
    const qty = Math.max(1, parseInt(wQty, 10) || 1);
    const cost = Math.max(0, parseFloat(wCost) || 0);
    logWaste({
      menu_item_id: item?.id,
      item_name: item?.name ?? 'Unknown item',
      quantity: qty,
      reason: wReason,
      logged_by: user?.name ?? 'Manager',
      estimated_cost: cost,
    });
    setWQty('1');
    setWCost('');
    setWMsg(`Logged ${qty}× ${item?.name ?? 'item'} as ${wReason}.`);
    window.setTimeout(() => setWMsg(null), 4000);
  };

  const inputCls =
    'w-full rounded-xl border border-cream/10 bg-white/[0.05] px-4 py-2.5 text-sm text-cream focus:border-saffron/60 focus:outline-none';

  return (
    <div className="min-h-screen bg-pine-deep text-cream">
      <TopBar title="Manager Dashboard" subtitle={db.restaurant.name} />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Today's orders" value={String(stats.ordersToday)} sub="All tables" />
          <StatCard label="Revenue today" value={pkr(stats.revenueToday)} sub="Completed + open orders" accent="#35A06B" />
          <StatCard label="In the kitchen" value={String(stats.pendingCount)} sub="New + preparing" accent="#7FB3FF" />
          <StatCard
            label="Avg. prep time"
            value={stats.avgPrepMinutes > 0 ? `${stats.avgPrepMinutes} min` : '—'}
            sub="Completed orders today"
            accent="#B794F6"
          />
        </section>

        {/* Orders + tables */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold">Live orders</h2>
              <div className="flex flex-wrap gap-1.5">
                {ORDER_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setOrderFilter(f.key)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                      orderFilter === f.key
                        ? 'bg-saffron text-pine-deep'
                        : 'border border-cream/15 text-cream/65 hover:border-cream/30'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-pine-line/40">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="bg-pine-card text-xs uppercase tracking-widest text-cream/45">
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Table</th>
                      <th className="px-4 py-3">Items</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleOrders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-cream/45">
                          No orders in this view.
                        </td>
                      </tr>
                    )}
                    {visibleOrders.map((o) => {
                      const adv = NEXT[o.status];
                      return (
                        <tr key={o.id} className="border-t border-pine-line/40">
                          <td className="px-4 py-3">
                            <p className="font-medium">#{o.order_number}</p>
                            <p className="text-xs text-cream/45">
                              {fmtTime(o.created_at)} · {fmtAgo(o.created_at)}
                            </p>
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {tableNumber(db, o.table_id) ? `T${tableNumber(db, o.table_id)}` : '—'}
                          </td>
                          <td className="px-4 py-3 text-cream/70">
                            {o.items.map((i) => `${i.quantity}× ${i.item_name}`).join(', ')}
                          </td>
                          <td className="px-4 py-3 font-medium text-saffron">{pkr(o.total_amount)}</td>
                          <td className="px-4 py-3">
                            <StatusPill status={o.status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            {adv ? (
                              <button
                                onClick={() => updateOrderStatus(o.id, adv.next)}
                                className="rounded-lg border border-saffron/50 px-3 py-1.5 text-xs font-bold text-saffron transition hover:bg-saffron hover:text-pine-deep"
                              >
                                {adv.label}
                              </button>
                            ) : (
                              <span className="text-xs text-cream/35">Done</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Table map */}
          <div>
            <h2 className="font-display text-xl font-bold">Tables</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {tables.map((t) => {
                const active = tableActiveOrder(db, t.id);
                return (
                  <div
                    key={t.id}
                    className={`rounded-2xl border p-4 ${
                      active ? 'border-saffron/50 bg-saffron/5' : 'border-pine-line/40 bg-pine-card'
                    }`}
                  >
                    <p className="font-display text-lg font-bold">Table {t.table_number}</p>
                    {active ? (
                      <>
                        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-saffron">
                          Occupied
                        </p>
                        <p className="mt-0.5 text-xs text-cream/55">
                          #{active.order_number} · {fmtAgo(active.created_at)}
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-[#8FDCB2]">
                        Empty
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hourly chart */}
            <h2 className="mt-6 font-display text-xl font-bold">Orders per hour</h2>
            <div className="mt-3 rounded-2xl border border-pine-line/40 bg-pine-card p-4">
              <div className="flex h-32 items-end gap-1">
                {hourly.map((n, h) => (
                  <div key={h} className="flex flex-1 flex-col items-center justify-end" title={`${h}:00 — ${n} orders`}>
                    <div
                      className={`w-full rounded-t ${h === nowHour ? 'bg-saffron' : 'bg-saffron/35'}`}
                      style={{ height: `${Math.max(3, (n / maxHour) * 100)}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-cream/40">
                <span>12am</span>
                <span>6am</span>
                <span>12pm</span>
                <span>6pm</span>
                <span>12am</span>
              </div>
            </div>
          </div>
        </section>

        {/* Waste + reviews */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-xl font-bold">Waste log</h2>
            <form onSubmit={submitWaste} className="mt-3 rounded-2xl border border-pine-line/40 bg-pine-card p-5">
              <div className="grid grid-cols-2 gap-3">
                <label className="col-span-2 block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-cream/50">Item</span>
                  <select value={wItem} onChange={(e) => setWItem(e.target.value)} className={`${inputCls} appearance-none bg-pine-card`}>
                    {db.items.map((i) => (
                      <option key={i.id} value={i.id} className="bg-pine-card">
                        {i.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-cream/50">Quantity</span>
                  <input value={wQty} onChange={(e) => setWQty(e.target.value)} inputMode="numeric" className={inputCls} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-cream/50">Est. cost (Rs.)</span>
                  <input value={wCost} onChange={(e) => setWCost(e.target.value)} inputMode="decimal" placeholder="0" className={inputCls} />
                </label>
                <label className="col-span-2 block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-cream/50">Reason</span>
                  <div className="flex flex-wrap gap-2">
                    {WASTE_REASONS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setWReason(r.value)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                          wReason === r.value
                            ? 'bg-saffron text-pine-deep'
                            : 'border border-cream/15 text-cream/65'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </label>
              </div>
              {wMsg && <p className="mt-3 text-sm text-[#8FDCB2]">{wMsg}</p>}
              <button
                type="submit"
                className="mt-4 w-full rounded-xl bg-saffron py-3 text-sm font-bold text-pine-deep transition hover:bg-saffron-deep"
              >
                Log waste
              </button>
            </form>

            <div className="mt-3 space-y-2">
              {wasteLogs.slice(0, 6).map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-xl border border-pine-line/40 bg-pine-card px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-cream">
                      {w.quantity}× {w.item_name}
                    </p>
                    <p className="text-xs capitalize text-cream/45">
                      {w.reason} · {w.logged_by} · {fmtAgo(w.logged_at)}
                    </p>
                  </div>
                  <span className="font-medium text-chili">{pkr(w.estimated_cost)}</span>
                </div>
              ))}
              {wasteLogs.length === 0 && (
                <p className="text-sm text-cream/45">No waste logged yet.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold">Customer reviews</h2>
            <div className="mt-3 space-y-3">
              {reviews.length === 0 && (
                <p className="text-sm text-cream/45">No reviews yet.</p>
              )}
              {reviews.slice(0, 6).map((r) => {
                const order = db.orders.find((o) => o.id === r.order_id);
                return (
                  <div key={r.id} className="rounded-2xl border border-pine-line/40 bg-pine-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-saffron" aria-label={`${r.rating} out of 5 stars`}>
                        {'★'.repeat(r.rating)}
                        <span className="text-cream/20">{'★'.repeat(5 - r.rating)}</span>
                      </span>
                      <span className="text-xs text-cream/40">
                        {order ? `Order #${order.order_number}` : ''} · {fmtAgo(r.created_at)}
                      </span>
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-cream/75">{r.comment}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function ManagerPage() {
  return (
    <RequireRole roles={['manager', 'owner']}>
      <ManagerApp />
    </RequireRole>
  );
}
