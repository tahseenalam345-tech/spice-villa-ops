'use client';

// ---------------------------------------------------------------------------
// OrderKar analytics — range-based aggregations over full orders (last 45d)
// + compact DailySummary rows (days 46..365). Powers the /owner dashboard.
// ---------------------------------------------------------------------------

import type { DBState, DailySummary, Order } from './db';

export type RangeKey = 'today' | 'yesterday' | '7d' | '30d' | '6m' | '12m';

export interface RangeDef {
  key: RangeKey;
  label: string;
  days: number;
  offset: number; // days back from today
}

export const RANGES: RangeDef[] = [
  { key: 'today', label: 'Today', days: 1, offset: 0 },
  { key: 'yesterday', label: 'Yesterday', days: 1, offset: 1 },
  { key: '7d', label: 'Last 7 days', days: 7, offset: 0 },
  { key: '30d', label: 'Last 30 days', days: 30, offset: 0 },
  { key: '6m', label: 'Last 6 months', days: 182, offset: 0 },
  { key: '12m', label: 'Last 12 months', days: 365, offset: 0 },
];

export interface RangeWindow {
  start: Date;
  end: Date;
  startStr: string; // YYYY-MM-DD
  endStr: string;
  days: number;
}

export function rangeWindow(days: number, offset: number): RangeWindow {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDay = new Date(todayStart.getTime() - offset * 86400000);
  const start = new Date(endDay.getTime() - (days - 1) * 86400000);
  // For "today" (offset 0, days 1) the window ends right now, not end-of-day.
  const end = offset === 0 && days === 1 ? now : new Date(endDay.getTime() + 86400000 - 1);
  const fmt = (d: Date): string => d.toISOString().slice(0, 10);
  return { start, end, startStr: fmt(start), endStr: fmt(endDay), days };
}

export interface RangeData {
  orders: Order[];
  summaries: DailySummary[];
  window: RangeWindow;
}

/** Full orders + daily summaries inside [days, offset]. */
export function getRangeData(db: DBState, days: number, offset: number): RangeData {
  const window = rangeWindow(days, offset);
  const orders = db.orders.filter((o) => {
    const t = new Date(o.created_at).getTime();
    return t >= window.start.getTime() && t <= window.end.getTime();
  });
  const summaries = db.summaries.filter(
    (s) => s.date >= window.startStr && s.date <= window.endStr,
  );
  return { orders, summaries, window };
}

// ------------------------------------------------------------------ aggregate ---

