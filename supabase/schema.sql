-- ============================================================================
-- OrderKar — Supabase / PostgreSQL schema (demo restaurant: Spice Villa)
-- Restaurant operations system prototype (QR ordering, kitchen display,
-- waiter app, manager dashboard).
--
-- The Next.js prototype in this repo currently runs on bundled demo data +
-- localStorage (see lib/db.ts). When you're ready for a real backend, create
-- a Supabase project, run this file in the SQL editor, then run seed.sql,
-- and set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.
-- ============================================================================

-- Restaurants ---------------------------------------------------------------
create table if not exists restaurants (
  id          text primary key,
  name        text not null,
  tagline     text,
  cuisine     text,
  address     text,
  phone       text,
  logo_url    text,
  created_at  timestamptz not null default now()
);

-- Tables --------------------------------------------------------------------
create table if not exists tables (
  id            text primary key,
  restaurant_id text not null references restaurants (id) on delete cascade,
  table_number  int  not null,
  qr_code       text not null,
  is_active     boolean not null default true,
  unique (restaurant_id, table_number)
);

-- Menu ----------------------------------------------------------------------
create table if not exists menu_categories (
  id            text primary key,
  restaurant_id text not null references restaurants (id) on delete cascade,
  name          text not null,
  display_order int  not null default 0,
  is_active     boolean not null default true
);

create table if not exists menu_items (
  id                 text primary key,
  category_id        text not null references menu_categories (id) on delete cascade,
  name               text not null,
  description        text,
  price              numeric(10, 2) not null,
  image_url          text,
  is_available       boolean not null default true,
  prep_time_minutes  int not null default 10
);

-- Staff users (app-level; Supabase Auth can be layered on top later) ---------
create table if not exists users (
  id            text primary key,
  restaurant_id text not null references restaurants (id) on delete cascade,
  email         text not null unique,
  password_hash text not null,
  role          text not null check (role in ('owner', 'manager', 'waiter', 'kitchen')),
  name          text not null,
  phone         text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Orders --------------------------------------------------------------------
create table if not exists orders (
  id            text primary key,
  order_number  int  not null,
  restaurant_id text not null references restaurants (id) on delete cascade,
  table_id      text not null references tables (id) on delete restrict,
  waiter_id     text references users (id) on delete set null,
  customer_name text,
  customer_phone text,
  status        text not null default 'pending'
                check (status in ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  total_amount  numeric(10, 2) not null default 0,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists order_items (
  id           text primary key,
  order_id     text not null references orders (id) on delete cascade,
  menu_item_id text not null references menu_items (id) on delete restrict,
  quantity     int  not null check (quantity > 0),
  unit_price   numeric(10, 2) not null,
  notes        text,
  status       text not null default 'pending'
               check (status in ('pending', 'preparing', 'ready'))
);

-- Waste ---------------------------------------------------------------------
create table if not exists waste_logs (
  id             text primary key,
  restaurant_id  text not null references restaurants (id) on delete cascade,
  menu_item_id   text references menu_items (id) on delete set null,
  quantity       int  not null check (quantity > 0),
  reason         text not null check (reason in ('spoilage', 'theft', 'overprep', 'other')),
  logged_by      text,
  logged_at      timestamptz not null default now(),
  estimated_cost numeric(10, 2) not null default 0
);

-- Reviews -------------------------------------------------------------------
create table if not exists reviews (
  id             text primary key,
  order_id       text not null references orders (id) on delete cascade,
  rating         int  not null check (rating between 1 and 5),
  comment        text,
  customer_phone text,
  created_at     timestamptz not null default now()
);

-- Helpful indexes ------------------------------------------------------------
create index if not exists idx_orders_restaurant_status on orders (restaurant_id, status);
create index if not exists idx_orders_created on orders (created_at desc);
create index if not exists idx_order_items_order on order_items (order_id);
create index if not exists idx_menu_items_category on menu_items (category_id);
create index if not exists idx_waste_restaurant on waste_logs (restaurant_id, logged_at desc);
create index if not exists idx_reviews_order on reviews (order_id);

-- Keep updated_at fresh -------------------------------------------------------
create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_orders_touch on orders;
create trigger trg_orders_touch
  before update on orders
  for each row execute function touch_updated_at();
