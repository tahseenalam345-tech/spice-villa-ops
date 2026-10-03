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
  tableActiveOrder,
  tableNumber,
  updateOrderStatus,
  useLiveDb,
  type OrderStatus,
  type WasteReason,
} from '@/lib/db';
import { fmtAgo, fmtTime, pkr } from '@/lib/format';
import { AppHeader, Btn, Card, Empty, Input, Kpi, SectionHead, Select } from '@/components/ui';
import { RushHeatmap } from '@/components/charts';
import StatusPill from '@/components/StatusPill';
import QrSection from '@/components/QrSection';

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
  { value: 'overprep', label: 'Over-prep' },
  { value: 'theft', label: 'Theft' },
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
  const hourly = useMemo(() => {
    const h = new Array<number>(24).fill(0);
    for (const o of ordersToday) h[new Date(o.created_at).getHours()] += 1;
    return h;
  }, [ordersToday]);

  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');

  // Waste form
  const [wItem, setWItem] = useState(db.items[0]?.id ?? '');
  const [wQty, setWQty] = useState('1');
  const [wReason, setWReason] = useState<WasteReason>('spoilage');
  const [wCost, setWCost] = useState('');
  const [wMsg, setWMsg] = useState<string | null>(null);

  const visibleOrders =
    orderFilter === 'all' ? ordersToday : ordersToday.filter((o) => o.status === orderFilter);

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

  return (
    <div className="min-h-screen bg-page">
      <AppHeader title="Manager Dashboard" subtitle={db.restaurant.name} active="/manager" />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Today's orders" value={String(stats.ordersToday)} sub="All tables" />
          <Kpi label="Revenue today" value={pkr(stats.revenueToday)} sub="Completed + open orders" />
          <Kpi label="In the kitchen" value={String(stats.pendingCount)} sub="New + preparing" />
          <Kpi
            label="Avg. prep time"
            value={stats.avgPrepMinutes > 0 ? `${stats.avgPrepMinutes} min` : '—'}
            sub="Completed orders today"
          />
        </section>

        {/* Orders + tables */}
        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <SectionHead
              title="Live orders"
              sub="Today's floor activity"
              action={
                <div className="flex flex-wrap gap-1.5">
                  {ORDER_FILTERS.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setOrderFilter(f.key)}
                      className={`rounded-[10px] border-2 px-3 py-1.5 text-xs font-bold transition ${
                        orderFilter === f.key
                          ? 'border-ink bg-ink text-white'
                          : 'border-line bg-surface text-muted hover:border-ink/40 hover:text-ink'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              }
            />
            <div className="overflow-hidden rounded-[14px] border border-line">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead>
                    <tr className="bg-soft text-[11px] uppercase tracking-[0.14em] text-muted">
                      <th className="px-4 py-3 font-bold">Order</th>
                      <th className="px-4 py-3 font-bold">Table</th>
                      <th className="px-4 py-3 font-bold">Items</th>
                      <th className="px-4 py-3 font-bold">Total</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                      <th className="px-4 py-3 text-right font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleOrders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted">
                          No orders in this view.
                        </td>
                      </tr>
                    )}
                    {visibleOrders.map((o) => {
                      const adv = NEXT[o.status];
                      return (
                        <tr key={o.id} className="border-t border-line">
                          <td className="px-4 py-3">
                            <p className="font-extrabold text-ink">#{o.order_number}</p>
                            <p className="text-xs text-muted">{fmtTime(o.created_at)} · {fmtAgo(o.created_at)}</p>
                          </td>
                          <td className="px-4 py-3 font-bold text-ink">
                            {tableNumber(db, o.table_id) ? `T${tableNumber(db, o.table_id)}` : '—'}
                          </td>
                          <td className="max-w-[220px] truncate px-4 py-3 text-body">
                            {o.items.map((i) => `${i.quantity}× ${i.item_name}`).join(', ')}
                          </td>
                          <td className="px-4 py-3 font-extrabold text-ink">{pkr(o.total_amount)}</td>
                          <td className="px-4 py-3">
                            <StatusPill status={o.status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            {adv ? (
                              <button
                                onClick={() => updateOrderStatus(o.id, adv.next)}
                                className="rounded-[10px] border-2 border-ink bg-surface px-3 py-1.5 text-xs font-extrabold text-ink transition-all shadow-[0_2px_0_var(--c-hard)] hover:-translate-y-px hover:bg-ink hover:text-white active:translate-y-[1px] active:shadow-none"
                              >
                                {adv.label}
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-muted">Done</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-5">
              <SectionHead title="Tables" sub="Live floor map" />
              <div className="grid grid-cols-2 gap-2.5">
                {tables.map((t) => {
                  const active = tableActiveOrder(db, t.id);
                  return (
                    <div
                      key={t.id}
                      className={`rounded-[14px] border-2 p-3.5 ${active ? 'border-warn/60 bg-warn/8' : 'border-line bg-soft/60'}`}
                    >
                      <p className="font-display text-[15px] font-extrabold text-ink">Table {t.table_number}</p>
                      {active ? (
                        <>
                          <p className="mt-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-warn">Occupied</p>
                          <p className="mt-0.5 text-xs text-muted">#{active.order_number} · {fmtAgo(active.created_at)}</p>
                        </>
                      ) : (
                        <p className="mt-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-ok">Empty</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-5">
              <SectionHead title="Orders per hour" sub="Today's rush pattern" />
              <RushHeatmap hours={hourly} />
            </Card>
          </div>
        </section>

        {/* Waste + reviews */}
        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <SectionHead title="Waste log" sub="Track spoilage & over-prep" />
            <form onSubmit={submitWaste} className="rounded-[14px] border border-line bg-soft/60 p-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="col-span-2 block">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Item</span>
                  <Select value={wItem} onChange={(e) => setWItem(e.target.value)}>
                    {db.items.map((i) => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </Select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Quantity</span>
                  <Input value={wQty} onChange={(e) => setWQty(e.target.value)} inputMode="numeric" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Est. cost (Rs)</span>
                  <Input value={wCost} onChange={(e) => setWCost(e.target.value)} inputMode="decimal" placeholder="0" />
                </label>
                <div className="col-span-2">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">Reason</span>
                  <div className="flex flex-wrap gap-2">
                    {WASTE_REASONS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setWReason(r.value)}
                        className={`rounded-[10px] border-2 px-3 py-1.5 text-xs font-bold transition ${
                          wReason === r.value
                            ? 'border-ink bg-ink text-white'
                            : 'border-line bg-surface text-muted hover:border-ink/40 hover:text-ink'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {wMsg && <p className="mt-3 text-sm font-semibold text-ok">{wMsg}</p>}
              <Btn type="submit" className="mt-4 w-full" size="sm">
                Log waste
              </Btn>
            </form>

            <div className="mt-3 space-y-2">
              {wasteLogs.slice(0, 6).map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-[12px] border border-line bg-surface px-4 py-2.5 text-sm">
                  <div>
                    <p className="font-bold text-ink">{w.quantity}× {w.item_name}</p>
                    <p className="text-xs capitalize text-muted">{w.reason} · {w.logged_by} · {fmtAgo(w.logged_at)}</p>
                  </div>
                  <span className="font-extrabold text-danger">{pkr(w.estimated_cost)}</span>
                </div>
              ))}
              {wasteLogs.length === 0 && <Empty title="No waste logged yet" />}
            </div>
          </Card>

          <Card className="p-5">
            <SectionHead title="Customer reviews" sub={`${reviews.length} total`} />
            <div className="space-y-2.5">
              {reviews.length === 0 && <Empty title="No reviews yet" />}
              {reviews.slice(0, 6).map((r) => {
                const order = db.orders.find((o) => o.id === r.order_id);
                return (
                  <div key={r.id} className="rounded-[14px] border border-line bg-surface p-4">
                    <div className="flex items-center justify-between">
                      <span className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg key={s} width="15" height="15" viewBox="0 0 24 24" fill={s <= r.rating ? '#F2A413' : 'none'} stroke={s <= r.rating ? '#F2A413' : 'var(--c-muted)'} strokeWidth="1.8" strokeLinejoin="round">
                            <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8z" />
                          </svg>
                        ))}
                      </span>
                      <span className="text-xs text-muted">
                        {r.customer_name ? `${r.customer_name} · ` : ''}{order ? `Order #${order.order_number} · ` : ''}{fmtAgo(r.created_at)}
                      </span>
                    </div>
                    {r.comment && <p className="mt-2 text-sm leading-relaxed text-body">{r.comment}</p>}
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        <QrSection />
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
