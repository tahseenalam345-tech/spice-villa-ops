'use client';

import { useMemo, useState } from 'react';
import {
  createOrder,
  getMenu,
  tableNumber,
  useLiveDb,
  type MenuItem,
  type Order,
} from '@/lib/db';
import { pkr } from '@/lib/format';
import DishImage from './DishImage';

interface MenuOrderProps {
  tableId: string;
  mode: 'customer' | 'waiter';
  waiterId?: string;
  onOrderPlaced?: (order: Order) => void;
}

function Stepper({
  qty,
  onChange,
  disabled,
}: {
  qty: number;
  onChange: (qty: number) => void;
  disabled?: boolean;
}) {
  if (qty === 0) {
    return (
      <button
        disabled={disabled}
        onClick={() => onChange(1)}
        className="rounded-xl bg-[#E9A13B] px-5 py-2 text-sm font-bold text-[#16130E] transition hover:bg-[#f2b45c] disabled:cursor-not-allowed disabled:opacity-30"
      >
        ADD
      </button>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#E9A13B]/50 bg-[#E9A13B]/10 px-2 py-1">
      <button
        onClick={() => onChange(qty - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-xl font-bold text-[#E9A13B] transition hover:bg-[#E9A13B]/20"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="min-w-6 text-center font-bold text-[#FAF6EE]">{qty}</span>
      <button
        onClick={() => onChange(qty + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-xl font-bold text-[#E9A13B] transition hover:bg-[#E9A13B]/20"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
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
      <div className="sticky top-0 z-20 -mx-4 bg-[#16130E]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {menu.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                currentCat === c.id
                  ? 'bg-[#E9A13B] text-[#16130E]'
                  : 'border border-white/15 text-[#FAF6EE]/70 hover:border-[#E9A13B]/50'
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
              className={`flex gap-4 rounded-2xl border border-white/10 bg-[#211C14] p-3 ${
                !item.is_available ? 'opacity-50' : ''
              }`}
            >
              <DishImage src={item.image_url} alt={item.name} className="h-24 w-24 shrink-0 rounded-xl" />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="font-medium leading-snug text-[#FAF6EE]">{item.name}</p>
                <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-[#FAF6EE]/55">
                  {item.description}
                </p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="font-display text-lg font-semibold text-[#E9A13B]">
                    {pkr(item.price)}
                  </span>
                  {item.is_available ? (
                    <Stepper qty={cart[item.id] ?? 0} onChange={(q) => setQty(item.id, q)} />
                  ) : (
                    <span className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-[#FAF6EE]/40">
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
            className="pointer-events-auto flex w-full max-w-md items-center justify-between rounded-2xl bg-[#E9A13B] px-5 py-4 font-bold text-[#16130E] shadow-2xl shadow-black/50 transition hover:bg-[#f2b45c]"
          >
            <span className="flex items-center gap-2">
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#16130E] px-1.5 text-xs text-[#E9A13B]">
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
          <div className="absolute inset-x-0 bottom-0 mx-auto max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[#211C14] p-5 pb-8">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-[#FAF6EE]">
                Your order {tNo ? `· Table ${tNo}` : ''}
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg px-2 py-1 text-2xl leading-none text-[#FAF6EE]/60 hover:text-[#FAF6EE]"
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {cartLines.map(({ item, qty }) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
                  <DishImage src={item.image_url} alt={item.name} className="h-14 w-14 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#FAF6EE]">{item.name}</p>
                    <p className="text-sm text-[#E9A13B]">{pkr(item.price * qty)}</p>
                  </div>
                  <Stepper qty={qty} onChange={(q) => setQty(item.id, q)} />
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={mode === 'waiter' ? 'Customer name' : 'Your name (optional)'}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[#FAF6EE] placeholder:text-[#FAF6EE]/35 focus:border-[#E9A13B]/60 focus:outline-none"
              />
              {mode === 'customer' && (
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  inputMode="tel"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[#FAF6EE] placeholder:text-[#FAF6EE]/35 focus:border-[#E9A13B]/60 focus:outline-none"
                />
              )}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions (e.g. less spicy, no onion)…"
                rows={2}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[#FAF6EE] placeholder:text-[#FAF6EE]/35 focus:border-[#E9A13B]/60 focus:outline-none"
              />
            </div>

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <button
              onClick={placeOrder}
              disabled={placing || cartLines.length === 0}
              className="mt-4 flex w-full items-center justify-between rounded-2xl bg-[#E9A13B] px-5 py-4 font-bold text-[#16130E] transition hover:bg-[#f2b45c] disabled:opacity-40"
            >
              <span>{placing ? 'Placing order…' : 'Place order'}</span>
              <span>{pkr(cartTotal)}</span>
            </button>
            <p className="mt-3 text-center text-xs text-[#FAF6EE]/40">
              {mode === 'waiter' ? 'Order goes straight to the kitchen display.' : 'The kitchen will start preparing right away.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
