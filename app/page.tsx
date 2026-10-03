import Link from 'next/link';
import BrandMark from '@/components/BrandMark';

// ---------------------------------------------------------------------------
// OrderKar — product landing page (sells the software to restaurant owners).
// The live demo runs on sample data for "Spice Villa", Kharian.
// ---------------------------------------------------------------------------

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Live demo', href: '#demo' },
  { label: 'Pricing', href: '#pricing' },
];

const FEATURES = [
  {
    title: 'QR table ordering',
    desc: 'Guests scan the code on their table and order from their own phone. No app download, no waiting for a waiter.',
    href: '/table/1',
    cta: 'Try customer demo',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
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
    desc: 'Orders fire onto the kitchen screen instantly — with timers, priorities, sound alerts and one-tap status updates.',
    href: '/login',
    cta: 'See kitchen screen',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4.5V3h6v1.5" strokeLinecap="round" />
        <path d="M9 11h6M9 15h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Manager analytics',
    desc: 'Live sales, table map, hourly rush charts, waste logs and customer reviews — the whole floor in one dashboard.',
    href: '/login',
    cta: 'See dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
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

const STEPS = [
  { n: '01', title: 'Guest scans the QR', desc: 'Every table gets its own code. The menu opens instantly in the browser — no app to install.' },
  { n: '02', title: 'Order from the phone', desc: 'Big photos, honest PKR prices, special instructions — a full order in under a minute.' },
  { n: '03', title: 'Kitchen fires it up', desc: 'The order lands on the kitchen display with a timer, a sound alert and a flash.' },
  { n: '04', title: 'Manager sees everything', desc: 'Sales, tables, waste and reviews update live on the dashboard.' },
];

const PLANS = [
  {
    name: 'Demo',
    price: 'Free',
    per: 'forever',
    desc: 'The full product running on sample data.',
    features: ['All four screens', '41-dish sample menu', '6 demo tables', 'No signup needed'],
    cta: 'Try the live demo',
    href: '#demo',
    highlight: false,
  },
  {
    name: 'Standard',
    price: 'Rs 4,999',
    per: '/month',
    desc: 'For a single dine-in branch going digital.',
    features: ['QR table ordering', 'Kitchen display + waiter app', 'Manager dashboard', 'Menu management', 'WhatsApp support'],
    cta: 'Talk to us',
    href: '#faq',
    highlight: true,
  },
  {
    name: 'Pro',
    price: 'Rs 9,999',
    per: '/month',
    desc: 'For growing restaurants and multi-branch setups.',
    features: ['Everything in Standard', 'Multi-branch dashboard', 'Waste + staff analytics', 'Priority support', 'Onboarding & training'],
    cta: 'Talk to us',
    href: '#faq',
    highlight: false,
  },
];

const FAQS = [
  {
    q: 'Do I need any special hardware?',
    a: 'No. OrderKar runs on hardware you already have — guests use their own phones, the kitchen display works on any tablet, TV or old PC with a browser, and waiters can use any smartphone.',
  },
  {
    q: 'Does it work if the internet is slow?',
    a: 'The demo you see here runs entirely in the browser. Production setups are deployed so your floor keeps running on your local network, with cloud sync when the connection is available.',
  },
  {
    q: 'Can you set up my restaurant\u2019s menu?',
    a: 'Yes — onboarding includes digitising your complete menu: dishes, categories, photos, PKR prices, and spice levels. Most restaurants are live within a week.',
  },
];

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[290px] sm:w-[310px]">
      {/* Phone frame */}
      <div className="overflow-hidden rounded-[2.75rem] border-[10px] border-pine-deep bg-cream shadow-lift">
        <div className="bg-pine px-4 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrandMark size={30} />
              <div>
                <p className="font-display text-sm font-semibold leading-tight text-cream">Spice Villa</p>
                <p className="text-[10px] text-cream/60">Desi flavours, served with pride</p>
              </div>
            </div>
            <span className="rounded-full bg-saffron px-2.5 py-1 text-[10px] font-bold text-pine-deep">
              Table 4
            </span>
          </div>
        </div>
        <div className="space-y-2 p-3">
          <div className="flex gap-1.5">
            {['BBQ & Grill', 'Karahi', 'Biryani'].map((c, i) => (
              <span
                key={c}
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                  i === 0 ? 'bg-pine text-cream' : 'border border-ink/15 text-ink-soft'
                }`}
              >
                {c}
              </span>
            ))}
          </div>
          {[
            { n: 'Chicken Tikka', p: 'Rs. 280' },
            { n: 'Seekh Kebab (4 pc)', p: 'Rs. 450' },
            { n: 'Chicken Karahi (Half)', p: 'Rs. 850' },
          ].map((d) => (
            <div key={d.n} className="flex items-center justify-between rounded-xl border border-ink/10 bg-white px-3 py-2.5">
              <div>
                <p className="text-xs font-semibold text-ink">{d.n}</p>
                <p className="text-xs font-bold text-pine">{d.p}</p>
              </div>
              <span className="rounded-lg bg-saffron px-3 py-1 text-[10px] font-bold text-pine-deep">ADD</span>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl bg-pine px-4 py-3">
            <span className="text-xs font-bold text-cream">View cart · 3 items</span>
            <span className="text-xs font-bold text-saffron">Rs. 1,580</span>
          </div>
        </div>
      </div>

      {/* Floating kitchen ticket */}
      <div className="animate-float-soft absolute -left-24 top-16 hidden w-44 rounded-2xl border border-pine-line/40 bg-pine-deep p-3 shadow-lift sm:block">
        <p className="font-display text-lg font-bold text-cream">#1006</p>
        <p className="text-xs font-semibold text-saffron">Table 4 · Preparing</p>
        <p className="mt-1 font-mono text-sm font-bold text-cream/80">12:34</p>
        <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-leaf">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-leaf" /> Live
        </p>
      </div>

      {/* Floating ready toast */}
      <div className="absolute -right-20 bottom-24 hidden w-48 rounded-2xl border border-ink/10 bg-white p-3 shadow-lift sm:block">
        <p className="flex items-center gap-2 text-xs font-bold text-leaf-deep">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-leaf/15 text-[11px]">✓</span>
          Order #1004 is ready
        </p>
        <p className="mt-1 text-[11px] text-ink-soft">Table 1 · on its way to the guest</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark size={38} />
            <span>
              <span className="block font-display text-xl font-bold leading-none tracking-tight">OrderKar</span>
              <span className="block text-[11px] font-medium text-ink-soft">Restaurant chalana ab aasaan</span>
            </span>
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-ink-soft transition hover:text-pine">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="hidden rounded-xl border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition hover:border-pine/50 hover:text-pine sm:inline-block"
            >
              Staff login
            </Link>
            <Link
              href="#demo"
              className="rounded-xl bg-pine px-4 py-2 text-sm font-bold text-cream transition hover:bg-pine-soft"
            >
              Try live demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-2 lg:pt-20">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-pine/25 bg-pine/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-pine">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-leaf" />
              Restaurant operations software
            </p>
            <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
              Restaurant chalana,
              <br />
              <span className="text-pine">ab <span className="text-saffron-deep">aasaan.</span></span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
              OrderKar gives your restaurant QR table ordering, a live kitchen display,
              a waiter app and a manager dashboard — one system, zero paperwork.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/table/1"
                className="rounded-2xl bg-saffron px-7 py-3.5 font-bold text-pine-deep shadow-card transition hover:bg-saffron-deep"
              >
                Try the live demo
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-ink/20 px-7 py-3.5 font-semibold text-ink transition hover:border-pine/60 hover:text-pine"
              >
                Explore staff screens
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink-soft">
              <span className="flex items-center gap-2"><span className="text-leaf">✓</span> No hardware needed</span>
              <span className="flex items-center gap-2"><span className="text-leaf">✓</span> Works on any phone</span>
              <span className="flex items-center gap-2"><span className="text-leaf">✓</span> Live in a week</span>
            </div>
          </div>
          <PhoneMockup />
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-pine-deep">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
          {[
            ['4', 'screens, one system'],
            ['41', 'dishes in the demo menu'],
            ['0', 'hardware to buy'],
            ['5 min', 'to learn the floor app'],
          ].map(([v, l]) => (
            <div key={l} className="text-center lg:text-left">
              <p className="font-display text-4xl font-bold text-saffron">{v}</p>
              <p className="mt-1 text-sm text-cream/60">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-saffron-deep">What you get</p>
          <h2 className="mt-2 max-w-xl font-display text-4xl font-bold tracking-tight">
            One system, four screens
          </h2>
          <p className="mt-3 max-w-xl text-ink-soft">
            Every role gets exactly what it needs — nothing more, nothing missing.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col rounded-3xl border border-ink/10 bg-white p-6 shadow-card transition hover:shadow-lift">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pine text-saffron">
                  {f.icon}
                </div>
                <h3 className="mt-4 font-display text-xl font-bold">{f.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
                <Link href={f.href} className="mt-5 text-sm font-bold text-pine hover:text-saffron-deep">
                  {f.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live demo */}
      <section id="demo" className="scroll-mt-20 bg-pine-deep">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-saffron">Live demo</p>
          <h2 className="mt-2 max-w-2xl font-display text-4xl font-bold tracking-tight text-cream">
            Don&apos;t take our word for it — run the floor yourself
          </h2>
          <p className="mt-3 max-w-2xl text-cream/60">
            This demo runs on sample data for <span className="font-semibold text-cream">Spice Villa</span>, Kharian.
            Open the customer menu on your phone, the kitchen display on a second screen, and watch an order travel.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {DEMOS.map((d) => (
              <div key={d.name} className="flex flex-col rounded-3xl border border-pine-line/40 bg-pine-card p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-saffron">{d.tag}</p>
                <h3 className="mt-1 font-display text-2xl font-bold text-cream">{d.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-cream/60">{d.desc}</p>
                {d.cred && (
                  <p className="mt-3 truncate rounded-lg bg-pine-deep px-3 py-2 font-mono text-xs text-cream/70">
                    {d.cred}
                  </p>
                )}
                <Link
                  href={d.href}
                  className="mt-4 rounded-xl bg-saffron px-4 py-2.5 text-center text-sm font-bold text-pine-deep transition hover:bg-saffron-deep"
                >
                  {d.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-cream/50">
            Staff demo password for all accounts: <code className="rounded bg-white/10 px-2 py-0.5 font-mono text-saffron">demo123</code>
            {' '}· Customer demo needs no login.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-saffron-deep">How it works</p>
          <h2 className="mt-2 font-display text-4xl font-bold tracking-tight">From scan to served</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <p className="font-display text-5xl font-bold text-pine/15">{s.n}</p>
                <h3 className="mt-2 font-semibold text-ink">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 border-t border-ink/10 bg-cream-dim/60">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-saffron-deep">Pricing</p>
          <h2 className="mt-2 font-display text-4xl font-bold tracking-tight">Simple plans, honest prices</h2>
          <p className="mt-3 max-w-xl text-ink-soft">Indicative pricing — final quotes depend on your branches and setup.</p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`flex flex-col rounded-3xl border p-7 ${
                  p.highlight
                    ? 'border-pine bg-pine text-cream shadow-lift'
                    : 'border-ink/10 bg-white shadow-card'
                }`}
              >
                {p.highlight && (
                  <p className="mb-3 inline-block w-fit rounded-full bg-saffron px-3 py-1 text-xs font-bold uppercase tracking-wider text-pine-deep">
                    Most popular
                  </p>
                )}
                <h3 className={`font-display text-xl font-bold ${p.highlight ? 'text-cream' : 'text-ink'}`}>{p.name}</h3>
                <p className="mt-2">
                  <span className={`font-display text-4xl font-bold ${p.highlight ? 'text-saffron' : 'text-pine'}`}>{p.price}</span>
                  <span className={`text-sm ${p.highlight ? 'text-cream/60' : 'text-ink-soft'}`}> {p.per}</span>
                </p>
                <p className={`mt-2 text-sm ${p.highlight ? 'text-cream/70' : 'text-ink-soft'}`}>{p.desc}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${p.highlight ? 'text-cream/85' : 'text-ink'}`}>
                      <span className={p.highlight ? 'text-saffron' : 'text-leaf'}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className={`mt-6 rounded-2xl px-5 py-3 text-center font-bold transition ${
                    p.highlight
                      ? 'bg-saffron text-pine-deep hover:bg-saffron-deep'
                      : 'border border-ink/15 text-ink hover:border-pine/60 hover:text-pine'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-saffron-deep">FAQ</p>
          <h2 className="mt-2 font-display text-4xl font-bold tracking-tight">Common questions</h2>
          <div className="mt-8 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-ink/10 bg-white px-6 py-4 shadow-card">
                <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {f.q}
                    <span className="text-xl text-pine transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pine-deep">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2.5">
                <BrandMark size={36} />
                <span className="font-display text-xl font-bold text-cream">OrderKar</span>
              </div>
              <p className="mt-3 text-sm text-cream/55">Restaurant chalana ab aasaan.</p>
              <p className="mt-1 text-sm text-cream/40">QR ordering · Kitchen display · Waiter app · Manager dashboard</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cream/40">Product</p>
              <div className="mt-3 flex flex-col gap-2">
                {NAV_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} className="text-sm text-cream/70 transition hover:text-saffron">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cream/40">Live demo</p>
              <div className="mt-3 flex flex-col gap-2">
                <Link href="/table/1" className="text-sm text-cream/70 transition hover:text-saffron">Customer · Table 1</Link>
                <Link href="/login" className="text-sm text-cream/70 transition hover:text-saffron">Waiter login</Link>
                <Link href="/login" className="text-sm text-cream/70 transition hover:text-saffron">Kitchen login</Link>
                <Link href="/login" className="text-sm text-cream/70 transition hover:text-saffron">Manager login</Link>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-cream/10 pt-6 text-xs text-cream/40 sm:flex-row">
            <p>© 2026 OrderKar · Demo restaurant: Spice Villa, Kharian</p>
            <p>Demo data — no real orders are sent.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
