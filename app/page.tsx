import Link from 'next/link';
import DishImage from '@/components/DishImage';

const ROLES = [
  {
    name: 'Customer',
    tag: 'QR Ordering',
    desc: 'Guests scan the QR on their table, browse the menu and order from their phone — no app needed.',
    href: '/table/1',
    cta: 'Try the demo · Table 1',
  },
  {
    name: 'Waiter',
    tag: 'Tableside ordering',
    desc: 'Take orders at the table on any device, see live table status and close out bills.',
    href: '/login',
    cta: 'Waiter login',
  },
  {
    name: 'Kitchen',
    tag: 'Live display',
    desc: 'Orders fire onto the kitchen screen instantly with timers, priorities and one-tap status updates.',
    href: '/login',
    cta: 'Kitchen login',
  },
  {
    name: 'Manager',
    tag: 'Full control',
    desc: 'Live sales, table map, waste logs and customer reviews — the whole floor in one dashboard.',
    href: '/login',
    cta: 'Manager login',
  },
];

const STEPS = [
  { n: '01', title: 'Guest scans the QR', desc: 'Every table has its own code. The menu opens instantly in the browser.' },
  { n: '02', title: 'Order from the phone', desc: 'Big photos, honest prices, special instructions — order in under a minute.' },
  { n: '03', title: 'Kitchen fires it up', desc: 'The order lands on the kitchen display with a timer and an alert.' },
  { n: '04', title: 'Manager sees everything', desc: 'Sales, tables, waste and reviews update live on the dashboard.' },
];

const CREDENTIALS = [
  { role: 'Manager', email: 'manager@spicevilla.pk', name: 'Ali Raza' },
  { role: 'Kitchen', email: 'kitchen@spicevilla.pk', name: 'Bilal Ahmed' },
  { role: 'Waiter', email: 'waiter@spicevilla.pk', name: 'Usman Tariq' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#16130E] text-[#FAF6EE]">
      {/* Nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9A13B] font-display text-xl font-bold text-[#16130E]">
            S
          </div>
          <span className="font-display text-xl font-semibold">Spice Villa</span>
        </div>
        <Link
          href="/login"
          className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-[#FAF6EE]/80 transition hover:border-[#E9A13B]/60 hover:text-[#E9A13B]"
        >
          Staff login
        </Link>
      </nav>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-2 lg:pt-14">
        <div>
          <p className="mb-4 inline-block rounded-full border border-[#E9A13B]/40 bg-[#E9A13B]/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#E9A13B]">
            Restaurant operations prototype
          </p>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] sm:text-6xl">
            Desi flavours,
            <br />
            run like <span className="text-[#E9A13B]">clockwork</span>.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-[#FAF6EE]/65">
            Spice Villa&apos;s complete floor system — QR ordering for guests, a live kitchen
            display, waiter tools and a manager dashboard. One flow, zero paperwork.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/table/1"
              className="rounded-2xl bg-[#E9A13B] px-7 py-3.5 font-bold text-[#16130E] transition hover:bg-[#f2b45c]"
            >
              Try customer demo
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border border-white/20 px-7 py-3.5 font-medium text-[#FAF6EE] transition hover:border-[#E9A13B]/60 hover:text-[#E9A13B]"
            >
              Staff sign in
            </Link>
          </div>
          <p className="mt-4 text-sm text-[#FAF6EE]/40">
            Main Bahadurabad Road, Karachi · 021-34567890
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <DishImage
            src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80"
            alt="Chicken Biryani"
            className="aspect-[3/4] w-full rounded-3xl"
          />
          <div className="flex flex-col gap-4 pt-8">
            <DishImage
              src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80"
              alt="Chicken Karahi"
              className="aspect-square w-full rounded-3xl"
            />
            <DishImage
              src="https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80"
              alt="Chicken Tikka"
              className="aspect-square w-full rounded-3xl"
            />
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="border-t border-white/10 bg-[#1c1710]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-semibold">One system, four screens</h2>
          <p className="mt-2 text-[#FAF6EE]/55">Every role gets exactly what it needs — nothing more.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r) => (
              <div key={r.name} className="flex flex-col rounded-2xl border border-white/10 bg-[#211C14] p-6">
                <p className="text-xs font-medium uppercase tracking-widest text-[#E9A13B]">{r.tag}</p>
                <h3 className="mt-1 font-display text-2xl font-semibold">{r.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#FAF6EE]/60">{r.desc}</p>
                <Link
                  href={r.href}
                  className="mt-5 inline-block rounded-xl bg-white/[0.06] px-4 py-2.5 text-center text-sm font-medium text-[#FAF6EE] transition hover:bg-[#E9A13B] hover:text-[#16130E]"
                >
                  {r.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold">How it works</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="relative">
              <p className="font-display text-5xl font-semibold text-[#E9A13B]/25">{s.n}</p>
              <h3 className="mt-2 font-medium text-[#FAF6EE]">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#FAF6EE]/55">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo credentials */}
      <section className="border-t border-white/10 bg-[#1c1710]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-semibold">Demo accounts</h2>
          <p className="mt-2 text-[#FAF6EE]/55">
            Sign in as any role to explore its screen. Password for all accounts:{' '}
            <code className="rounded bg-white/10 px-2 py-0.5 font-mono text-[#E9A13B]">demo123</code>
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white/[0.04] text-xs uppercase tracking-widest text-[#FAF6EE]/45">
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                </tr>
              </thead>
              <tbody>
                {CREDENTIALS.map((c) => (
                  <tr key={c.email} className="border-t border-white/10">
                    <td className="px-5 py-3 font-medium text-[#E9A13B]">{c.role}</td>
                    <td className="px-5 py-3 text-[#FAF6EE]/80">{c.name}</td>
                    <td className="px-5 py-3 font-mono text-[13px] text-[#FAF6EE]/70">{c.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-[#FAF6EE]/45">
            Customer demo needs no login — open <Link href="/table/1" className="text-[#E9A13B] underline">/table/1</Link> (tables 1–6) on your phone to simulate a guest scan.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-[#FAF6EE]/40 sm:flex-row sm:px-6">
          <p>Spice Villa · Restaurant operations prototype</p>
          <p>Demo data — no real orders are sent.</p>
        </div>
      </footer>
    </div>
  );
}
