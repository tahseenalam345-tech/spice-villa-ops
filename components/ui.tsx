'use client';

// ---------------------------------------------------------------------------
// OrderKar shared UI kit — KoDriftDev design language.
// Neo-brutalist buttons, hairline cards, Manrope/DM Sans type.
// Every component is theme-aware via CSS variables (light/dark toggle).
// ---------------------------------------------------------------------------

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BrandMark from './BrandMark';
import { getSession, logout } from '@/lib/auth';
import type { StaffRole } from '@/lib/db';

// ---------------------------------------------------------------- button ---

type BtnVariant = 'primary' | 'secondary' | 'dark' | 'danger' | 'ghost';
type BtnSize = 'sm' | 'md' | 'lg';

const BTN_SIZES: Record<BtnSize, string> = {
  sm: 'px-3.5 py-2 text-[13px]',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-[15px]',
};

const BTN_VARIANTS: Record<BtnVariant, string> = {
  primary: 'bg-brand text-white border-ink',
  secondary: 'bg-surface text-ink border-ink',
  dark: 'bg-[#020617] text-white border-ink',
  danger: 'bg-danger text-white border-ink',
  ghost: 'bg-transparent text-body border-transparent',
};

const BTN_SHADOW =
  'shadow-[0_3px_0_var(--c-hard)] hover:shadow-[0_4px_0_var(--c-hard)] hover:-translate-y-px active:shadow-[0_1px_0_var(--c-hard)] active:translate-y-[2px]';

export function Btn({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: BtnSize }) {
  const shadow = variant === 'ghost' ? '' : BTN_SHADOW;
  const border = variant === 'ghost' ? 'border-0' : 'border-2';
  return (
    <button
      className={`inline-flex select-none items-center justify-center gap-2 rounded-btn font-display font-bold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 ${border} ${BTN_SIZES[size]} ${BTN_VARIANTS[variant]} ${shadow} ${className}`}
      {...props}
    />
  );
}

export function LinkBtn({
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
}: {
  href: string;
  variant?: BtnVariant;
  size?: BtnSize;
  className?: string;
  children: ReactNode;
}) {
  const shadow = variant === 'ghost' ? '' : BTN_SHADOW;
  const border = variant === 'ghost' ? 'border-0' : 'border-2';
  return (
    <Link
      href={href}
      className={`inline-flex select-none items-center justify-center gap-2 rounded-btn font-display font-bold transition-all duration-150 ${border} ${BTN_SIZES[size]} ${BTN_VARIANTS[variant]} ${shadow} ${className}`}
    >
      {children}
    </Link>
  );
}

// ------------------------------------------------------------------ card ---

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-card border border-line bg-surface shadow-card ${className}`}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------- section head ---

export function SectionHead({
  title,
  sub,
  action,
  className = '',
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div>
        <h2 className="font-display text-lg font-extrabold tracking-tight text-ink">{title}</h2>
        {sub && <p className="mt-0.5 text-[13px] text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ------------------------------------------------------------------ pill ---

type PillTone = 'brand' | 'ok' | 'warn' | 'danger' | 'muted' | 'coral' | 'ink';

const PILL_TONES: Record<PillTone, string> = {
  brand: 'bg-brand/10 text-brand',
  ok: 'bg-ok/10 text-ok',
  warn: 'bg-warn/10 text-warn',
  danger: 'bg-danger/10 text-danger',
  muted: 'bg-soft text-muted',
  coral: 'bg-coral/12 text-coral',
  ink: 'bg-ink text-white',
};

export function Pill({
  tone = 'muted',
  className = '',
  children,
}: {
  tone?: PillTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold tracking-wide ${PILL_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------- inputs ---

const INPUT_CLS =
  'w-full rounded-[12px] border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${INPUT_CLS} ${props.className ?? ''}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${INPUT_CLS} ${props.className ?? ''}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${INPUT_CLS} ${props.className ?? ''}`} />;
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-[13px] font-semibold text-body">{children}</label>;
}

// ------------------------------------------------------------ theme toggle ---

export const THEME_KEY = 'orderkar_theme';

