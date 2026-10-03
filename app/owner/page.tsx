'use client';

// ---------------------------------------------------------------------------
// /owner — Owner / superadmin dashboard. The app's main page after owner login.
// Time-filtered KPIs, hand-rolled SVG charts, ops metrics, live role previews
// (same-origin iframes), recent orders, alerts, and the QR code section.
// ---------------------------------------------------------------------------

import { useMemo, useState } from 'react';
import { RequireRole } from '@/lib/auth';
import {
  aggregate,
  capToTimeOfDay,
  categoryMix,
  deltaPct,
  getRangeData,
  RANGES,
  reviewsInRange,
  slowOrders,
  staffLeaderboard,
  topItems,
  wasteInRange,
  type RangeKey,
} from '@/lib/analytics';
import { getTables, useLiveDb } from '@/lib/db';
import { fmtAgo, pkr } from '@/lib/format';
import { AppHeader, Btn, Card, Delta, Empty, Kpi, Pill, SectionHead, Tabs } from '@/components/ui';
import { AreaChart, Donut, RushHeatmap, TopBars, WeekdayBars } from '@/components/charts';
import QrSection from '@/components/QrSection';
import StatusPill from '@/components/StatusPill';

const WD_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type LiveTab = 'customer' | 'waiter' | 'kitchen' | 'manager';
const LIVE_TABS: { key: LiveTab; label: string; src: string; desc: string }[] = [
  { key: 'customer', label: 'Customer', src: '/table/1?preview=1', desc: 'What guests see after scanning a table QR — live menu, cart and order tracking.' },
  { key: 'waiter', label: 'Waiter', src: '/waiter?preview=1', desc: 'Tableside ordering, running orders and close-out — the floor staff view.' },
  { key: 'kitchen', label: 'Kitchen', src: '/kitchen?preview=1', desc: 'Live kitchen display — new tickets flash in, timers run, items fire in sequence.' },
  { key: 'manager', label: 'Manager', src: '/manager?preview=1', desc: 'Day-to-day floor control — live orders, tables, waste log and reviews.' },
];

