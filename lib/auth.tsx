'use client';

// ---------------------------------------------------------------------------
// OrderKar — demo auth against the seeded staff users in lib/db.ts.
// Session is a plain localStorage entry. Swap for Supabase Auth later.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadDB, type StaffRole, type StaffUser } from './db';

export const SESSION_KEY = 'orderkar_session';

export interface Session {
  user: StaffUser;
  started_at: string;
}

/** Returns the user on valid credentials, null otherwise. */
export function login(email: string, password: string): StaffUser | null {
  const db = loadDB();
  const user = db.users.find(
    (u) => u.is_active && u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  if (!user) return null;
  const session: Session = { user, started_at: new Date().toISOString() };
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
  return user;
}

export function logout(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (!session?.user?.email) return null;
    return session;
  } catch {
    return null;
  }
}

export function useSession(): { user: StaffUser | null; loading: boolean } {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setSession(getSession());
    setLoading(false);
    const onStorage = (e: StorageEvent): void => {
      if (e.key === SESSION_KEY) setSession(getSession());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return { user: session?.user ?? null, loading };
}

export function roleHome(role: StaffRole): string {
  switch (role) {
    case 'kitchen':
      return '/kitchen';
    case 'waiter':
      return '/waiter';
    case 'manager':
    case 'owner':
    default:
      return '/manager';
  }
}

/** Route guard — renders children only for the allowed roles, else /login. */
export function RequireRole({ roles, children }: { roles: StaffRole[]; children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !roles.includes(user.role))) {
      router.replace('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  if (loading || !user || !roles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pine-deep">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-saffron/30 border-t-saffron" />
          <p className="text-sm text-cream/60">Loading…</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
