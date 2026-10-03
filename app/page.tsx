'use client';

// ---------------------------------------------------------------------------
// OrderKar — product landing page (sells the software to restaurant owners).
// KoDriftDev design language: silver canvas, Manrope hero, neo-brutalist CTAs.
// ---------------------------------------------------------------------------

import { useState } from 'react';
import Link from 'next/link';
import BrandMark from '@/components/BrandMark';
import { LinkBtn, ThemeToggle, Card, Pill } from '@/components/ui';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Live demo', href: '#demo' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

const FEATURES = [
  {
    title: 'QR table ordering',
    desc: 'Guests scan the code on their table and order from their own phone. No app download, no flagging down a waiter.',
    href: '/table/1',
    cta: 'Try customer demo',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="3" height="3" rx="0.75" />
        <rect x="18" y="18" width="3" height="3" rx="0.75" />
      </svg>
    ),
  },
  {
    title: 'Live kitchen display',
    desc: 'Orders fire onto the kitchen screen instantly — timers, priorities, sound alerts and one-tap status updates.',
    href: '/login',
    cta: 'See kitchen screen',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path d="M12 3c1.5 2.5 4 4.5 4 8a4 4 0 1 1-8 0c0-1.5.5-2.5 1.2-3.7.4 1 1 1.7 1.8 2.2C10.6 7 11 5 12 3z" strokeLinejoin="round" />
        <path d="M9 21h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Waiter app',
    desc: 'Take orders tableside on any device, see live table status at a glance and close out bills in one tap.',
    href: '/login',
    cta: 'See waiter screen',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4.5V3h6v1.5" strokeLinecap="round" />
        <path d="M9 11h6M9 15h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Owner analytics',
    desc: 'Year of history, rush-hour heatmaps, top items, staff leaderboard, waste tracking — the whole business in one dashboard.',
    href: '/login',
    cta: 'See owner dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path d="M4 20V10M10 20V4M16 20v-8M21 20H3" strokeLinecap="round" />
      </svg>
    ),
  },
];

const DEMOS = [
  {
    name: 'Customer',
    tag: 'QR ordering',
    desc: 'Scan-and-order menu as a guest would see it. No login needed — this is Table 1 at Spice Villa.',
    href: '/table/1',
    cta: 'Open Table 1',
    cred: null as string | null,
  },
  {
    name: 'Owner',
    tag: 'Superadmin',
    desc: 'Full business analytics — revenue trends, rush hours, top items, staff leaderboard, live previews.',
    href: '/login',
    cta: 'Sign in as owner',
    cred: 'owner@orderkar.pk',
  },
  {
    name: 'Waiter',
    tag: 'Tableside app',
    desc: 'Live table grid, take orders at the table, close out bills.',
    href: '/login',
    cta: 'Sign in as waiter',
    cred: 'waiter@orderkar.pk',
  },
  {
    name: 'Kitchen',
    tag: 'Live display',
    desc: 'Real-time order queue with timers and alerts — best on a big screen.',
    href: '/login',
    cta: 'Sign in as kitchen',
    cred: 'kitchen@orderkar.pk',
  },
  {
    name: 'Manager',
    tag: 'Dashboard',
    desc: 'Sales, tables, waste log, reviews and hourly rush analytics.',
    href: '/login',
    cta: 'Sign in as manager',
    cred: 'manager@orderkar.pk',
  },
];

const FAQS = [
  {
    q: 'Do guests need to install an app?',
    a: 'No. Guests scan the QR on their table and the menu opens in their browser — ordering, cart and live order tracking all work without any download.',
  },
  {
    q: 'Does it work without the internet on the restaurant Wi-Fi?',
    a: 'The demo runs fully in the browser with local data. The production version syncs through the cloud so every screen — customer, waiter, kitchen, manager — stays live in real time.',
  },
  {
    q: 'Can I use my own menu and prices?',
    a: 'Yes. The manager dashboard includes a menu editor (demo build ships with Spice Villa\u2019s 41-item sample menu). Categories, items, prices and availability are all editable.',
  },
  {
    q: 'What do I need in the restaurant to run it?',
    a: 'Printed QR codes on tables (generated in-app), one tablet or TV for the kitchen display, and phones for waiters. That\u2019s it — no special hardware.',
  },
  {
    q: 'Is my data safe?',
    a: 'The demo keeps everything in the browser. Production runs on a managed database with daily backups, and staff log in with role-based access.',
  },
];

