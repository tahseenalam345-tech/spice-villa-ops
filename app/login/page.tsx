'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, roleHome } from '@/lib/auth';

const QUICK = [
  { label: 'Manager', email: 'manager@spicevilla.pk' },
  { label: 'Kitchen', email: 'kitchen@spicevilla.pk' },
  { label: 'Waiter', email: 'waiter@spicevilla.pk' },
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
    <div className="flex min-h-screen items-center justify-center bg-[#16130E] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E9A13B] font-display text-2xl font-bold text-[#16130E]">
              S
            </div>
            <span className="font-display text-2xl font-semibold text-[#FAF6EE]">Spice Villa</span>
          </Link>
          <p className="mt-3 text-sm text-[#FAF6EE]/50">Staff sign in</p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-3xl border border-white/10 bg-[#211C14] p-6 sm:p-8"
        >
          <label className="mb-1.5 block text-sm font-medium text-[#FAF6EE]/70">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@spicevilla.pk"
            autoComplete="username"
            className="mb-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[#FAF6EE] placeholder:text-[#FAF6EE]/30 focus:border-[#E9A13B]/60 focus:outline-none"
          />
          <label className="mb-1.5 block text-sm font-medium text-[#FAF6EE]/70">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[#FAF6EE] placeholder:text-[#FAF6EE]/30 focus:border-[#E9A13B]/60 focus:outline-none"
          />

          {error && (
            <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy || !email || !password}
            className="mt-6 w-full rounded-2xl bg-[#E9A13B] py-3.5 font-bold text-[#16130E] transition hover:bg-[#f2b45c] disabled:opacity-40"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="mb-3 text-center text-xs uppercase tracking-widest text-[#FAF6EE]/40">
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
                      ? 'border-[#E9A13B] bg-[#E9A13B]/15 text-[#E9A13B]'
                      : 'border-white/10 text-[#FAF6EE]/70 hover:border-[#E9A13B]/50'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-[#FAF6EE]/40">
          <Link href="/" className="text-[#E9A13B] hover:underline">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
