'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, roleHome } from '@/lib/auth';
import BrandMark from '@/components/BrandMark';

const QUICK = [
  { label: 'Manager', email: 'manager@orderkar.pk' },
  { label: 'Kitchen', email: 'kitchen@orderkar.pk' },
  { label: 'Waiter', email: 'waiter@orderkar.pk' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    const user = login(email, password);
    if (!user) {
      setError('Invalid email or password. Try one of the demo accounts below.');
      setBusy(false);
      return;
    }
    router.replace(roleHome(user.role));
  };

  const quickFill = (accountEmail: string) => {
    setEmail(accountEmail);
    setPassword('demo123');
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-pine-deep px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <BrandMark size={48} />
            <span className="text-left">
              <span className="block font-display text-2xl font-bold leading-none text-cream">OrderKar</span>
              <span className="mt-1 block text-xs font-medium text-cream/55">Restaurant chalana ab aasaan</span>
            </span>
          </Link>
          <p className="mt-4 text-sm font-medium uppercase tracking-widest text-cream/45">Staff sign in</p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-3xl border border-pine-line/40 bg-pine-card p-6 shadow-card sm:p-8"
        >
          <label className="mb-1.5 block text-sm font-medium text-cream/70">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@orderkar.pk"
            autoComplete="username"
            className="mb-4 w-full rounded-xl border border-cream/10 bg-white/[0.05] px-4 py-3 text-cream placeholder:text-cream/30 focus:border-saffron/60 focus:outline-none"
          />
          <label className="mb-1.5 block text-sm font-medium text-cream/70">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full rounded-xl border border-cream/10 bg-white/[0.05] px-4 py-3 text-cream placeholder:text-cream/30 focus:border-saffron/60 focus:outline-none"
          />

          {error && (
            <p className="mt-4 rounded-xl bg-chili/10 px-4 py-3 text-sm text-[#F0A49C]">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy || !email || !password}
            className="mt-6 w-full rounded-2xl bg-saffron py-3.5 font-bold text-pine-deep transition hover:bg-saffron-deep disabled:opacity-40"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="mt-6 border-t border-pine-line/40 pt-5">
            <p className="mb-3 text-center text-xs uppercase tracking-widest text-cream/40">
              Demo accounts · password demo123
            </p>
            <div className="grid grid-cols-3 gap-2">
              {QUICK.map((q) => (
                <button
                  key={q.email}
                  type="button"
                  onClick={() => quickFill(q.email)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    email === q.email
                      ? 'border-saffron bg-saffron/15 text-saffron'
                      : 'border-cream/10 text-cream/70 hover:border-saffron/50'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-cream/40">
          <Link href="/" className="text-saffron hover:underline">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
