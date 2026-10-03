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
import DishImage from './DishImage';

interface MenuOrderProps {
  tableId: string;
  mode: 'customer' | 'waiter';
  waiterId?: string;
  onOrderPlaced?: (order: Order) => void;
  /** Dark pine theme for staff screens; light cream theme for customers. */
  dark?: boolean;
}

function Stepper({
  qty,
  onChange,
  disabled,
  dark,
}: {
  qty: number;
  onChange: (qty: number) => void;
  disabled?: boolean;
  dark?: boolean;
}) {
  if (qty === 0) {
    return (
      <button
        disabled={disabled}
        onClick={() => onChange(1)}
        className="rounded-xl bg-saffron px-5 py-2 text-sm font-bold text-pine-deep transition hover:bg-saffron-deep disabled:cursor-not-allowed disabled:opacity-30"
      >
        ADD
      </button>
    );
  }
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-2 py-1 ${
        dark ? 'border-saffron/50 bg-saffron/10' : 'border-saffron-deep/40 bg-saffron/10'
      }`}
    >
      <button
        onClick={() => onChange(qty - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-xl font-bold text-saffron-deep transition hover:bg-saffron/25"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className={`min-w-6 text-center font-bold ${dark ? 'text-cream' : 'text-ink'}`}>{qty}</span>
      <button
        onClick={() => onChange(qty + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-xl font-bold text-saffron-deep transition hover:bg-saffron/25"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

function TagBadge({ tag }: { tag: MenuTag }) {
  if (tag === 'bestseller') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-saffron/20 px-2 py-0.5 text-[11px] font-bold text-[#9A6204]">
        ★ Bestseller
      </span>
    );
  }
  if (tag === 'spicy') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-chili/10 px-2 py-0.5 text-[11px] font-bold text-chili">
        <span className="h-1.5 w-1.5 rounded-full bg-chili" /> Spicy
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-leaf/15 px-2 py-0.5 text-[11px] font-bold text-leaf-deep">
      <span className="h-1.5 w-1.5 rounded-full bg-leaf" /> Veg
    </span>
  );
}

export default function MenuOrder({ tableId, mode, waiterId, onOrderPlaced, dark = false }: MenuOrderProps) {
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

  const inputCls = dark
    ? 'w-full rounded-xl border border-cream/10 bg-white/[0.05] px-4 py-3 text-sm text-cream placeholder:text-cream/30 focus:border-saffron/60 focus:outline-none'
    : 'w-full rounded-xl border border-ink/10 bg-cream px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-pine/50 focus:outline-none';

  return (
    <div>
      {/* Category tabs */}
      <div
        className={`sticky top-0 z-20 -mx-4 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 ${
          dark ? 'bg-pine-deep/95' : 'bg-cream/95'
        }`}
      >
        <div className="flex gap-2 overflow-x-auto pb-1">
          {menu.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                currentCat === c.id
                  ? dark
                    ? 'bg-saffron text-pine-deep'
                    : 'bg-pine text-cream'
                  : dark
                    ? 'border border-cream/15 text-cream/70 hover:border-saffron/50'
                    : 'border border-ink/15 text-ink-soft hover:border-pine/50'
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
              className={`flex gap-4 rounded-2xl border p-3 shadow-card ${
                dark
                  ? 'border-pine-line/40 bg-pine-card'
                  : 'border-ink/10 bg-white'
              } ${!item.is_available ? 'opacity-50' : ''}`}
            >
              <DishImage src={item.image_url} alt={item.name} className="h-24 w-24 shrink-0 rounded-xl" />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className={`font-medium leading-snug ${dark ? 'text-cream' : 'text-ink'}`}>
                    {item.name}
                  </p>
                </div>
                {(item.tags?.length ?? 0) > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.tags!.map((t) => (
                      <TagBadge key={t} tag={t} />
                    ))}
                  </div>
                )}
                <p
                  className={`mt-0.5 line-clamp-2 text-[13px] leading-snug ${
                    dark ? 'text-cream/55' : 'text-ink-soft'
                  }`}
                >
                  {item.description}
                </p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className={`font-display text-lg font-semibold ${dark ? 'text-saffron' : 'text-pine'}`}>
                    {pkr(item.price)}
                  </span>
                  {item.is_available ? (
                    <Stepper qty={cart[item.id] ?? 0} onChange={(q) => setQty(item.id, q)} dark={dark} />
                  ) : (
                    <span
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                        dark ? 'bg-white/5 text-cream/40' : 'bg-ink/5 text-ink-faint'
                      }`}
                    >
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
            className={`pointer-events-auto flex w-full max-w-md items-center justify-between rounded-2xl px-5 py-4 font-bold shadow-lift transition ${
              dark
                ? 'bg-saffron text-pine-deep hover:bg-saffron-deep'
                : 'bg-pine text-cream hover:bg-pine-soft'
            }`}
          >
            <span className="flex items-center gap-2">
              <span
                className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs ${
                  dark ? 'bg-pine-deep text-saffron' : 'bg-saffron text-pine-deep'
                }`}
              >
                {cartCount}
              </span>
              View cart {tNo ? `· Table ${tNo}` : ''}
            </span>
            <span>{pkr(cartTotal)}</span>
          </button>
        </div>
      )}

      {/* Cart drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDrawerOpen(false)} />
          <div
            className={`absolute inset-x-0 bottom-0 mx-auto max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-t p-5 pb-8 ${
              dark ? 'border-pine-line/40 bg-pine-card' : 'border-ink/10 bg-white'
            }`}
          >
            <div className={`mx-auto mb-4 h-1.5 w-12 rounded-full ${dark ? 'bg-cream/20' : 'bg-ink/15'}`} />
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`font-display text-xl font-semibold ${dark ? 'text-cream' : 'text-ink'}`}>
                Your order {tNo ? `· Table ${tNo}` : ''}
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className={`rounded-lg px-2 py-1 text-2xl leading-none transition ${
                  dark ? 'text-cream/60 hover:text-cream' : 'text-ink-soft hover:text-ink'
                }`}
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {cartLines.map(({ item, qty }) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-xl p-3 ${
                    dark ? 'bg-white/[0.05]' : 'bg-cream'
                  }`}
                >
                  <DishImage src={item.image_url} alt={item.name} className="h-14 w-14 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${dark ? 'text-cream' : 'text-ink'}`}>
                      {item.name}
                    </p>
                    <p className={`text-sm ${dark ? 'text-saffron' : 'text-pine'}`}>
                      {pkr(item.price * qty)}
                    </p>
                  </div>
                  <Stepper qty={qty} onChange={(q) => setQty(item.id, q)} dark={dark} />
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={mode === 'waiter' ? 'Customer name' : 'Your name (optional)'}
                className={inputCls}
              />
              {mode === 'customer' && (
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  inputMode="tel"
                  className={inputCls}
                />
              )}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions (e.g. less spicy, no onion)…"
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </div>

            {error && <p className="mt-3 text-sm text-chili">{error}</p>}

            <button
              onClick={placeOrder}
              disabled={placing || cartLines.length === 0}
              className="mt-4 flex w-full items-center justify-between rounded-2xl bg-saffron px-5 py-4 font-bold text-pine-deep transition hover:bg-saffron-deep disabled:opacity-40"
            >
              <span>{placing ? 'Placing order…' : 'Place order'}</span>
              <span>{pkr(cartTotal)}</span>
            </button>
            <p className={`mt-3 text-center text-xs ${dark ? 'text-cream/40' : 'text-ink-faint'}`}>
              {mode === 'waiter' ? 'Order goes straight to the kitchen display.' : 'The kitchen will start preparing right away.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
