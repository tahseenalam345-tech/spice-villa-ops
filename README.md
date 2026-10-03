# OrderKar — Restaurant chalana ab aasaan

**OrderKar** is restaurant operations software for dine-in restaurants:
**QR customer ordering**, **waiter app**, **live kitchen display**, and
**manager dashboard** — one system, zero paperwork.

The landing page sells the product to restaurant owners. The live demo runs on
sample data for **Spice Villa**, a Kharian-style Pakistani restaurant
(41-dish menu, 6 tables).

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS v3 · no backend.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To verify a production build:

```bash
npm run build
npm run lint
```

## Demo walkthrough

| Screen | URL | Login |
|---|---|---|
| Product landing | `/` | — |
| Customer menu (QR demo) | `/table/1` … `/table/6` | none needed — open on your phone to simulate a guest scan |
| Waiter app | `/waiter` | waiter@orderkar.pk |
| Kitchen display | `/kitchen` | kitchen@orderkar.pk |
| Manager dashboard | `/manager` | manager@orderkar.pk |

**Demo logins** (password for all: `demo123`):

| Role | Name | Email |
|---|---|---|
| Manager | Ali Raza | manager@orderkar.pk |
| Kitchen | Bilal Ahmed | kitchen@orderkar.pk |
| Waiter | Usman Tariq | waiter@orderkar.pk |

Suggested demo flow:

1. Open `/table/1` on your phone, add items, place an order — watch the live status tracker.
2. Open `/kitchen` on a second screen — the order arrives with a sound + flash; tap **Start preparing** → **Mark ready**.
3. Watch the phone tracker update in real time (open both in two tabs — cross-tab sync works).
4. Log in as manager at `/manager` — live orders, table map, revenue stats, waste log, reviews.

## How data works (no backend)

The app runs fully on **bundled demo data + browser localStorage** — the same
pattern as our TazaMart/Clinic builds:

- `lib/db.ts` — TypeScript types, seed data (Spice Villa, 6 tables, 8 menu
  categories, 41 menu items, 3 staff users, demo orders/reviews/waste), and all
  read/write helpers.
- Storage key: `orderkar_db_v1` (versioned — bump the version to reseed).
- Every mutation writes through to localStorage and bumps a revision counter.
- **Cross-tab realtime:** mutations fire a `storage` event (other tabs) plus an
  `orderkar-db-update` CustomEvent (same tab). `subscribe(cb)` listens to
  both; `useLiveDb()` subscribes and also polls every 5s so the kitchen/manager
  screens stay fresh.
- `lib/auth.tsx` — demo login against seeded staff users; session in
  localStorage (`orderkar_session`); `<RequireRole>` route guards.

Seeded orders are timestamped relative to "now", so the kitchen queue,
dashboard stats, and hourly chart always have live data on first open.

## Design system

- **Palette:** deep emerald pine `#0B3D2E` · saffron `#F2A413` · warm cream
  `#FAF6EE` · chili red `#C93A2E`. Staff screens (`/waiter`, `/kitchen`,
  `/manager`, `/login`) are dark pine with cream text; customer-facing pages
  (`/`, `/table/[id]`) are light cream.
- **Type:** Bricolage Grotesque (display) + Inter (body).
- **Brand mark:** `components/BrandMark.tsx` — saffron "O" ring with a QR-style
  finder dot on pine.

## Wiring Supabase later (optional)

`supabase/schema.sql` (tables + FKs + indexes) and `supabase/seed.sql`
(matching seed data) are ready to run in the Supabase SQL editor.

To switch the app to Supabase you would:

1. Create the project, run `schema.sql`, then `seed.sql`.
2. Add env vars (ask before changing env in any deployed project):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Replace the `lib/db.ts` storage functions with Supabase queries + Realtime
   subscriptions, keeping the same exported helper signatures so pages don't
   change. Use Supabase Auth for `lib/auth.tsx` (keep `users` as profile/role data).

## Project structure

```
app/
  page.tsx            OrderKar product landing page
  login/page.tsx      Staff login
  table/[id]/page.tsx Customer QR menu + live order tracker (Spice Villa demo)
  waiter/page.tsx     Waiter app (table grid, ordering, close-out)
  kitchen/page.tsx    Kitchen display (live queue, timers, alerts)
  manager/page.tsx    Manager dashboard (stats, orders, tables, waste, reviews)
components/
  BrandMark.tsx       OrderKar logo mark (inline SVG)
  DishImage.tsx       Food photo with solid-tile fallback
  MenuOrder.tsx       Shared menu + cart + checkout drawer (light/dark themes)
  OrderTracker.tsx    Live order status steps + review form
  StatusPill.tsx      Order status badge (light/dark tones)
  StatCard.tsx        Dashboard stat card
  TopBar.tsx          Staff page header with logout
lib/
  db.ts               Data layer (seed + localStorage + realtime)
  auth.tsx            Demo auth + RequireRole guard
  format.ts           PKR / time formatting
supabase/
  schema.sql          PostgreSQL schema for future backend
  seed.sql            Matching seed data
```
