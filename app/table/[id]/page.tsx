'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getOrder, tableActiveOrder, useLiveDb } from '@/lib/db';
import { pkr } from '@/lib/format';
import MenuOrder from '@/components/MenuOrder';
import OrderTracker from '@/components/OrderTracker';
import StatusPill from '@/components/StatusPill';

export default function TablePage({ params }: { params: { id: string } }) {
  const db = useLiveDb();
  const [placedId, setPlacedId] = useState<string | null>(null);
  const [viewingActive, setViewingActive] = useState(false);
  const [orderingMore, setOrderingMore] = useState(false);

  const num = parseInt(params.id, 10);
  const table = db.tables.find((t) => t.table_number === num || t.id === params.id);

  if (!table) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#16130E] px-4">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#211C14] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E9A13B]/15 font-display text-3xl font-bold text-[#E9A13B]">
            ?
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold text-[#FAF6EE]">Table not found</h1>
          <p className="mt-2 text-sm text-[#FAF6EE]/55">
            This QR code doesn&apos;t match a table. Please scan the code on your table again,
            or ask a waiter for help.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-2xl bg-[#E9A13B] px-6 py-3 font-bold text-[#16130E]"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const liveActive = tableActiveOrder(db, table.id);
  const placed = placedId ? getOrder(db, placedId) : undefined;
  // Full tracker for an order placed in this session; a compact banner for a
  // pre-existing active order (e.g. seeded demo data) so the menu stays front
  // and centre for a newly scanned guest.
  const tracked = placed ?? (viewingActive ? liveActive : undefined);
  const showMenu = !tracked || orderingMore || viewingActive;

  return (
    <div className="min-h-screen bg-[#16130E] text-[#FAF6EE]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#16130E]">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E9A13B] font-display text-xl font-bold text-[#16130E]">
              S
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold leading-tight">{db.restaurant.name}</h1>
              <p className="text-xs text-[#FAF6EE]/50">{db.restaurant.tagline}</p>
            </div>
          </div>
          <span className="rounded-full border border-[#E9A13B]/50 bg-[#E9A13B]/10 px-4 py-1.5 text-sm font-bold text-[#E9A13B]">
            Table {table.table_number}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-10 sm:px-6">
        {tracked && (
          <div className="pt-5">
            <OrderTracker
              orderId={tracked.id}
              onOrderMore={
                placed && !orderingMore
                  ? () => setOrderingMore(true)
                  : viewingActive && !placed
                    ? () => setViewingActive(false)
                    : undefined
              }
            />
          </div>
        )}

        {!placed && liveActive && !viewingActive && (
          <button
            onClick={() => setViewingActive(true)}
            className="mt-5 flex w-full items-center justify-between rounded-2xl border border-[#E9A13B]/40 bg-[#E9A13B]/10 px-5 py-4 text-left transition hover:bg-[#E9A13B]/15"
          >
            <span>
              <span className="block text-sm font-bold text-[#E9A13B]">
                Active order #{liveActive.order_number} on this table
              </span>
              <span className="block text-xs text-[#FAF6EE]/55">
                {pkr(liveActive.total_amount)} · tap to track it live
              </span>
            </span>
            <StatusPill status={liveActive.status} />
          </button>
        )}

        {showMenu && (
          <div className="pt-5">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  {tracked ? 'Add more items' : 'Menu'}
                </h2>
                <p className="mt-1 text-sm text-[#FAF6EE]/55">
                  Order from your phone — the kitchen starts preparing right away.
                </p>
              </div>
              {viewingActive && !placed && (
                <button
                  onClick={() => setViewingActive(false)}
                  className="shrink-0 text-sm text-[#FAF6EE]/60 underline hover:text-[#E9A13B]"
                >
                  Hide status
                </button>
              )}
            </div>
            <MenuOrder
              tableId={table.id}
              mode="customer"
              onOrderPlaced={(o) => {
                setPlacedId(o.id);
                setViewingActive(false);
                setOrderingMore(false);
              }}
            />
          </div>
        )}

        <footer className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-[#FAF6EE]/35">
          <p>
            {db.restaurant.address} · {db.restaurant.phone}
          </p>
          <p className="mt-1">Need help? Please call your waiter.</p>
        </footer>
      </main>
    </div>
  );
}
