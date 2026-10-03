'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, roleHome } from '@/lib/auth';
import BrandMark from '@/components/BrandMark';
import { Btn, Card, Input, ThemeToggle } from '@/components/ui';

const QUICK = [
  { label: 'Owner', email: 'owner@orderkar.pk' },
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

      <main className="mx-auto flex max-w-md flex-col px-4 py-10 sm:px-6">
        <div className="mb-6 text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-muted">Staff sign in</p>
          <h1 className="mt-2 font-display text-[26px] font-extrabold tracking-tight text-ink">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted">Sign in to your station to start the shift.</p>
        </div>

        <Card className="p-6 sm:p-7">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-body">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@orderkar.pk"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-body">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="rounded-[12px] bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{error}</p>
            )}

            <Btn type="submit" size="lg" className="w-full" disabled={busy || !email || !password}>
              {busy ? 'Signing in…' : 'Sign in'}
            </Btn>
          </form>

          <div className="mt-6 border-t border-line pt-5">
            <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
              Demo accounts · password demo123
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {QUICK.map((q) => (
                <button
                  key={q.email}
                  type="button"
                  onClick={() => quickFill(q.email)}
                  className={`rounded-[12px] border-2 px-3 py-2.5 text-[13px] font-bold transition-all ${
                    email === q.email
                      ? 'border-ink bg-ink text-white shadow-[0_3px_0_var(--c-hard)]'
                      : 'border-line bg-surface text-muted hover:border-ink/40 hover:text-ink'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/" className="font-semibold text-brand hover:underline">← Back to home</Link>
        </p>
      </main>
    </div>
  );
}