function OwnerApp() {
  const db = useLiveDb();
  const [rangeKey, setRangeKey] = useState<RangeKey>('30d');
  const [liveTab, setLiveTab] = useState<LiveTab>('customer');
  const [mobileFrame, setMobileFrame] = useState(true);

  const def = RANGES.find((r) => r.key === rangeKey) ?? RANGES[3];

  const data = useMemo(() => getRangeData(db, def.days, def.offset), [db, def]);
  const agg = useMemo(() => aggregate(db, data), [db, data]);
  // Previous equivalent period. "Today" compares against yesterday capped at
  // the same clock time; 12 months has no baseline in the seed → null deltas.
  const prev = useMemo(() => {
    if (def.key === '12m') return null;
    const p = getRangeData(db, def.days, def.offset + def.days);
    const capped = def.key === 'today' ? capToTimeOfDay(p, new Date()) : p;
    return aggregate(db, capped);
  }, [db, def]);
  const dRevenue = prev ? deltaPct(agg.revenue, prev.revenue) : null;
  const dOrders = prev ? deltaPct(agg.orders, prev.orders) : null;
  const dAov = prev ? deltaPct(agg.aov, prev.aov) : null;
  const dCovers = prev ? deltaPct(agg.covers, prev.covers) : null;

  const tops = useMemo(() => topItems(db, agg, 10), [db, agg]);
  const cats = useMemo(() => categoryMix(db, agg), [db, agg]);
  const staff = useMemo(() => staffLeaderboard(db, agg), [db, agg]);
  const tables = useMemo(() => getTables(db), [db]);

  const waste = useMemo(() => wasteInRange(db, data.window), [db, data]);
  const wastePrev = useMemo(() => {
    if (def.key === '12m') return 0;
    const p = getRangeData(db, def.days, def.offset + def.days);
    return wasteInRange(db, p.window);
  }, [db, def]);
  const rev = useMemo(() => reviewsInRange(db, data.window), [db, data]);
  const slow = useMemo(() => slowOrders(db, data, 40), [db, data]);

  const avgPrep = agg.prepCount ? Math.round(agg.prepSum / agg.prepCount) : 0;
  const prevPrep = prev && prev.prepCount ? prev.prepSum / prev.prepCount : 0;
  const turnover = agg.orders / (tables.length * data.window.days);
  const bestDay = agg.weekday.indexOf(Math.max(...agg.weekday));
  const recentOrders = useMemo(
    () => [...data.orders].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 8),
    [data],
  );

  const alerts: { tone: 'warn' | 'danger' | 'brand'; text: string }[] = [];
  if (slow.n > 0) alerts.push({ tone: 'warn', text: `${slow.n} order${slow.n > 1 ? 's' : ''} took 40+ min in this period (slowest ${slow.slowest} min). Check kitchen load at peak hours.` });
  const wasteDelta = deltaPct(waste, wastePrev);
  if (wasteDelta !== null && wasteDelta > 30 && waste > 0)
    alerts.push({ tone: 'danger', text: `Waste cost is up ${wasteDelta.toFixed(0)}% vs the previous period — review over-prep on slow days.` });
  if (rev.count >= 5 && rev.avg < 4.2)
    alerts.push({ tone: 'brand', text: `Average rating dipped to ${rev.avg.toFixed(1)}★ across ${rev.count} reviews — read the latest feedback below.` });

  const activeLive = LIVE_TABS.find((t) => t.key === liveTab) ?? LIVE_TABS[0];

  return (
    <div className="min-h-screen bg-page">
      <AppHeader title="Owner Dashboard" subtitle={`${db.restaurant.name} · ${db.restaurant.address}`} active="/owner" />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6">
        {/* Time range */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-extrabold tracking-tight text-ink">Business overview</h2>
            <p className="text-[13px] text-muted">
              {data.window.start.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })} —{' '}
              {data.window.end.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <Tabs<RangeKey>
            tabs={RANGES.map((r) => ({ key: r.key, label: r.label }))}
            active={rangeKey}
            onChange={setRangeKey}
          />
        </div>

        {/* KPIs */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Total revenue" value={pkr(agg.revenue)} delta={dRevenue} sub={def.key === '12m' ? 'last 12 months' : 'vs previous period'} />
          <Kpi label="Total orders" value={agg.orders.toLocaleString()} delta={dOrders} sub={def.key === '12m' ? 'last 12 months' : 'vs previous period'} />
          <Kpi label="Avg order value" value={pkr(Math.round(agg.aov))} delta={dAov} sub="per order" />
          <Kpi label="Covers" value={agg.covers.toLocaleString()} delta={dCovers} sub="guests served" />
        </section>

        {/* Revenue + rush hours */}
        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <SectionHead title="Revenue trend" sub={def.days === 1 ? 'Hourly revenue' : def.days <= 31 ? 'Daily revenue' : 'Weekly revenue'} />
            <AreaChart points={agg.series.map((s) => s.value)} labels={agg.series.map((s) => s.label)} formatY={(v) => pkr(v)} />
          </Card>
          <Card className="p-5">
            <SectionHead title="Rush hours" sub="Orders by hour — darker = busier" />
            <RushHeatmap hours={agg.hours} />
            <p className="mt-3 text-[12.5px] text-muted">
              Peak: <span className="font-bold text-ink">{agg.hours.indexOf(Math.max(...agg.hours))}:00</span> · Busiest day:{' '}
              <span className="font-bold text-ink">{WD_NAMES[bestDay]}</span>
            </p>
          </Card>
        </section>

        {/* Weekday + top items + category mix */}
        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5">
            <SectionHead title="Orders by weekday" sub={`${WD_NAMES[bestDay]} brings the rush`} />
            <WeekdayBars values={agg.weekday} />
          </Card>
          <Card className="p-5">
            <SectionHead title="Top 10 items" sub="By quantity sold" />
            <TopBars rows={tops.map((t) => ({ label: t.name, value: t.qty, sub: `· ${pkr(t.revenue)}` }))} />
          </Card>
          <Card className="p-5">
            <SectionHead title="Category mix" sub="Revenue share" />
            <Donut slices={cats.map((c) => ({ label: c.label, value: c.value }))} />
          </Card>
        </section>

        {/* Ops metrics */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Avg prep time" value={avgPrep ? `${avgPrep} min` : '—'} delta={prevPrep ? deltaPct(avgPrep, prevPrep) : null} deltaInvert sub="kitchen → ready" />
          <Kpi label="Table turnover" value={`${turnover.toFixed(1)}×`} sub={`orders / table / day`} />
          <Kpi label="Waste cost" value={pkr(waste)} delta={wasteDelta} deltaInvert sub="spoilage + over-prep" />
          <Kpi
            label="Avg rating"
            value={rev.count ? `${rev.avg.toFixed(1)}★` : '—'}
            sub={rev.count ? `${rev.count} reviews` : 'no reviews in range'}
          />
        </section>

        {/* Staff + recent orders + alerts */}
        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5">
            <SectionHead title="Staff leaderboard" sub="Orders served in range" />
            {staff.length === 0 ? (
              <Empty title="No waiter activity" sub="in this period" />
            ) : (
              <div className="space-y-2">
                {staff.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-[12px] border border-line bg-soft/60 px-3.5 py-2.5">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-[10px] font-display text-sm font-extrabold ${i === 0 ? 'bg-brand text-white' : 'bg-surface text-muted border border-line'}`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-bold text-ink">{s.name}</p>
                      <p className="text-xs text-muted">{pkr(s.revenue)} served</p>
                    </div>
                    <span className="font-display text-lg font-extrabold text-ink">{s.orders}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5 lg:col-span-2">
            <SectionHead
              title="Recent orders"
              sub="Live — updates as orders come in"
              action={<Pill tone="ok"><span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse-dot" /> Live</Pill>}
            />
            {recentOrders.length === 0 ? (
              <Empty title="No orders in this range" />
            ) : (
              <div className="divide-y divide-line overflow-hidden rounded-[12px] border border-line">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center gap-3 bg-surface px-4 py-2.5">
                    <span className="font-display text-[13px] font-extrabold text-ink">#{o.order_number}</span>
                    <span className="text-[13px] text-muted">T{tableName(db, o.table_id)}</span>
                    <span className="hidden truncate text-[13px] text-body sm:block">
                      {o.items.map((i) => `${i.quantity}× ${i.item_name}`).join(', ')}
                    </span>
                    <span className="ml-auto font-bold text-[13.5px] text-ink">{pkr(o.total_amount)}</span>
                    <StatusPill status={o.status} />
                    <span className="hidden text-xs text-muted md:block">{fmtAgo(o.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
            {alerts.length > 0 && (
              <div className="mt-4 space-y-2">
                {alerts.map((a, i) => (
                  <div key={i} className={`flex gap-2.5 rounded-[12px] border border-line px-4 py-3 text-[13px] font-medium ${a.tone === 'danger' ? 'bg-danger/8 text-danger' : a.tone === 'warn' ? 'bg-warn/10 text-[#92600a]' : 'bg-brand/8 text-brand-deep'}`}>
                    <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M12 8v5m0 3.5v.1M10.3 3.8L2.6 17a2 2 0 001.7 3h15.4a2 2 0 001.7-3L13.7 3.8a2 2 0 00-3.4 0z" />
                    </svg>
                    {a.text}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>

        {/* Live views */}
        <section>
          <SectionHead
            title="Live views"
            sub="Every screen, live, in one place — same data, updating in real time. No need to open separate pages."
          />
          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Tabs<LiveTab>
                tabs={LIVE_TABS.map((t) => ({ key: t.key, label: t.label }))}
                active={liveTab}
                onChange={setLiveTab}
              />
              {liveTab === 'customer' && (
                <div className="ml-auto flex gap-2">
                  <Btn size="sm" variant={mobileFrame ? 'dark' : 'secondary'} onClick={() => setMobileFrame(true)}>Mobile</Btn>
                  <Btn size="sm" variant={!mobileFrame ? 'dark' : 'secondary'} onClick={() => setMobileFrame(false)}>Desktop</Btn>
                </div>
              )}
            </div>
            <p className="mb-3 text-[13px] text-muted">{activeLive.desc}</p>
            <div className={`overflow-hidden rounded-[16px] border border-line bg-soft ${liveTab === 'customer' && mobileFrame ? 'mx-auto max-w-[400px]' : ''}`}>
              <iframe
                key={activeLive.src}
                src={activeLive.src}
                title={`${activeLive.label} live preview`}
                className="h-[560px] w-full bg-white"
                loading="lazy"
              />
            </div>
          </Card>
        </section>

        <QrSection />
      </main>
    </div>
  );
}

function tableName(db: ReturnType<typeof useLiveDb>, tableId: string): string {
  const t = db.tables.find((x) => x.id === tableId);
  return t ? String(t.table_number) : '?';
}

export default function OwnerPage() {
  return (
    <RequireRole roles={['owner']}>
      <OwnerApp />
    </RequireRole>
  );
}
