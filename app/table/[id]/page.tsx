'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getOrder, tableActiveOrder, useLiveDb } from '@/lib/db';
import { pkr } from '@/lib/format';
import BrandMark from '@/components/BrandMark';
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
      <div className="flex min-h-screen items-center justify-center bg-cream px-4">
        <div className="w-full max-w-sm rounded-3xl border border-ink/10 bg-white p-8 text-center shadow-card">
          <div className="mx-auto flex justify-center">
            <BrandMark size={64} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">Table not found</h1>
          <p className="mt-2 text-sm text-ink-soft">
            This QR code doesn&apos;t match a table. Please scan the code on your table again,
            or ask a waiter for help.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-2xl bg-pine px-6 py-3 font-bold text-cream transition hover:bg-pine-soft"
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
    <div className="min-h-screen bg-cream text-ink">
      {/* Header */}
      <header className="border-b border-pine/15 bg-pine">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <BrandMark size={44} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-saffron">
                OrderKar
              </p>
              <h1 className="-mt-0.5 font-display text-xl font-bold leading-tight text-cream">
                {db.restaurant.name}
              </h1>
              <p className="text-xs text-cream/60">{db.restaurant.tagline}</p>
            </div>
          </div>
          <span className="rounded-full bg-saffron px-4 py-1.5 text-sm font-bold text-pine-deep">
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
            className="mt-5 flex w-full items-center justify-between rounded-2xl border border-saffron-deep/40 bg-saffron/15 px-5 py-4 text-left shadow-card transition hover:bg-saffron/25"
          >
            <span>
              <span className="block text-sm font-bold text-pine">
                Active order #{liveActive.order_number} on this table
              </span>
              <span className="block text-xs text-ink-soft">
                {pkr(liveActive.total_amount)} · tap to track it live
              </span>
            </span>
            <StatusPill status={liveActive.status} tone="light" />
          </button>
        )}

        {showMenu && (
          <div className="pt-5">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="font-display text-2xl font-bold">
                  {tracked ? 'Add more items' : 'Menu'}
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Order from your phone — the kitchen starts preparing right away.
                </p>
              </div>
              {viewingActive && !placed && (
                <button
                  onClick={() => setViewingActive(false)}
                  className="shrink-0 text-sm text-ink-soft underline hover:text-pine"
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

        <footer className="mt-10 border-t border-ink/10 pt-6 text-center text-xs text-ink-faint">
          <p>
            {db.restaurant.address} · {db.restaurant.phone}
          </p>
          <p className="mt-1">Need help? Please call your waiter.</p>
          <p className="mt-2 flex items-center justify-center gap-1.5">
            Powered by <span className="font-bold text-pine">OrderKar</span>
          </p>
        </footer>
      </main>
    </div>
  );
}
