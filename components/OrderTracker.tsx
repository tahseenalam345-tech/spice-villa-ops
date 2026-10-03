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
          className={`text-3xl transition ${n <= value ? 'text-[#E9A13B]' : 'text-white/20 hover:text-white/40'}`}
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
      <div className="rounded-2xl border border-white/10 bg-[#211C14] p-6 text-center">
        <p className="text-[#FAF6EE]/60">Order not found.</p>
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
    <div className="rounded-2xl border border-white/10 bg-[#211C14] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#FAF6EE]/50">Order #{order.order_number}</p>
          <p className="font-display text-xl font-semibold text-[#FAF6EE]">
            {tNo ? `Table ${tNo}` : 'Your order'} · {pkr(order.total_amount)}
          </p>
          <p className="mt-0.5 text-xs text-[#FAF6EE]/40">Placed at {fmtTime(order.created_at)}</p>
        </div>
        <StatusPill status={order.status} size="lg" />
      </div>

      {/* Steps */}
      <div className="mt-6 space-y-0">
        {STEPS.map((step, i) => {
          const done = i < activeIdx;
          const current = i === activeIdx;
          return (
            <div key={step.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold ${
                    done
                      ? 'border-[#4ADE80] bg-[#4ADE80]/15 text-[#4ADE80]'
                      : current
                        ? 'animate-pulse border-[#E9A13B] bg-[#E9A13B]/15 text-[#E9A13B]'
                        : 'border-white/15 text-[#FAF6EE]/30'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-8 w-0.5 ${done ? 'bg-[#4ADE80]/50' : 'bg-white/10'}`} />
                )}
              </div>
              <div className="pb-6">
                <p className={`font-medium ${current || done ? 'text-[#FAF6EE]' : 'text-[#FAF6EE]/35'}`}>
                  {step.label}
                </p>
                <p className="text-sm text-[#FAF6EE]/45">{step.hint}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Items */}
      <div className="rounded-xl bg-white/[0.04] p-4">
        {order.items.map((it) => (
          <div key={it.id} className="flex items-center justify-between py-1.5 text-sm">
            <span className="text-[#FAF6EE]/85">
              <span className="font-bold text-[#E9A13B]">{it.quantity}×</span> {it.item_name}
            </span>
            <span className="text-[#FAF6EE]/60">{pkr(it.unit_price * it.quantity)}</span>
          </div>
        ))}
      </div>

      {/* Review */}
      {order.status === 'completed' && !existingReview && !reviewDone && (
        <div className="mt-5 rounded-xl border border-[#E9A13B]/30 bg-[#E9A13B]/5 p-4">
          <p className="font-medium text-[#FAF6EE]">How was your meal?</p>
          <div className="mt-2">
            <Stars value={rating} onPick={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you loved (optional)…"
            rows={2}
            className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[#FAF6EE] placeholder:text-[#FAF6EE]/35 focus:border-[#E9A13B]/60 focus:outline-none"
          />
          <button
            onClick={submitReview}
            className="mt-3 w-full rounded-xl bg-[#E9A13B] py-3 text-sm font-bold text-[#16130E] transition hover:bg-[#f2b45c]"
          >
            Submit review
          </button>
        </div>
      )}
      {(existingReview || reviewDone) && order.status === 'completed' && (
        <p className="mt-5 rounded-xl bg-[#4ADE80]/10 p-4 text-center text-sm text-[#4ADE80]">
          Shukriya! Your feedback helps us serve you better.
        </p>
      )}

      {onOrderMore && order.status !== 'completed' && (
        <button
          onClick={onOrderMore}
          className="mt-5 w-full rounded-xl border border-white/15 py-3 text-sm font-medium text-[#FAF6EE]/80 transition hover:border-[#E9A13B]/60 hover:text-[#E9A13B]"
        >
          Order more items
        </button>
      )}
    </div>
  );
}
