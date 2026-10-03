'use client';

import { useMemo, useState } from 'react';
import { RequireRole, useSession } from '@/lib/auth';
import {
  getOrdersToday,
  getTables,
  tableActiveOrder,
  updateOrderStatus,
  useLiveDb,
  type Order,
} from '@/lib/db';
import { fmtAgo, fmtTime, pkr } from '@/lib/format';
import TopBar from '@/components/TopBar';
import StatusPill from '@/components/StatusPill';
import MenuOrder from '@/components/MenuOrder';

function WaiterApp() {
  const db = useLiveDb();
  const { user } = useSession();
  const tables = useMemo(() => getTables(db), [db]);
  const [selected, setSelected] = useState<string | null>(null);
  const [justPlaced, setJustPlaced] = useState<string | null>(null);

  const selectedTable = tables.find((t) => t.id === selected) ?? null;
  const activeOrder: Order | undefined = selectedTable
    ? justPlaced
      ? db.orders.find((o) => o.id === justPlaced)
      : tableActiveOrder(db, selectedTable.id)
    : undefined;

  const history = useMemo(() => {
    if (!selectedTable) return [];
    return getOrdersToday(db).filter((o) => o.table_id === selectedTable.id);
  }, [db, selectedTable]);

  const handlePlaced = (order: Order) => {
    setJustPlaced(order.id);
  };

  const completeOrder = () => {
    if (!activeOrder) return;
    updateOrderStatus(activeOrder.id, 'completed');
    setJustPlaced(null);
  };

  return (
    <div className="min-h-screen bg-pine-deep text-cream">
      <TopBar title="Waiter" subtitle="Tableside ordering" />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Table grid */}
        <h2 className="font-display text-xl font-bold">Tables</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tables.map((t) => {
            const active = tableActiveOrder(db, t.id);
            const isSel = selected === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setSelected(t.id);
                  setJustPlaced(null);
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  isSel
                    ? 'border-saffron bg-saffron/10'
                    : 'border-pine-line/40 bg-pine-card hover:border-cream/25'
                }`}
              >
                <p className="font-display text-lg font-bold">Table {t.table_number}</p>
                {active ? (
                  <div className="mt-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-saffron">
                      Occupied
                    </p>
                    <p className="mt-0.5 text-xs text-cream/55">
                      #{active.order_number} · {fmtAgo(active.created_at)}
                    </p>
                    <p className="text-xs text-cream/55">{pkr(active.total_amount)}</p>
                  </div>
                ) : (
                  <p className="mt-1.5 text-xs font-medium uppercase tracking-wider text-[#8FDCB2]">
                    Empty
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected table detail */}
        {selectedTable ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold">
                  New order · Table {selectedTable.table_number}
                </h2>
                <button
                  onClick={() => setSelected(null)}
                  className="text-sm text-cream/55 underline hover:text-saffron"
                >
                  Close
                </button>
              </div>
              <div className="mt-3">
                <MenuOrder
                  tableId={selectedTable.id}
                  mode="waiter"
                  waiterId={user?.id}
                  onOrderPlaced={handlePlaced}
                  dark
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <h2 className="font-display text-xl font-bold">Active order</h2>
              <div className="mt-3">
                {activeOrder ? (
                  <div className="rounded-2xl border border-pine-line/40 bg-pine-card p-5 shadow-card">
                    <div className="flex items-center justify-between">
                      <p className="font-display text-lg font-bold">
                        #{activeOrder.order_number}
                      </p>
                      <StatusPill status={activeOrder.status} />
                    </div>
                    <p className="mt-1 text-sm text-cream/55">
                      {activeOrder.customer_name ? `${activeOrder.customer_name} · ` : ''}
                      {fmtTime(activeOrder.created_at)} · {fmtAgo(activeOrder.created_at)}
                    </p>
                    <div className="mt-3 space-y-1.5">
                      {activeOrder.items.map((it) => (
                        <div key={it.id} className="flex justify-between text-sm">
                          <span className="text-cream/85">
                            <span className="font-bold text-saffron">{it.quantity}×</span>{' '}
                            {it.item_name}
                          </span>
                          <span className="text-cream/60">{pkr(it.unit_price * it.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-pine-line/40 pt-3">
                      <span className="text-sm text-cream/55">Total</span>
                      <span className="font-display text-xl font-bold text-saffron">
                        {pkr(activeOrder.total_amount)}
                      </span>
                    </div>
                    <button
                      onClick={completeOrder}
                      className="mt-4 w-full rounded-xl bg-leaf py-3 text-sm font-bold text-pine-deep transition hover:bg-[#46b57c]"
                    >
                      Mark completed & free table
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-cream/15 p-6 text-center text-sm text-cream/45">
                    No active order on this table. Place one from the menu.
                  </div>
                )}
              </div>

              <h2 className="mt-6 font-display text-xl font-bold">Today&apos;s history</h2>
              <div className="mt-3 space-y-2">
                {history.length === 0 && (
                  <p className="text-sm text-cream/45">No orders yet today on this table.</p>
                )}
                {history.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-xl border border-pine-line/40 bg-pine-card px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-cream">
                        #{o.order_number} · {o.items.reduce((s, i) => s + i.quantity, 0)} items
                      </p>
                      <p className="text-xs text-cream/45">
                        {fmtTime(o.created_at)} · {o.customer_name ?? 'Walk-in'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-saffron">{pkr(o.total_amount)}</span>
                      <StatusPill status={o.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-cream/15 p-10 text-center">
            <p className="font-display text-xl text-cream/70">Select a table to take an order</p>
            <p className="mt-1 text-sm text-cream/45">
              Occupied tables show their running order — tap one to add items or close it out.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function WaiterPage() {
  return (
    <RequireRole roles={['waiter', 'manager']}>
      <WaiterApp />
    </RequireRole>
  );
}
