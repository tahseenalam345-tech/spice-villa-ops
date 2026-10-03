'use client';

import { useState } from 'react';
import {
  addReview,
  getOrder,
  getReviews,
  tableNumber,
  useLiveDb,
  type OrderStatus,
} from '@/lib/db';
import { fmtTime, pkr } from '@/lib/format';
import StatusPill from './StatusPill';

const STEPS: { key: OrderStatus; label: string; hint: string }[] = [
  { key: 'pending', label: 'Order placed', hint: 'Sent to the kitchen' },
  { key: 'preparing', label: 'Preparing', hint: 'Our chefs are on it' },
  { key: 'ready', label: 'Ready', hint: 'On its way to your table' },
  { key: 'completed', label: 'Completed', hint: 'Enjoy your meal' },
];

function Stars({ value, onPick }: { value: number; onPick: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onPick(n)}
          className={`text-3xl transition ${n <= value ? 'text-saffron' : 'text-ink/15 hover:text-ink/30'}`}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function OrderTracker({ orderId, onOrderMore }: { orderId: string; onOrderMore?: () => void }) {
  const db = useLiveDb();
  const order = getOrder(db, orderId);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewDone, setReviewDone] = useState(false);

  if (!order) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-6 text-center shadow-card">
        <p className="text-ink-soft">Order not found.</p>
      </div>
    );
  }

  const tNo = tableNumber(db, order.table_id);
  const activeIdx = STEPS.findIndex((s) => s.key === order.status);
  const existingReview = getReviews(db).find((r) => r.order_id === order.id);

  const submitReview = () => {
    addReview({ order_id: order.id, rating, comment: comment.trim() || undefined });
    setReviewDone(true);
  };

  return (
    <div className="rounded-3xl border border-ink/10 bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
            Order #{order.order_number}
          </p>
          <p className="font-display text-xl font-semibold text-ink">
            {tNo ? `Table ${tNo}` : 'Your order'} · {pkr(order.total_amount)}
          </p>
          <p className="mt-0.5 text-xs text-ink-faint">Placed at {fmtTime(order.created_at)}</p>
        </div>
        <StatusPill status={order.status} size="lg" tone="light" />
      </div>

      {/* Steps */}
      <div className="mt-6">
        {STEPS.map((step, i) => {
          const done = i < activeIdx;
          const current = i === activeIdx;
          return (
            <div key={step.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold ${
                    done
                      ? 'border-leaf bg-leaf/15 text-leaf-deep'
                      : current
                        ? 'animate-pulse border-saffron bg-saffron/15 text-saffron-deep'
                        : 'border-ink/15 text-ink-faint'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-8 w-0.5 ${done ? 'bg-leaf/50' : 'bg-ink/10'}`} />
                )}
              </div>
              <div className="pb-6">
                <p className={`font-medium ${current || done ? 'text-ink' : 'text-ink-faint'}`}>
                  {step.label}
                </p>
                <p className="text-sm text-ink-soft">{step.hint}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Items */}
      <div className="rounded-2xl bg-cream p-4">
        {order.items.map((it) => (
          <div key={it.id} className="flex items-center justify-between py-1.5 text-sm">
            <span className="text-ink">
              <span className="font-bold text-pine">{it.quantity}×</span> {it.item_name}
            </span>
            <span className="text-ink-soft">{pkr(it.unit_price * it.quantity)}</span>
          </div>
        ))}
      </div>

      {/* Review */}
      {order.status === 'completed' && !existingReview && !reviewDone && (
        <div className="mt-5 rounded-2xl border border-saffron/40 bg-saffron/10 p-4">
          <p className="font-medium text-ink">How was your meal?</p>
          <div className="mt-2">
            <Stars value={rating} onPick={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you loved (optional)…"
            rows={2}
            className="mt-3 w-full resize-none rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-pine/50 focus:outline-none"
          />
          <button
            onClick={submitReview}
            className="mt-3 w-full rounded-xl bg-pine py-3 text-sm font-bold text-cream transition hover:bg-pine-soft"
          >
            Submit review
          </button>
        </div>
      )}
      {(existingReview || reviewDone) && order.status === 'completed' && (
        <p className="mt-5 rounded-2xl bg-leaf/10 p-4 text-center text-sm font-medium text-leaf-deep">
          Shukriya! Your feedback helps us serve you better.
        </p>
      )}

      {onOrderMore && order.status !== 'completed' && (
        <button
          onClick={onOrderMore}
          className="mt-5 w-full rounded-xl border border-ink/15 py-3 text-sm font-medium text-ink transition hover:border-pine/50 hover:text-pine"
        >
          Order more items
        </button>
      )}
    </div>
  );
}
