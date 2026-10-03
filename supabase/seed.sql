-- ============================================================================
-- Spice Villa — seed data (mirrors the bundled demo data in lib/db.ts)
-- Run after schema.sql. Timestamps are relative to now() so the manager
-- dashboard shows "today" stats immediately.
-- Passwords here are placeholders — use Supabase Auth in production.
-- ============================================================================

-- Restaurant -----------------------------------------------------------------
insert into restaurants (id, name, tagline, cuisine, address, phone)
values ('rest_spicevilla', 'Spice Villa', 'Desi flavours, served with pride',
        'Pakistani', 'Main Bahadurabad Road, Karachi', '021-34567890')
on conflict (id) do nothing;

-- Tables ----------------------------------------------------------------------
insert into tables (id, restaurant_id, table_number, qr_code, is_active)
values
  ('table_1', 'rest_spicevilla', 1, 'SPICEVILLA-T1', true),
  ('table_2', 'rest_spicevilla', 2, 'SPICEVILLA-T2', true),
  ('table_3', 'rest_spicevilla', 3, 'SPICEVILLA-T3', true),
  ('table_4', 'rest_spicevilla', 4, 'SPICEVILLA-T4', true),
  ('table_5', 'rest_spicevilla', 5, 'SPICEVILLA-T5', true),
  ('table_6', 'rest_spicevilla', 6, 'SPICEVILLA-T6', true)
on conflict (id) do nothing;

-- Categories ------------------------------------------------------------------
insert into menu_categories (id, restaurant_id, name, display_order, is_active)
values
  ('cat_starters', 'rest_spicevilla', 'Starters', 1, true),
  ('cat_main',     'rest_spicevilla', 'Main Course', 2, true),
  ('cat_biryani',  'rest_spicevilla', 'Biryani', 3, true),
  ('cat_drinks',   'rest_spicevilla', 'Drinks', 4, true)
on conflict (id) do nothing;

