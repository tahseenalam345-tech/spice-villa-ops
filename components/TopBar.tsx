'use client';

import { useRouter } from 'next/navigation';
import { getSession, logout, useSession } from '@/lib/auth';

export default function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const sessionUser = user ?? getSession()?.user ?? null;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#16130E]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9A13B] font-display text-xl font-bold text-[#16130E]">
            S
          </div>
          <div>
            <p className="font-display text-lg font-semibold leading-tight text-[#FAF6EE]">{title}</p>
            {subtitle && <p className="text-xs text-[#FAF6EE]/50">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {sessionUser && (
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-[#FAF6EE]">{sessionUser.name}</p>
              <p className="text-xs capitalize text-[#FAF6EE]/50">{sessionUser.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-[#FAF6EE]/80 transition hover:border-[#E9A13B]/60 hover:text-[#E9A13B]"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
