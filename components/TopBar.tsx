'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSession, logout, useSession } from '@/lib/auth';
import BrandMark from './BrandMark';

export default function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const sessionUser = user ?? getSession()?.user ?? null;

  return (
    <header className="sticky top-0 z-30 border-b border-pine-line/40 bg-pine-deep/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <BrandMark size={40} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-saffron">
              OrderKar
            </p>
            <p className="-mt-0.5 font-display text-lg font-semibold leading-tight text-cream">
              {title}
            </p>
            {subtitle && <p className="text-xs text-cream/55">{subtitle}</p>}
          </div>
        </Link>
        <div className="flex items-center gap-3">
          {sessionUser && (
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-cream">{sessionUser.name}</p>
              <p className="text-xs capitalize text-cream/50">{sessionUser.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="rounded-xl border border-cream/20 px-4 py-2 text-sm font-medium text-cream/80 transition hover:border-saffron/60 hover:text-saffron"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
