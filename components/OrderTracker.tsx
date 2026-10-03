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
import { Btn, Card, Textarea } from './ui';
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
          type="button"
          onClick={() => onPick(n)}
          className="p-0.5 transition-transform hover:scale-110"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill={n <= value ? '#F2A413' : 'none'} stroke={n <= value ? '#F2A413' : 'var(--c-muted)'} strokeWidth="1.8" strokeLinejoin="round">
            <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8z" />
          </svg>
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
      <Card className="p-6 text-center">
        <p className="text-muted">Order not found.</p>
      </Card>
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
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
            Order #{order.order_number}
          </p>
          <p className="font-display text-xl font-extrabold tracking-tight text-ink">
            {tNo ? `Table ${tNo}` : 'Your order'} · {pkr(order.total_amount)}
          </p>
          <p className="mt-0.5 text-xs text-muted">Placed at {fmtTime(order.created_at)}</p>
        </div>
        <StatusPill status={order.status} size="lg" />
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
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-extrabold transition ${
                    done
                      ? 'border-ok bg-ok/10 text-ok'
                      : current
                        ? 'animate-pulse border-brand bg-brand/10 text-brand'
                        : 'border-line text-muted'
                  }`}
                >
                  {done ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg>
                  ) : (
                    i + 1
                  )}
                </div>
                {i < STEPS.length - 1 && <div className={`h-7 w-0.5 ${done ? 'bg-ok/40' : 'bg-line'}`} />}
              </div>
              <div className="pb-5">
                <p className={`font-bold ${current || done ? 'text-ink' : 'text-muted'}`}>{step.label}</p>
                <p className="text-[13px] text-muted">{step.hint}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Items */}
      <div className="rounded-[14px] bg-soft p-4">
        {order.items.map((it) => (
          <div key={it.id} className="flex items-center justify-between py-1.5 text-sm">
            <span className="text-body">
              <span className="font-extrabold text-brand">{it.quantity}×</span> {it.item_name}
            </span>
            <span className="font-semibold text-muted">{pkr(it.unit_price * it.quantity)}</span>
          </div>
        ))}
      </div>

      {/* Review */}
      {order.status === 'completed' && !existingReview && !reviewDone && (
        <div className="mt-5 rounded-[14px] border border-line bg-soft p-4">
          <p className="font-bold text-ink">How was your meal?</p>
          <div className="mt-2">
            <Stars value={rating} onPick={setRating} />
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you loved (optional)…"
            rows={2}
            className="mt-3 resize-none"
          />
          <Btn onClick={submitReview} className="mt-3 w-full" size="sm">
            Submit review
          </Btn>
        </div>
      )}
      {(existingReview || reviewDone) && order.status === 'completed' && (
        <p className="mt-5 rounded-[14px] bg-ok/10 p-4 text-center text-sm font-semibold text-ok">
          Shukriya! Your feedback helps us serve you better.
        </p>
      )}

      {onOrderMore && order.status !== 'completed' && (
        <Btn variant="secondary" onClick={onOrderMore} className="mt-5 w-full" size="sm">
          Order more items
        </Btn>
      )}
    </Card>
  );
}