export interface Agg {
  revenue: number;
  orders: number;
  covers: number;
  aov: number;
  itemQty: Map<string, number>; // menu_item_id -> qty
  itemRevenue: Map<string, number>;
  hours: number[]; // 24
  weekday: number[]; // 7 (Sun..Sat)
  waiterOrders: Map<string, number>;
  waiterRevenue: Map<string, number>;
  prepSum: number;
  prepCount: number;
  series: { label: string; value: number }[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dayLabel(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function aggregate(db: DBState, data: RangeData): Agg {
  const itemQty = new Map<string, number>();
  const itemRevenue = new Map<string, number>();
  const hours = new Array<number>(24).fill(0);
  const weekday = new Array<number>(7).fill(0);
  const waiterOrders = new Map<string, number>();
  const waiterRevenue = new Map<string, number>();
  let revenue = 0;
  let covers = 0;
  let prepSum = 0;
  let prepCount = 0;

  for (const o of data.orders) {
    revenue += o.total_amount;
    covers += o.covers ?? 2;
    const dt = new Date(o.created_at);
    hours[dt.getHours()] += 1;
    weekday[dt.getDay()] += 1;
    if (o.waiter_id) {
      waiterOrders.set(o.waiter_id, (waiterOrders.get(o.waiter_id) ?? 0) + 1);
      waiterRevenue.set(o.waiter_id, (waiterRevenue.get(o.waiter_id) ?? 0) + o.total_amount);
    }
    if (o.status === 'completed') {
      prepSum += (new Date(o.updated_at).getTime() - dt.getTime()) / 60000;
      prepCount += 1;
    }
    for (const li of o.items) {
      itemQty.set(li.menu_item_id, (itemQty.get(li.menu_item_id) ?? 0) + li.quantity);
      itemRevenue.set(li.menu_item_id, (itemRevenue.get(li.menu_item_id) ?? 0) + li.quantity * li.unit_price);
    }
  }

  for (const s of data.summaries) {
    revenue += s.revenue;
    covers += s.covers;
    for (let h = 0; h < 24; h++) hours[h] += s.hours[h] ?? 0;
    weekday[s.weekday] += s.orders;
    prepSum += s.prep_minutes_sum;
    prepCount += s.completed_count;
    for (const [id, w] of s.waiters ? Object.entries(s.waiters) : []) {
      waiterOrders.set(id, (waiterOrders.get(id) ?? 0) + w);
    }
    for (const [id, q] of Object.entries(s.items)) {
      itemQty.set(id, (itemQty.get(id) ?? 0) + q);
      const price = db.items.find((m) => m.id === id)?.price ?? 0;
      itemRevenue.set(id, (itemRevenue.get(id) ?? 0) + q * price);
    }
  }

  const orders = data.orders.length + data.summaries.reduce((s, x) => s + x.orders, 0);

  // Revenue series: hourly for 1-day, daily for <=31d, weekly above.
  const series: { label: string; value: number }[] = [];
  const { days } = data.window;
  if (days === 1) {
    const perHour = new Array<number>(24).fill(0);
    for (const o of data.orders) {
      const dt = new Date(o.created_at);
      if (dt <= data.window.end) perHour[dt.getHours()] += o.total_amount;
    }
    for (const s of data.summaries) {
      // summaries carry no revenue-per-hour; spread evenly across active hours
      const active = s.hours.map((v, h) => (v > 0 ? h : -1)).filter((h) => h >= 0);
      if (active.length === 0) continue;
      const per = s.revenue / active.length;
      for (const h of active) perHour[h] += per;
    }
    const endsNow = data.window.end.getTime() >= Date.now() - 120000;
    const lastH = endsNow ? new Date().getHours() : 23;
    for (let h = 0; h <= lastH; h++) {
      series.push({ label: `${h}:00`, value: Math.round(perHour[h]) });
    }
  } else if (days <= 31) {
    const perDay = new Map<string, number>();
    for (const o of data.orders) {
      const k = new Date(o.created_at).toISOString().slice(0, 10);
      perDay.set(k, (perDay.get(k) ?? 0) + o.total_amount);
    }
    for (const s of data.summaries) perDay.set(s.date, (perDay.get(s.date) ?? 0) + s.revenue);
    const cur0 = new Date(data.window.start);
    let cur = cur0;
    while (cur <= data.window.end && series.length < 40) {
      const k = cur.toISOString().slice(0, 10);
      series.push({ label: dayLabel(cur), value: Math.round(perDay.get(k) ?? 0) });
      cur = new Date(cur.getTime() + 86400000);
    }
  } else {
    // weekly buckets
    const perWeek = new Map<string, { label: string; value: number }>();
    const add = (dateStr: string, v: number) => {
      const d = new Date(dateStr + 'T12:00:00');
      const monday = new Date(d.getTime() - ((d.getDay() + 6) % 7) * 86400000);
      const k = monday.toISOString().slice(0, 10);
      const e = perWeek.get(k) ?? { label: `W/o ${dayLabel(monday)}`, value: 0 };
      e.value += v;
      perWeek.set(k, e);
    };
    for (const o of data.orders) add(new Date(o.created_at).toISOString().slice(0, 10), o.total_amount);
    for (const s of data.summaries) add(s.date, s.revenue);
    series.push(
      ...Array.from(perWeek.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([, v]) => ({ label: v.label, value: Math.round(v.value) })),
    );
  }

  return {
    revenue: Math.round(revenue),
    orders,
    covers,
    aov: orders ? revenue / orders : 0,
    itemQty,
    itemRevenue,
    hours,
    weekday,
    waiterOrders,
    waiterRevenue,
    prepSum,
    prepCount,
    series,
  };
}

/** % change vs previous equivalent window; null when no baseline. */
export function deltaPct(cur: number, prev: number): number | null {
  if (!prev || prev <= 0) return null;
  return ((cur - prev) / prev) * 100;
}

/**
 * For "today" deltas: cap a previous-day RangeData to the same clock time,
 * so "today so far" compares against "yesterday so far" (not a full day).
 */
export function capToTimeOfDay(data: RangeData, ref: Date): RangeData {
  const capSecs = ref.getHours() * 3600 + ref.getMinutes() * 60 + ref.getSeconds();
  const todSecs = (iso: string): number => {
    const d = new Date(iso);
    return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  };
  return {
    ...data,
    orders: data.orders.filter((o) => todSecs(o.created_at) <= capSecs),
    summaries: [], // only used for 1-day windows, which never have summaries
  };
}

// ------------------------------------------------------------- derived views ---

export interface TopItem {
  id: string;
  name: string;
  qty: number;
  revenue: number;
}

export function topItems(db: DBState, agg: Agg, n = 10): TopItem[] {
  return Array.from(agg.itemQty.entries())
    .map(([id, qty]) => ({
      id,
      name: db.items.find((m) => m.id === id)?.name ?? id,
      qty,
      revenue: agg.itemRevenue.get(id) ?? 0,
    }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, n);
}

export interface CatSlice {
  id: string;
  label: string;
  value: number; // revenue
}

export function categoryMix(db: DBState, agg: Agg): CatSlice[] {
  const byCat = new Map<string, number>();
  agg.itemRevenue.forEach((rev, id) => {
    const cat = db.items.find((m) => m.id === id)?.category_id ?? 'other';
    byCat.set(cat, (byCat.get(cat) ?? 0) + rev);
  });
  return Array.from(byCat.entries())
    .map(([id, value]) => ({
      id,
      label: db.categories.find((c) => c.id === id)?.name ?? id,
      value: Math.round(value),
    }))
    .sort((a, b) => b.value - a.value);
}

export interface WaiterStat {
  id: string;
  name: string;
  orders: number;
  revenue: number;
}

export function staffLeaderboard(db: DBState, agg: Agg): WaiterStat[] {
  return Array.from(agg.waiterOrders.entries())
    .map(([id, orders]) => ({
      id,
      name: db.users.find((u) => u.id === id)?.name ?? id,
      orders,
      revenue: agg.waiterRevenue.get(id) ?? 0,
    }))
    .sort((a, b) => b.orders - a.orders);
}

export function wasteInRange(db: DBState, window: RangeWindow): number {
  return db.wasteLogs
    .filter((w) => {
      const t = new Date(w.logged_at).getTime();
      return t >= window.start.getTime() && t <= window.end.getTime();
    })
    .reduce((s, w) => s + w.estimated_cost, 0);
}

export function reviewsInRange(db: DBState, window: RangeWindow): { count: number; avg: number } {
  const rs = db.reviews.filter((r) => {
    const t = new Date(r.created_at).getTime();
    return t >= window.start.getTime() && t <= window.end.getTime();
  });
  if (!rs.length) return { count: 0, avg: 0 };
  return { count: rs.length, avg: rs.reduce((s, r) => s + r.rating, 0) / rs.length };
}

/** Orders whose prep exceeded `mins` (completed, full orders only). */
export function slowOrders(db: DBState, data: RangeData, mins = 40): { n: number; slowest: number } {
  let n = 0;
  let slowest = 0;
  for (const o of data.orders) {
    if (o.status !== 'completed') continue;
    const prep = (new Date(o.updated_at).getTime() - new Date(o.created_at).getTime()) / 60000;
    if (prep > mins) n += 1;
    if (prep > slowest) slowest = prep;
  }
  return { n, slowest: Math.round(slowest) };
}
