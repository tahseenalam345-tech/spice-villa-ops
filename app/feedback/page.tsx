'use client';

// ---------------------------------------------------------------------------
// /feedback — standalone review page. The "Reviews" QR code points here.
// Name + star rating + comment → saved to reviews. Thank-you state after.
// ---------------------------------------------------------------------------

import { useState } from 'react';
import Link from 'next/link';
import BrandMark from '@/components/BrandMark';
import { Btn, Card, Input, Textarea, ThemeToggle } from '@/components/ui';
import { addReview, useLiveDb } from '@/lib/db';

export default function FeedbackPage() {
  const db = useLiveDb();
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please tap the stars to choose a rating.');
      return;
    }
    addReview({
      order_id: 'qr-feedback',
      rating,
      comment: comment.trim() || undefined,
      customer_name: name.trim() || undefined,
    });
    setDone(true);
  };

  const active = hover || rating;

  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark size={32} />
            <span className="font-display text-[16px] font-extrabold tracking-tight text-ink">OrderKar</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        {!done ? (
          <Card className="p-6 sm:p-8">
            <p className="text-center text-[13px] font-semibold uppercase tracking-widest text-muted">
              {db.restaurant.name} · {db.restaurant.address}
            </p>
            <h1 className="mt-2 text-center font-display text-2xl font-extrabold tracking-tight text-ink">
              How was your meal?
            </h1>
            <p className="mt-1 text-center text-sm text-muted">Your feedback helps us serve you better.</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="flex justify-center gap-1.5" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setRating(s); setError(null); }}
                    onMouseEnter={() => setHover(s)}
                    aria-label={`${s} star${s > 1 ? 's' : ''}`}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <svg width="38" height="38" viewBox="0 0 24 24" fill={s <= active ? '#F2A413' : 'none'} stroke={s <= active ? '#F2A413' : 'var(--c-muted)'} strokeWidth="1.8" strokeLinejoin="round">
                      <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8z" />
                    </svg>
                  </button>
                ))}
              </div>
              {active > 0 && (
                <p className="text-center text-sm font-bold text-ink">
                  {['', 'Not great', 'Okay', 'Good', 'Great', 'Amazing!'][active]}
                </p>
              )}

              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-body">Your name <span className="font-normal text-muted">(optional)</span></label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ahmed" maxLength={40} />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-body">Tell us more <span className="font-normal text-muted">(optional)</span></label>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="What did you love? What can we improve?" maxLength={500} />
              </div>

              {error && <p className="rounded-[12px] bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{error}</p>}

              <Btn type="submit" size="lg" className="w-full">
                Submit review
              </Btn>
            </form>
          </Card>
        ) : (
          <Card className="p-8 text-center sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ok/10">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--c-ok)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 12.5l5 5 10-11" />
              </svg>
            </div>
            <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink">Shukriya{name ? `, ${name}` : ''}!</h1>
            <p className="mt-2 text-sm text-muted">
              Your {rating}-star review has been saved. We read every single one.
            </p>
            <div className="mt-6">
              <Btn variant="secondary" onClick={() => { setDone(false); setRating(0); setComment(''); setName(''); }}>
                Leave another review
              </Btn>
            </div>
          </Card>
        )}

        <p className="mt-6 text-center text-[13px] text-muted">
          Powered by <span className="font-bold text-ink">OrderKar</span> · Restaurant chalana ab aasaan
        </p>
      </main>
    </div>
  );
}
