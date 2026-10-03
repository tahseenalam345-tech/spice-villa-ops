'use client';

import { useMemo, useState } from 'react';
import {
  createOrder,
  getMenu,
  tableNumber,
  useLiveDb,
  type MenuItem,
  type MenuTag,
  type Order,
} from '@/lib/db';
import { pkr } from '@/lib/format';
import { Btn, Input, Pill, Textarea } from './ui';
import DishImage from './DishImage';

interface MenuOrderProps {
  tableId: string;
  mode: 'customer' | 'waiter';
  waiterId?: string;
  onOrderPlaced?: (order: Order) => void;
}

function Stepper({ qty, onChange, disabled }: { qty: number; onChange: (qty: number) => void; disabled?: boolean }) {
  if (qty === 0) {
    return (
      <Btn size="sm" disabled={disabled} onClick={() => onChange(1)} className="px-5">
        ADD
      </Btn>
    );
  }
  return (
    <div className="flex items-center gap-2.5 rounded-[12px] border-2 border-ink bg-surface px-1.5 py-1 shadow-[0_2px_0_var(--c-hard)]">
      <button
        onClick={() => onChange(qty - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-[8px] text-xl font-extrabold text-ink transition hover:bg-soft"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="min-w-5 text-center font-display text-[15px] font-extrabold text-ink">{qty}</span>
      <button
        onClick={() => onChange(qty + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-ink text-xl font-extrabold text-white transition hover:bg-brand"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

function TagBadge({ tag }: { tag: MenuTag }) {
  if (tag === 'bestseller') return <Pill tone="coral">★ Bestseller</Pill>;
  if (tag === 'spicy') return <Pill tone="danger">Spicy</Pill>;
  return <Pill tone="ok">Veg</Pill>;
}

export default function MenuOrder({ tableId, mode, waiterId, onOrderPlaced }: MenuOrderProps) {
  const db = useLiveDb();
  const menu = useMemo(() => getMenu(db), [db]);
  const tNo = tableNumber(db, tableId);

  const [cart, setCart] = useState<Record<string, number>>({});
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const currentCat = activeCat ?? menu[0]?.id ?? null;

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ item: db.items.find((i) => i.id === id), qty }))
        .filter((l): l is { item: MenuItem; qty: number } => !!l.item && l.qty > 0),
    [cart, db.items],
  );
  const cartCount = cartLines.reduce((s, l) => s + l.qty, 0);
  const cartTotal = cartLines.reduce((s, l) => s + l.qty * l.item.price, 0);

  const setQty = (id: string, qty: number) => {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const placeOrder = () => {
    if (cartLines.length === 0 || placing) return;
    setPlacing(true);
    setError(null);
    try {
      const order = createOrder({
        table_id: tableId,
        items: cartLines.map((l) => ({ menu_item_id: l.item.id, quantity: l.qty })),
        customer_name: name.trim() || undefined,
        customer_phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
        waiter_id: waiterId,
      });
      setCart({});
      setNotes('');
      setDrawerOpen(false);
      onOrderPlaced?.(order);
    } catch {
      setError('Could not place the order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div>
      {/* Category tabs */}
      <div className="sticky top-0 z-20 -mx-4 bg-page/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {menu.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`whitespace-nowrap rounded-[12px] border-2 px-4 py-2 text-[13px] font-bold transition-all ${
                currentCat === c.id
                  ? 'border-ink bg-ink text-white shadow-[0_3px_0_var(--c-hard)]'
                  : 'border-line bg-surface text-muted hover:border-ink/40 hover:text-ink'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3 pb-32">
        {menu
          .filter((c) => c.id === currentCat)
          .flatMap((c) => c.items)
          .map((item) => (
            <div
              key={item.id}
              className={`flex gap-3.5 rounded-card border border-line bg-surface p-3 shadow-card ${!item.is_available ? 'opacity-50' : ''}`}
            >
              <DishImage src={item.image_url} alt={item.name} className="h-24 w-24 shrink-0 rounded-[12px]" />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="font-display text-[15px] font-extrabold leading-snug tracking-tight text-ink">
                  {item.name}
                </p>
                {(item.tags?.length ?? 0) > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.tags!.map((t) => (
                      <TagBadge key={t} tag={t} />
                    ))}
                  </div>
                )}
                <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-muted">{item.description}</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="font-display text-[17px] font-extrabold text-ink">{pkr(item.price)}</span>
                  {item.is_available ? (
                    <Stepper qty={cart[item.id] ?? 0} onChange={(q) => setQty(item.id, q)} />
                  ) : (
                    <span className="rounded-[10px] bg-soft px-3 py-1.5 text-xs font-semibold text-muted">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Floating cart button */}
      {cartCount > 0 && !drawerOpen && (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-4">
          <button
            onClick={() => setDrawerOpen(true)}
            className="pointer-events-auto flex w-full max-w-md items-center justify-between rounded-[16px] border-2 border-ink bg-brand px-5 py-4 font-display font-extrabold text-white shadow-[0_4px_0_var(--c-hard)] transition-all hover:-translate-y-px hover:shadow-[0_5px_0_var(--c-hard)] active:translate-y-[2px] active:shadow-[0_1px_0_var(--c-hard)]"
          >
            <span className="flex items-center gap-2.5 text-[15px]">
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-xs font-extrabold text-brand">
                {cartCount}
              </span>
              View cart {tNo ? `· Table ${tNo}` : ''}
            </span>
            <span className="text-[15px]">{pkr(cartTotal)}</span>
          </button>
        </div>
      )}

      {/* Cart drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-[24px] border-2 border-b-0 border-ink bg-surface p-5 pb-8">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold tracking-tight text-ink">
                Your order {tNo ? `· Table ${tNo}` : ''}
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line text-xl leading-none text-muted transition hover:border-ink/40 hover:text-ink"
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            <div className="space-y-2.5">
              {cartLines.map(({ item, qty }) => (
                <div key={item.id} className="flex items-center gap-3 rounded-[14px] border border-line bg-soft/70 p-3">
                  <DishImage src={item.image_url} alt={item.name} className="h-14 w-14 shrink-0 rounded-[10px]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{item.name}</p>
                    <p className="text-sm font-extrabold text-brand">{pkr(item.price * qty)}</p>
                  </div>
                  <Stepper qty={qty} onChange={(q) => setQty(item.id, q)} />
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={mode === 'waiter' ? 'Customer name' : 'Your name (optional)'}
              />
              {mode === 'customer' && (
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  inputMode="tel"
                />
              )}
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions (e.g. less spicy, no onion)…"
                rows={2}
                className="resize-none"
              />
            </div>

            {error && <p className="mt-3 text-sm font-medium text-danger">{error}</p>}

            <Btn onClick={placeOrder} disabled={placing || cartLines.length === 0} size="lg" className="mt-4 w-full">
              <span className="flex w-full items-center justify-between">
                <span>{placing ? 'Placing order…' : 'Place order'}</span>
                <span>{pkr(cartTotal)}</span>
              </span>
            </Btn>
            <p className="mt-3 text-center text-xs text-muted">
              {mode === 'waiter' ? 'Order goes straight to the kitchen display.' : 'The kitchen will start preparing right away.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
