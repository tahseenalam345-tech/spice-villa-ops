# OrderKar — Restaurant chalana ab aasaan

A complete dine-in restaurant operations system: **QR customer ordering**,
**waiter app**, **live kitchen display**, **manager dashboard**, and an
**owner/superadmin analytics suite** — built as a sellable product for
restaurant owners. Demo data models "Spice Villa", Kharian.

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
| Owner dashboard | `/owner` | owner@orderkar.pk |
| Customer menu (QR demo) | `/table/1` … `/table/6` | none needed — open on your phone to simulate a guest scan |
| Feedback (reviews QR) | `/feedback` | none needed |
| Waiter app | `/waiter` | waiter@orderkar.pk |
| Kitchen display | `/kitchen` | kitchen@orderkar.pk |
| Manager dashboard | `/manager` | manager@orderkar.pk |

**Demo logins** (password for all: `demo123`):

| Role | Name | Email | Lands on |
|---|---|---|---|
| Owner | Tahseen Alam | owner@orderkar.pk | `/owner` |
| Manager | Ali Raza | manager@orderkar.pk | `/manager` |
| Kitchen | Bilal Ahmed | kitchen@orderkar.pk | `/kitchen` |
| Waiter | Usman Tariq | waiter@orderkar.pk | `/waiter` |
| Waiter | Danish Ali | danish@orderkar.pk | `/waiter` |

Suggested demo flow:

1. Sign in as **owner** — explore 12 months of analytics: revenue trends, rush-hour heatmap, top items, staff leaderboard.
2. Scroll to **Live views** — watch customer, waiter, kitchen and manager screens update in real time, side by side.
3. Open `/table/1` on your phone, place an order — watch it land on `/kitchen` and in the owner live views.
4. Print the **QR codes** (owner/manager dashboards) and stick them on tables — each scans to its own table menu.

## Design system

KoDriftDev-inspired, light-first: silver `#ECEEF2` canvas, ink `#0F172A` type,
blue `#006EF5` brand accent, neo-brutalist buttons (hard offset shadows),
hairline cards, **Manrope** display + **DM Sans** body. A light/dark toggle in
every header persists to `orderkar_theme` in localStorage; theming runs through
CSS variables (`:root` / `[data-theme="dark"]`).

## How data works (no backend)

The app runs fully on **bundled demo data + browser localStorage**:

- `lib/db.ts` — types, seed, and all read/write helpers.
  - **Seed:** 12 months of realistic order history (weekly seasonality, lunch/dinner peaks, bestseller-weighted mix). Full order objects for the last 45 days + compact `DailySummary` rows for days 46–365 keep localStorage under ~2 MB.
  - Storage key: `orderkar_db_v2` (versioned — bump to reseed).
- `lib/analytics.ts` — range aggregations (today → 12 months) with previous-period deltas.
- `lib/qr.ts` — `SITE_URL` + per-table / reviews QR definitions.
- `lib/auth.ts` — demo login against seeded staff users; session in localStorage (`orderkar_session`); `<RequireRole>` route guards (`?preview=1` bypasses for the owner's embedded live previews).
- Cross-tab realtime: mutations fire a `storage` event (other tabs) plus an `orderkar-db-update` CustomEvent (same tab).

## QR codes

Per-table QRs (`/table/1` … `/table/6`) + a reviews QR (`/feedback`):

- Printable PNGs live in `public/qr/` — regenerate with `node scripts/gen-qr.mjs` after changing `SITE_URL`.
- In-app: owner and manager dashboards show a QR grid with per-code **Download PNG** and **Print all**.

## Project structure

```
app/
  page.tsx            Product landing page
  login/page.tsx      Staff login (role quick-fill)
  owner/page.tsx      Owner/superadmin analytics dashboard
  feedback/page.tsx   Standalone review page (reviews QR target)
  table/[id]/page.tsx Customer QR menu + live order tracker
  waiter/page.tsx     Waiter app (table grid, ordering, close-out)
  kitchen/page.tsx    Kitchen display (live queue, timers, alerts)
  manager/page.tsx    Manager dashboard (orders, tables, waste, reviews, QR)
components/
  ui.tsx              Shared kit: Btn, Card, Pill, Kpi, Tabs, inputs, AppHeader, ThemeToggle…
  charts.tsx          Hand-rolled SVG charts (area, heatmap, bars, donut)
  QrSection.tsx       QR grid + download/print
  BrandMark.tsx       OrderKar "O" mark
  DishImage.tsx       Food photo with fallback tile
  MenuOrder.tsx       Shared menu + cart + checkout drawer
  OrderTracker.tsx    Live order status steps + review form
  StatusPill.tsx      Order status badge
lib/
  db.ts               Data layer (seed + localStorage + realtime)
  analytics.ts        Range aggregations for /owner
  qr.ts               QR URL definitions
  auth.ts             Demo auth + RequireRole guard
  format.ts           PKR / time formatting
scripts/
  gen-qr.mjs          Generates public/qr/*.png
supabase/
  schema.sql          PostgreSQL schema for a future backend
  seed.sql            Matching seed data
public/qr/            Printable QR PNGs (table-1…6, reviews)
```

## Deploying to Vercel

```bash
npm run build   # must pass
```

Then import the repo at [vercel.com/new](https://vercel.com/new) — no env vars
needed for the demo build. Each push triggers a deploy.