export function getTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setTheme(getTheme());
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-[12px] border-2 border-ink bg-surface text-ink transition-all duration-150 shadow-[0_3px_0_var(--c-hard)] hover:shadow-[0_4px_0_var(--c-hard)] hover:-translate-y-px active:shadow-[0_1px_0_var(--c-hard)] active:translate-y-[2px] ${className}`}
    >
      {theme === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3L19 19M19 5l-1.7 1.7M6.7 17.3L5 19" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 13.2A8.2 8.2 0 0 1 10.8 4 8.2 8.2 0 1 0 20 13.2Z" />
        </svg>
      )}
    </button>
  );
}

// ----------------------------------------------------------------- header ---

const ROLE_LINKS: { role: StaffRole; href: string; label: string }[] = [
  { role: 'owner', href: '/owner', label: 'Owner' },
  { role: 'manager', href: '/manager', label: 'Manager' },
  { role: 'waiter', href: '/waiter', label: 'Waiter' },
  { role: 'kitchen', href: '/kitchen', label: 'Kitchen' },
];

export function AppHeader({
  title,
  subtitle,
  active,
  right,
}: {
  title: string;
  subtitle?: string;
  active?: string;
  right?: ReactNode;
}) {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [role, setRole] = useState<StaffRole | null>(null);

  useEffect(() => {
    const s = getSession();
    if (s) {
      setName(s.user.name);
      setRole(s.user.role);
    }
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark size={34} />
          <span className="hidden sm:block">
            <span className="block font-display text-[17px] font-extrabold leading-none tracking-tight text-ink">
              OrderKar
            </span>
            <span className="mt-0.5 block text-[11px] font-medium leading-none text-muted">
              Restaurant chalana ab aasaan
            </span>
          </span>
        </Link>

        <div className="ml-2 hidden min-w-0 md:block">
          <h1 className="truncate font-display text-[15px] font-extrabold tracking-tight text-ink">
            {title}
          </h1>
          {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
        </div>

        <nav className="ml-auto flex items-center gap-1.5">
          {role &&
            ROLE_LINKS.filter((l) =>
              role === 'owner' ? true : l.role === role || (role === 'manager' && l.role === 'manager'),
            ).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`hidden rounded-[10px] px-3 py-1.5 text-[13px] font-bold transition sm:block ${
                  active === l.href
                    ? 'bg-ink text-white'
                    : 'text-muted hover:bg-soft hover:text-ink'
                }`}
              >
                {l.label}
              </Link>
            ))}
          <ThemeToggle />
          {name ? (
            <div className="flex items-center gap-2">
              <span className="hidden rounded-[10px] bg-soft px-3 py-1.5 text-[13px] font-bold text-body lg:block">
                {name}
              </span>
              <button
                onClick={() => {
                  logout();
                  router.replace('/login');
                }}
                className="rounded-[10px] px-3 py-1.5 text-[13px] font-bold text-muted transition hover:bg-danger/10 hover:text-danger"
              >
                Logout
              </button>
            </div>
          ) : (
            <LinkBtn href="/login" size="sm" variant="secondary">
              Sign in
            </LinkBtn>
          )}
          {right}
        </nav>
      </div>
    </header>
  );
}

// ------------------------------------------------------------- KPI + delta ---

export function Delta({ value, invert = false }: { value: number | null; invert?: boolean }) {
  if (value === null || !isFinite(value)) return <span className="text-xs font-semibold text-muted">—</span>;
  const good = invert ? value < 0 : value > 0;
  const flat = Math.abs(value) < 0.05;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold ${
        flat ? 'text-muted' : good ? 'text-ok' : 'text-danger'
      }`}
    >
      {!flat && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {value > 0 ? <path d="M7 17L17 7M9 7h8v8" /> : <path d="M7 7l10 10M17 9v8H9" />}
        </svg>
      )}
      {flat ? '±0%' : `${value > 0 ? '+' : ''}${value.toFixed(1)}%`}
    </span>
  );
}

export function Kpi({
  label,
  value,
  delta,
  deltaInvert,
  sub,
  icon,
}: {
  label: string;
  value: string;
  delta?: number | null;
  deltaInvert?: boolean;
  sub?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12.5px] font-semibold uppercase tracking-wider text-muted">{label}</p>
        {icon}
      </div>
      <p className="mt-2 font-display text-[28px] font-extrabold tracking-tight text-ink">{value}</p>
      <div className="mt-1.5 flex items-center gap-2">
        {delta !== undefined && <Delta value={delta} invert={deltaInvert} />}
        {sub && <span className="text-xs text-muted">{sub}</span>}
      </div>
    </Card>
  );
}

// ------------------------------------------------------------------ tabs ---

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  className = '',
}: {
  tabs: { key: T; label: string }[];
  active: T;
  onChange: (k: T) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`rounded-[12px] border-2 px-4 py-2 text-[13px] font-bold transition-all duration-150 ${
            active === t.key
              ? 'border-ink bg-ink text-white shadow-[0_3px_0_var(--c-hard)]'
              : 'border-line bg-surface text-muted hover:border-ink/40 hover:text-ink'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ----------------------------------------------------------------- empty ---

export function Empty({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-soft/60 px-6 py-10 text-center">
      <p className="font-display text-[15px] font-bold text-ink">{title}</p>
      {sub && <p className="mt-1 text-[13px] text-muted">{sub}</p>}
    </div>
  );
}