const PRICING = [
  {
    name: 'Demo',
    price: 'Free',
    per: 'forever',
    desc: 'Try every screen with sample data.',
    features: ['All 5 demo screens', 'Sample Spice Villa menu', 'QR code generator', 'No credit card'],
    cta: 'Try the demo',
    href: '#demo',
    hot: false,
  },
  {
    name: 'Standard',
    price: 'Rs 4,999',
    per: '/month',
    desc: 'For single-outlet restaurants.',
    features: ['Unlimited orders', 'QR ordering + kitchen display', 'Waiter & manager apps', 'Menu editor', 'WhatsApp support'],
    cta: 'Start 14-day trial',
    href: '#demo',
    hot: true,
  },
  {
    name: 'Pro',
    price: 'Rs 9,999',
    per: '/month',
    desc: 'For growing brands & multi-branch.',
    features: ['Everything in Standard', 'Owner analytics suite', 'Multi-branch support', 'Staff performance reports', 'Priority onboarding'],
    cta: 'Talk to us',
    href: '#demo',
    hot: false,
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-card border border-line bg-surface shadow-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-display text-[15px] font-bold text-ink">{q}</span>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border-2 border-ink text-ink transition-transform ${open ? 'rotate-45 bg-ink text-white' : 'bg-surface'}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </span>
      </button>
      {open && <p className="px-5 pb-5 text-sm leading-relaxed text-body">{a}</p>}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-page">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line bg-page/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark size={34} />
            <span>
              <span className="block font-display text-[17px] font-extrabold leading-none tracking-tight text-ink">OrderKar</span>
              <span className="mt-0.5 block text-[11px] font-medium leading-none text-muted">Restaurant chalana ab aasaan</span>
            </span>
          </Link>
          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-[10px] px-3 py-1.5 text-[13.5px] font-semibold text-muted transition hover:bg-soft hover:text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <LinkBtn href="/login" variant="secondary" size="sm" className="hidden sm:inline-flex">Sign in</LinkBtn>
            <LinkBtn href="#demo" size="sm">Live demo</LinkBtn>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Pill tone="brand" className="mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse-dot" />
              Built for Pakistani dine-in restaurants
            </Pill>
            <h1 className="font-display text-[40px] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-[56px]">
              Restaurant chalana <span className="text-brand">ab aasaan.</span>
            </h1>
            <p className="mt-5 max-w-lg text-[16.5px] leading-relaxed text-body">
              OrderKar is the operating system for dine-in restaurants — QR table ordering,
              a live kitchen display, waiter app, and owner analytics. One system,
              every screen, zero chaos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkBtn href="#demo" size="lg">Try the live demo</LinkBtn>
              <LinkBtn href="/login" variant="secondary" size="lg">Sign in as staff</LinkBtn>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              {[
                ['41+', 'menu items in demo'],
                ['5', 'role-based screens'],
                ['0', 'apps to install'],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="font-display text-2xl font-extrabold text-ink">{v}</p>
                  <p className="text-[12.5px] text-muted">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual: phone mockup + floating tickets */}
          <div className="relative mx-auto w-full max-w-[420px]">
            <div className="rounded-[28px] border-2 border-ink bg-surface p-3 shadow-[0_6px_0_var(--c-hard),0_30px_60px_rgba(16,40,39,0.18)]">
              <div className="overflow-hidden rounded-[20px] border border-line bg-soft">
                <div className="flex items-center justify-between bg-surface px-4 py-3">
                  <div className="flex items-center gap-2">
                    <BrandMark size={26} />
                    <span className="font-display text-sm font-extrabold text-ink">Spice Villa</span>
                  </div>
                  <Pill tone="brand">Table 4</Pill>
                </div>
                <div className="space-y-2.5 p-4">
                  {[
                    ['Chicken Karahi (Half)', 'Rs 850', true],
                    ['Chicken Biryani', 'Rs 280', true],
                    ['Mango Shake', 'Rs 320', false],
                    ['Cheese Naan', 'Rs 150', false],
                  ].map(([name, price, hot]) => (
                    <div key={name as string} className="flex items-center gap-3 rounded-[14px] border border-line bg-surface px-3.5 py-3">
                      <div className="flex-1">
                        <p className="text-[13.5px] font-bold text-ink">{name}</p>
                        <p className="text-xs text-muted">{price}</p>
                      </div>
                      {hot ? <Pill tone="coral">Bestseller</Pill> : null}
                      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-brand font-display text-lg font-extrabold text-white">+</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 pt-0">
                  <div className="rounded-[14px] border-2 border-ink bg-brand px-4 py-3 text-center font-display text-[15px] font-extrabold text-white shadow-[0_3px_0_var(--c-hard)]">
                    Place order · Rs 1,600
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -left-6 top-10 hidden animate-float-soft rounded-[14px] border-2 border-ink bg-surface px-4 py-3 shadow-[0_3px_0_var(--c-hard)] sm:block">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Kitchen</p>
              <p className="font-display text-sm font-extrabold text-ink">Order #1042 · firing</p>
            </div>
            <div className="absolute -right-4 bottom-16 hidden animate-float-soft rounded-[14px] border-2 border-ink bg-surface px-4 py-3 shadow-[0_3px_0_var(--c-hard)] [animation-delay:1.5s] sm:block">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Manager</p>
              <p className="font-display text-sm font-extrabold text-ok">Rs 86,400 today</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-line bg-soft">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4">
          {[
            ['~30 sec', 'from scan to kitchen'],
            ['6', 'tables live in demo'],
            ['12 mo', 'of sales history'],
            ['24/7', 'kitchen display'],
          ].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="font-display text-[26px] font-extrabold tracking-tight text-ink">{v}</p>
              <p className="mt-1 text-[12.5px] text-muted">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-brand">Features</p>
        <h2 className="mt-2 max-w-xl font-display text-[30px] font-extrabold leading-tight tracking-tight text-ink sm:text-[38px]">
          Everything the floor needs, nothing it doesn&apos;t.
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="group flex flex-col p-6 transition-all hover:-translate-y-1 hover:shadow-lift">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border-2 border-ink bg-brand/10 text-brand">
                {f.icon}
              </div>
              <h3 className="mt-4 font-display text-[17px] font-extrabold tracking-tight text-ink">{f.title}</h3>
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-body">{f.desc}</p>
              <Link href={f.href} className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-brand hover:underline">
                {f.cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6l6 6-6 6" /></svg>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Live demo */}
      <section id="demo" className="border-y border-line bg-soft">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-brand">Live demo</p>
          <h2 className="mt-2 max-w-xl font-display text-[30px] font-extrabold leading-tight tracking-tight text-ink sm:text-[38px]">
            Walk the whole restaurant, right here.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] text-body">
            Every screen below is live and connected. Place an order as a customer, then watch it
            land on the kitchen display. Demo password for all staff accounts:{' '}
            <code className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-[13px] font-bold text-ink">demo123</code>
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DEMOS.map((d) => (
              <Card key={d.name} className="flex flex-col p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-[17px] font-extrabold text-ink">{d.name}</h3>
                  <Pill tone="brand">{d.tag}</Pill>
                </div>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-body">{d.desc}</p>
                {d.cred && <p className="mt-3 font-mono text-xs text-muted">{d.cred}</p>}
                <div className="mt-4">
                  <LinkBtn href={d.href} variant="secondary" size="sm" className="w-full">{d.cta}</LinkBtn>
                </div>
              </Card>
            ))}
            <Card className="flex flex-col justify-center border-2 border-dashed p-6 text-center">
              <p className="font-display text-[16px] font-extrabold text-ink">Prefer the QR way?</p>
              <p className="mt-1.5 text-[13px] text-muted">Point your phone at a table QR — each opens that table&apos;s menu.</p>
              <div className="mt-4">
                <LinkBtn href="/login" size="sm">Get QR codes</LinkBtn>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-brand">How it works</p>
        <h2 className="mt-2 font-display text-[30px] font-extrabold tracking-tight text-ink sm:text-[38px]">Live in an afternoon.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['1', 'Add your menu', 'Enter items, prices and categories once. Print table QR codes from the dashboard.'],
            ['2', 'Put up the screens', 'One tablet for the kitchen display, phones for waiters. Guests just use their own phones.'],
            ['3', 'Watch it run', 'Orders flow table → kitchen → table. Owners watch revenue, rush hours and staff — live.'],
          ].map(([n, t, d]) => (
            <Card key={n} className="p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border-2 border-ink bg-ink font-display text-lg font-extrabold text-white">{n}</span>
              <h3 className="mt-4 font-display text-[17px] font-extrabold text-ink">{t}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-body">{d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y border-line bg-soft">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-brand">Pricing</p>
          <h2 className="mt-2 font-display text-[30px] font-extrabold tracking-tight text-ink sm:text-[38px]">Simple, honest pricing.</h2>
          <p className="mt-2 text-sm text-muted">Indicative launch pricing — final plans confirmed at onboarding.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PRICING.map((p) => (
              <Card key={p.name} className={`flex flex-col p-6 ${p.hot ? 'border-2 !border-ink shadow-[0_4px_0_var(--c-hard)]' : ''}`}>
                {p.hot && <Pill tone="coral" className="mb-3 self-start">Most popular</Pill>}
                <h3 className="font-display text-[17px] font-extrabold text-ink">{p.name}</h3>
                <p className="mt-2"><span className="font-display text-[32px] font-extrabold tracking-tight text-ink">{p.price}</span><span className="text-sm text-muted"> {p.per}</span></p>
                <p className="mt-1 text-[13px] text-muted">{p.desc}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-[13.5px] text-body">
                      <svg className="mt-0.5 shrink-0 text-ok" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <LinkBtn href={p.href} variant={p.hot ? 'primary' : 'secondary'} className="w-full">{p.cta}</LinkBtn>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-brand">FAQ</p>
        <h2 className="mt-2 font-display text-[30px] font-extrabold tracking-tight text-ink sm:text-[38px]">Questions, answered.</h2>
        <div className="mt-8 space-y-3">
          {FAQS.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* CTA + footer */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-[24px] border-2 border-ink bg-ink px-6 py-12 text-center shadow-[0_5px_0_var(--c-hard)] sm:py-16">
          <h2 className="mx-auto max-w-xl font-display text-[28px] font-extrabold leading-tight tracking-tight text-white sm:text-[38px]">
            Ready to run your floor on OrderKar?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-white/70">
            Try the full live demo — customer to kitchen to owner — in the next two minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkBtn href="#demo" size="lg" className="!border-white">Start the demo</LinkBtn>
            <LinkBtn href="/login" variant="secondary" size="lg">Sign in</LinkBtn>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <BrandMark size={28} />
            <div>
              <p className="font-display text-sm font-extrabold text-ink">OrderKar</p>
              <p className="text-xs text-muted">Restaurant chalana ab aasaan.</p>
            </div>
          </div>
          <p className="text-[12.5px] text-muted">Demo build · Sample data for Spice Villa, Kharian · Built by KoDrift Dev</p>
        </div>
      </footer>
    </div>
  );
}