-- Menu items ------------------------------------------------------------------
insert into menu_items (id, category_id, name, description, price, image_url, is_available, prep_time_minutes)
values
  ('item_samosa', 'cat_starters', 'Crispy Samosa (2 pcs)',
   'Golden flaky pastry stuffed with spiced potatoes and peas, served with imli chutney.',
   120, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', true, 10),
  ('item_tikkaboti', 'cat_starters', 'Chicken Tikka Boti',
   'Char-grilled chicken cubes marinated overnight in yoghurt and desi spices.',
   350, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80', true, 20),
  ('item_seekhkebab', 'cat_starters', 'Beef Seekh Kebab (4 pcs)',
   'Hand-minced beef with green chillies and coriander, flame-grilled on skewers.',
   420, 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=80', true, 20),
  ('item_karahi', 'cat_main', 'Chicken Karahi (Half)',
   'The Lahore classic — wok-tossed chicken in fresh tomatoes, ginger and green chillies.',
   850, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80', true, 25),
  ('item_daaltadka', 'cat_main', 'Daal Tadka',
   'Slow-cooked yellow daal tempered with garlic, cumin and a spoon of desi ghee.',
   320, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80', true, 15),
  ('item_chapli', 'cat_main', 'Beef Chapli Kebab (2 pcs)',
   'Peshawari-style flat kebabs with pomegranate seeds, served with hot naan.',
   280, null, true, 15),
  ('item_bbqplatter', 'cat_main', 'BBQ Platter (Serves 2)',
   'Seekh kebab, tikka boti, malai boti and grilled wings with naan and chutneys.',
   1450, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', true, 30),
  ('item_garlicnaan', 'cat_main', 'Garlic Naan (2 pcs)',
   'Tandoor-fresh naan brushed with garlic butter — made to scoop up karahi.',
   80, 'https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=800&q=80', true, 8),
  ('item_chickenbiryani', 'cat_biryani', 'Chicken Biryani',
   'Fragrant basmati layered with masala chicken, served with raita and salad.',
   320, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80', true, 15),
  ('item_beefbiryani', 'cat_biryani', 'Beef Biryani',
   'Tender beef folded through saffron-kissed rice with crispy brown onions.',
   380, 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80', true, 15),
  ('item_chickenpulao', 'cat_biryani', 'Chicken Pulao',
   'Yakhni-cooked basmati with whole spices — milder, aromatic, deeply comforting.',
   300, null, true, 15),
  ('item_doodhpatti', 'cat_drinks', 'Doodh Patti',
   'Slow-brewed milky chai, the dhaba way — strong, sweet and soul-warming.',
   150, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=800&q=80', true, 5),
  ('item_limesoda', 'cat_drinks', 'Fresh Lime Soda',
   'Hand-pressed lime with soda and a whisper of black salt — served ice cold.',
   180, null, true, 5),
  ('item_mangolassi', 'cat_drinks', 'Mango Lassi',
   'Thick churned yoghurt blended with ripe Sindhri mangoes.',
   250, null, true, 5)
on conflict (id) do nothing;

-- Staff users ------------------------------------------------------------------
-- NOTE: demo placeholder hashes. Use Supabase Auth (auth.users) in production
-- and keep this table for profile/role data only.
insert into users (id, restaurant_id, email, password_hash, role, name, phone, is_active)
values
  ('user_manager', 'rest_spicevilla', 'manager@spicevilla.pk', 'demo-placeholder', 'manager', 'Ali Raza', '0300-1234567', true),
  ('user_kitchen', 'rest_spicevilla', 'kitchen@spicevilla.pk', 'demo-placeholder', 'kitchen', 'Bilal Ahmed', '0300-2345678', true),
  ('user_waiter',  'rest_spicevilla', 'waiter@spicevilla.pk',  'demo-placeholder', 'waiter',  'Usman Tariq', '0300-3456789', true)
on conflict (id) do nothing;

-- Demo orders for today ---------------------------------------------------------
insert into orders (id, order_number, restaurant_id, table_id, waiter_id, customer_name, status, total_amount, notes, created_at, updated_at)
values
  ('seed_order_1', 1001, 'rest_spicevilla', 'table_3', null, 'Ahmed',  'completed', 940,  null, now() - interval '300 minutes', now() - interval '265 minutes'),
  ('seed_order_2', 1002, 'rest_spicevilla', 'table_5', null, 'Fatima', 'completed', 1170, null, now() - interval '180 minutes', now() - interval '145 minutes'),
  ('seed_order_3', 1003, 'rest_spicevilla', 'table_2', null, 'Hassan', 'completed', 940,  null, now() - interval '90 minutes',  now() - interval '55 minutes'),
  ('seed_order_4', 1004, 'rest_spicevilla', 'table_1', null, 'Ayesha', 'ready',     1950, null, now() - interval '25 minutes',  now() - interval '25 minutes'),
  ('seed_order_5', 1005, 'rest_spicevilla', 'table_4', 'user_waiter', 'Bilal', 'preparing', 2020, null, now() - interval '12 minutes', now() - interval '12 minutes'),
  ('seed_order_6', 1006, 'rest_spicevilla', 'table_6', null, null,      'pending',   1080, 'One samosa extra spicy', now() - interval '3 minutes', now() - interval '3 minutes')
on conflict (id) do nothing;

insert into order_items (id, order_id, menu_item_id, quantity, unit_price, status)
values
  ('seed_oi_1a', 'seed_order_1', 'item_chickenbiryani', 2, 320, 'ready'),
  ('seed_oi_1b', 'seed_order_1', 'item_doodhpatti',     2, 150, 'ready'),
  ('seed_oi_2a', 'seed_order_2', 'item_karahi',         1, 850, 'ready'),
  ('seed_oi_2b', 'seed_order_2', 'item_garlicnaan',     4,  80, 'ready'),
  ('seed_oi_3a', 'seed_order_3', 'item_beefbiryani',    2, 380, 'ready'),
  ('seed_oi_3b', 'seed_order_3', 'item_limesoda',       1, 180, 'ready'),
  ('seed_oi_4a', 'seed_order_4', 'item_bbqplatter',     1, 1450, 'ready'),
  ('seed_oi_4b', 'seed_order_4', 'item_mangolassi',     2, 250, 'ready'),
  ('seed_oi_5a', 'seed_order_5', 'item_karahi',         2, 850, 'preparing'),
  ('seed_oi_5b', 'seed_order_5', 'item_garlicnaan',     4,  80, 'preparing'),
  ('seed_oi_6a', 'seed_order_6', 'item_samosa',         4, 120, 'pending'),
  ('seed_oi_6b', 'seed_order_6', 'item_doodhpatti',     4, 150, 'pending')
on conflict (id) do nothing;

-- Waste + reviews ---------------------------------------------------------------
insert into waste_logs (id, restaurant_id, menu_item_id, quantity, reason, logged_by, logged_at, estimated_cost)
values ('waste_1', 'rest_spicevilla', 'item_samosa', 6, 'overprep', 'Ali Raza', now() - interval '240 minutes', 360)
on conflict (id) do nothing;

insert into reviews (id, order_id, rating, comment, created_at)
values
  ('rev_1', 'seed_order_1', 5, 'Biryani was on point — masala perfect, rice fluffy. Will come again!', now() - interval '240 minutes'),
  ('rev_2', 'seed_order_2', 4, 'Karahi had great flavour. Service was a little slow at peak time.', now() - interval '120 minutes')
on conflict (id) do nothing;
