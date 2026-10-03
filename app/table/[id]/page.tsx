'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getOrder, tableActiveOrder, useLiveDb } from '@/lib/db';
import { pkr } from '@/lib/format';
import BrandMark from '@/components/BrandMark';
import MenuOrder from '@/components/MenuOrder';
import OrderTracker from '@/components/OrderTracker';
import StatusPill from '@/components/StatusPill';
import { Card, LinkBtn, ThemeToggle } from '@/components/ui';

export default function TablePage({ params }: { params: { id: string } }) {
  const db = useLiveDb();
  const [placedId, setPlacedId] = useState<string | null>(null);
  const [viewingActive, setViewingActive] = useState(false);
  const [orderingMore, setOrderingMore] = useState(false);

  const num = parseInt(params.id, 10);
  const table = db.tables.find((t) => t.table_number === num || t.id === params.id);

  if (!table) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-4">
        <Card className="w-full max-w-sm p-8 text-center">
          <div className="mx-auto flex justify-center">
            <BrandMark size={56} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink">Table not found</h1>
          <p className="mt-2 text-sm text-muted">
            This QR code doesn&apos;t match a table. Please scan the code on your table again,
            or ask a waiter for help.
          </p>
          <div className="mt-6">
            <LinkBtn href="/">Back to home</LinkBtn>
          </div>
        </Card>
      </div>
    );
  }

  const liveActive = tableActiveOrder(db, table.id);
  const placed = placedId ? getOrder(db, placedId) : undefined;
  const tracked = placed ?? (viewingActive ? liveActive : undefined);
  const showMenu = !tracked || orderingMore || viewingActive;

  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <header className="border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3.5 sm:px-6">
          <BrandMark size={38} />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand">OrderKar</p>
            <h1 className="-mt-0.5 truncate font-display text-[19px] font-extrabold leading-tight tracking-tight text-ink">
              {db.restaurant.name}
            </h1>
            <p className="truncate text-xs text-muted">{db.restaurant.tagline}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-[12px] border-2 border-ink bg-brand px-3.5 py-1.5 text-sm font-extrabold text-white shadow-[0_3px_0_var(--c-hard)]">
              Table {table.table_number}
            </span>
            <ThemeToggle />
          </div>
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
            className="mt-5 flex w-full items-center justify-between gap-3 rounded-card border-2 border-ink bg-surface px-5 py-4 text-left shadow-[0_3px_0_var(--c-hard)] transition-all hover:-translate-y-px"
          >
            <span>
              <span className="block text-sm font-extrabold text-ink">
                Active order #{liveActive.order_number} on this table
              </span>
              <span className="block text-xs text-muted">
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
                <h2 className="font-display text-[22px] font-extrabold tracking-tight text-ink">
                  {tracked ? 'Add more items' : 'Menu'}
                </h2>
                <p className="mt-0.5 text-[13px] text-muted">
                  Order from your phone — the kitchen starts preparing right away.
                </p>
              </div>
              {viewingActive && !placed && (
                <button
                  onClick={() => setViewingActive(false)}
                  className="shrink-0 text-[13px] font-semibold text-muted underline hover:text-ink"
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

        <footer className="mt-10 border-t border-line pt-6 text-center text-xs text-muted">
          <p>
            {db.restaurant.address} · {db.restaurant.phone}
          </p>
          <p className="mt-1">Need help? Please call your waiter.</p>
          <p className="mt-2">
            Powered by <span className="font-extrabold text-ink">OrderKar</span>
          </p>
        </footer>
      </main>
    </div>
  );
}
