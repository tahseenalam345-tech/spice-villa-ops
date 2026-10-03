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
import { AppHeader, Btn, Card, Empty, SectionHead } from '@/components/ui';
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

  const completeOrder = () => {
    if (!activeOrder) return;
    updateOrderStatus(activeOrder.id, 'completed');
    setJustPlaced(null);
  };

  return (
    <div className="min-h-screen bg-page">
      <AppHeader title="Waiter" subtitle="Tableside ordering" active="/waiter" />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <SectionHead title="Tables" sub="Tap a table to take an order or manage its running bill" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
                className={`rounded-card border-2 p-4 text-left transition-all duration-150 ${
                  isSel
                    ? 'border-ink bg-ink text-white shadow-[0_3px_0_var(--c-hard)]'
                    : 'border-line bg-surface hover:-translate-y-px hover:border-ink/40 hover:shadow-card'
                }`}
              >
                <p className={`font-display text-[17px] font-extrabold tracking-tight ${isSel ? 'text-white' : 'text-ink'}`}>
                  Table {t.table_number}
                </p>
                {active ? (
                  <div className="mt-1.5">
                    <p className={`text-[11px] font-extrabold uppercase tracking-wider ${isSel ? 'text-white/80' : 'text-warn'}`}>
                      Occupied
                    </p>
                    <p className={`mt-0.5 text-xs ${isSel ? 'text-white/60' : 'text-muted'}`}>
                      #{active.order_number} · {fmtAgo(active.created_at)}
                    </p>
                    <p className={`text-xs font-bold ${isSel ? 'text-white' : 'text-ink'}`}>{pkr(active.total_amount)}</p>
                  </div>
                ) : (
                  <p className={`mt-1.5 text-[11px] font-extrabold uppercase tracking-wider ${isSel ? 'text-white/70' : 'text-ok'}`}>
                    Empty
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {selectedTable ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-extrabold tracking-tight text-ink">
                  New order · Table {selectedTable.table_number}
                </h2>
                <button
                  onClick={() => setSelected(null)}
                  className="text-[13px] font-semibold text-muted underline hover:text-ink"
                >
                  Close
                </button>
              </div>
              <div className="mt-3">
                <MenuOrder
                  tableId={selectedTable.id}
                  mode="waiter"
                  waiterId={user?.id}
                  onOrderPlaced={(o) => setJustPlaced(o.id)}
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <h2 className="font-display text-lg font-extrabold tracking-tight text-ink">Active order</h2>
              <div className="mt-3">
                {activeOrder ? (
                  <Card className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-display text-lg font-extrabold text-ink">#{activeOrder.order_number}</p>
                      <StatusPill status={activeOrder.status} />
                    </div>
                    <p className="mt-1 text-[13px] text-muted">
                      {activeOrder.customer_name ? `${activeOrder.customer_name} · ` : ''}
                      {fmtTime(activeOrder.created_at)} · {fmtAgo(activeOrder.created_at)}
                    </p>
                    <div className="mt-3 space-y-1.5">
                      {activeOrder.items.map((it) => (
                        <div key={it.id} className="flex justify-between text-sm">
                          <span className="text-body">
                            <span className="font-extrabold text-brand">{it.quantity}×</span> {it.item_name}
                          </span>
                          <span className="font-semibold text-muted">{pkr(it.unit_price * it.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                      <span className="text-sm text-muted">Total</span>
                      <span className="font-display text-xl font-extrabold text-ink">{pkr(activeOrder.total_amount)}</span>
                    </div>
                    <Btn variant="dark" onClick={completeOrder} className="mt-4 w-full" size="sm">
                      Mark completed & free table
                    </Btn>
                  </Card>
                ) : (
                  <Empty title="No active order" sub="Place one from the menu on the left." />
                )}
              </div>

              <h2 className="mt-6 font-display text-lg font-extrabold tracking-tight text-ink">Today&apos;s history</h2>
              <div className="mt-3 space-y-2">
                {history.length === 0 && (
                  <p className="text-sm text-muted">No orders yet today on this table.</p>
                )}
                {history.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-[14px] border border-line bg-surface px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-ink">
                        #{o.order_number} · {o.items.reduce((s, i) => s + i.quantity, 0)} items
                      </p>
                      <p className="text-xs text-muted">
                        {fmtTime(o.created_at)} · {o.customer_name ?? 'Walk-in'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-ink">{pkr(o.total_amount)}</span>
                      <StatusPill status={o.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Empty
            title="Select a table to take an order"
            sub="Occupied tables show their running order — tap one to add items or close it out."
          />
        )}
      </main>
    </div>
  );
}

export default function WaiterPage() {
  return (
    <RequireRole roles={['waiter', 'manager', 'owner']}>
      <WaiterApp />
    </RequireRole>
  );
}
