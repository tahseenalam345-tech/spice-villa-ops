'use client';

// ---------------------------------------------------------------------------
// OrderKar — local-first demo data layer.
//
// Demo restaurant: Spice Villa (Kharian-style Pakistani restaurant).
// Bundled seed data + browser localStorage persistence. Zero backend required.
//
// Seed model (DB_KEY orderkar_db_v2):
//   - Full Order objects for the last 45 days (live screens + recent analytics)
//   - Compact DailySummary rows for days 46..365 (12-month analytics)
//   - Reviews + waste logs spread across 12 months
// Cross-tab realtime via 'storage' events + 'orderkar-db-update' CustomEvent.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed';
export type OrderItemStatus = 'pending' | 'preparing' | 'ready';
export type StaffRole = 'owner' | 'manager' | 'waiter' | 'kitchen';
export type WasteReason = 'spoilage' | 'theft' | 'overprep' | 'other';
export type MenuTag = 'veg' | 'spicy' | 'bestseller';

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  cuisine: string;
  address: string;
  phone: string;
}

export interface DiningTable {
  id: string;
  restaurant_id: string;
  table_number: number;
  qr_code: string;
  is_active: boolean;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  prep_time_minutes: number;
  tags?: MenuTag[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  status: OrderItemStatus;
}

export interface Order {
  id: string;
  order_number: number;
  restaurant_id: string;
  table_id: string;
  waiter_id?: string;
  customer_name?: string;
  customer_phone?: string;
  covers?: number;
  status: OrderStatus;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface StaffUser {
  id: string;
  restaurant_id: string;
  email: string;
  password: string;
  role: StaffRole;
  name: string;
  phone?: string;
  is_active: boolean;
}

export interface WasteLog {
  id: string;
  restaurant_id: string;
  menu_item_id?: string;
  item_name: string;
  quantity: number;
  reason: WasteReason;
  logged_by: string;
  logged_at: string;
  estimated_cost: number;
}

export interface Review {
  id: string;
  order_id: string;
  rating: number; // 1..5
  comment?: string;
  customer_name?: string;
  customer_phone?: string;
  created_at: string;
}

/** Compact per-day aggregates for days 46..365 (keeps localStorage small). */
export interface DailySummary {
  date: string; // YYYY-MM-DD
  weekday: number; // 0=Sun..6=Sat
  orders: number;
  revenue: number;
  covers: number;
  items: Record<string, number>; // menu_item_id -> qty sold
  hours: number[]; // 24 buckets
  waiters: Record<string, number>; // waiter_id -> orders served
  prep_minutes_sum: number;
  completed_count: number;
}

export interface DBState {
  version: 1;
  revision: number;
  seq: number; // order-number counter
  restaurant: Restaurant;
  tables: DiningTable[];
  categories: MenuCategory[];
  items: MenuItem[];
  orders: Order[];
  summaries: DailySummary[];
  users: StaffUser[];
  wasteLogs: WasteLog[];
  reviews: Review[];
}

export const DB_KEY = 'orderkar_db_v2';
const UPDATE_EVENT = 'orderkar-db-update';

const uid = (): string =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

const isoMinsAgo = (mins: number): string =>
  new Date(Date.now() - mins * 60000).toISOString();

const img = (id: string): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

const IMG_TIKKA = img('1599487488170-d11ec9c172f0');
const IMG_SEEKH = img('1603360946369-dc9bb6258143');
const IMG_PLATTER = img('1555939594-58d7cb561ad1');
const IMG_KARAHI = img('1565557623262-b51c2513a641');
const IMG_DAAL = img('1585937421612-70a008356fbe');
const IMG_BIRYANI = img('1589302168068-964664d93dc0');
const IMG_BEEF_BIRYANI = img('1633945274405-b6c8069047b0');
const IMG_NAAN = img('1567337710282-00832b415979');
const IMG_CHAI = img('1571934811356-5cc061b6821f');

// ---------------------------------------------------------------------------
// Seeded RNG (deterministic history, fast)
// ---------------------------------------------------------------------------

function mulberry32(seedNum: number): () => number {
  let a = seedNum >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

const REVIEW_COMMENTS = [
  'Biryani was on point — masala perfect, rice fluffy. Will come again!',
  'Karahi had great flavour. Service was a little slow at peak time.',
  'Best BBQ platter in Kharian, hands down. Seekh kebab melted in the mouth.',
  'Clean place, quick service. Kids loved the loaded fries.',
  'Malai boti is a must-try. Creamy and smoky at the same time.',
  'Good value family dinner. Kashmiri chai at the end was perfect.',
  'Zinger was crispy and fresh. Will order again.',
  'Mutton karahi took a while but worth the wait.',
  'Nice ambience for GT Road. Kulfi falooda stole the show.',
  'Doodh patti like a proper dhaba. Five stars.',
  'Cheese naan with chicken handi — deadly combo.',
  'Staff was courteous, food arrived hot. Recommended.',
];

const CUSTOMER_NAMES = [
  'Ahmed', 'Fatima', 'Hassan', 'Ayesha', 'Bilal', 'Sana', 'Usman', 'Maryam',
  'Danish', 'Hira', 'Imran', 'Sadia', 'Kamran', 'Nadia', 'Fahad', 'Rabia',
];

function seed(): DBState {
  const restaurant: Restaurant = {
    id: 'rest_spicevilla',
    name: 'Spice Villa',
    tagline: 'Desi flavours, served with pride',
    cuisine: 'Pakistani',
    address: 'G.T. Road, Kharian, Punjab',
    phone: '(053) 761 2345',
  };

  const tables: DiningTable[] = Array.from({ length: 6 }, (_, i) => ({
    id: `table_${i + 1}`,
    restaurant_id: restaurant.id,
    table_number: i + 1,
    qr_code: `ORDERKAR-T${i + 1}`,
    is_active: true,
  }));

  const categories: MenuCategory[] = [
    { id: 'cat_bbq', restaurant_id: restaurant.id, name: 'BBQ & Grill', display_order: 1, is_active: true },
    { id: 'cat_karahi', restaurant_id: restaurant.id, name: 'Karahi & Handi', display_order: 2, is_active: true },
    { id: 'cat_biryani', restaurant_id: restaurant.id, name: 'Biryani & Rice', display_order: 3, is_active: true },
    { id: 'cat_chinese', restaurant_id: restaurant.id, name: 'Chinese', display_order: 4, is_active: true },
    { id: 'cat_fastfood', restaurant_id: restaurant.id, name: 'Fast Food', display_order: 5, is_active: true },
    { id: 'cat_breads', restaurant_id: restaurant.id, name: 'Breads & Naan', display_order: 6, is_active: true },
    { id: 'cat_drinks', restaurant_id: restaurant.id, name: 'Drinks & Shakes', display_order: 7, is_active: true },
    { id: 'cat_desserts', restaurant_id: restaurant.id, name: 'Desserts', display_order: 8, is_active: true },
  ];

  const items: MenuItem[] = [
    // BBQ & Grill
    { id: 'item_chicken_tikka', category_id: 'cat_bbq', name: 'Chicken Tikka', description: 'Char-grilled leg quarter marinated overnight in yoghurt, ajwain and desi masalas.', price: 280, image_url: IMG_TIKKA, is_available: true, prep_time_minutes: 20, tags: ['bestseller', 'spicy'] },
    { id: 'item_seekh_kebab', category_id: 'cat_bbq', name: 'Seekh Kebab (4 pc)', description: 'Hand-minced beef with green chillies and fresh coriander, flame-grilled on skewers.', price: 450, image_url: IMG_SEEKH, is_available: true, prep_time_minutes: 20, tags: ['bestseller'] },
    { id: 'item_malai_boti', category_id: 'cat_bbq', name: 'Malai Boti', description: 'Creamy, melt-in-mouth chicken cubes with white pepper and a whisper of cheese.', price: 520, is_available: true, prep_time_minutes: 20 },
    { id: 'item_behari_boti', category_id: 'cat_bbq', name: 'Behari Boti', description: 'Smoky mustard-kissed strips bhunofied over coals — the desi BBQ lover\u2019s first love.', price: 480, is_available: true, prep_time_minutes: 20, tags: ['spicy'] },
    { id: 'item_grilled_wings', category_id: 'cat_bbq', name: 'Grilled Wings (8 pc)', description: 'Tossed in a tangy chilli-garlic glaze, charred at the edges.', price: 420, is_available: true, prep_time_minutes: 15, tags: ['spicy'] },
    { id: 'item_bbq_platter', category_id: 'cat_bbq', name: 'BBQ Platter (Serves 2)', description: 'Tikka, seekh kebab, malai boti and wings with naan, raita and imli chutney.', price: 1450, image_url: IMG_PLATTER, is_available: true, prep_time_minutes: 30, tags: ['bestseller'] },
    // Karahi & Handi
    { id: 'item_chicken_karahi_half', category_id: 'cat_karahi', name: 'Chicken Karahi (Half)', description: 'Wok-tossed in desi ghee with fresh tomatoes, julienned ginger and green chillies.', price: 850, image_url: IMG_KARAHI, is_available: true, prep_time_minutes: 25, tags: ['bestseller', 'spicy'] },
    { id: 'item_chicken_karahi_full', category_id: 'cat_karahi', name: 'Chicken Karahi (Full)', description: 'Wok-tossed in desi ghee with fresh tomatoes, julienned ginger and green chillies.', price: 1600, image_url: IMG_KARAHI, is_available: true, prep_time_minutes: 30, tags: ['spicy'] },
    { id: 'item_mutton_karahi_half', category_id: 'cat_karahi', name: 'Mutton Karahi (Half)', description: 'Tender mutton bhunofied the old way — black-pepper forward, no shortcuts.', price: 1450, image_url: IMG_KARAHI, is_available: true, prep_time_minutes: 30 },
    { id: 'item_chicken_handi', category_id: 'cat_karahi', name: 'Chicken Handi', description: 'Boneless chicken simmered in a creamy tomato-makhani gravy, finished with fresh cream.', price: 950, image_url: IMG_KARAHI, is_available: true, prep_time_minutes: 25 },
    { id: 'item_daal_fry', category_id: 'cat_karahi', name: 'Daal Fry', description: 'Slow-cooked yellow daal tempered with garlic, cumin and a spoon of desi ghee.', price: 350, image_url: IMG_DAAL, is_available: true, prep_time_minutes: 15, tags: ['veg'] },
    { id: 'item_palak_paneer', category_id: 'cat_karahi', name: 'Palak Paneer', description: 'Fresh spinach folded with soft paneer cubes — mellow, rich and comforting.', price: 550, image_url: IMG_DAAL, is_available: true, prep_time_minutes: 20, tags: ['veg'] },
    // Biryani & Rice
    { id: 'item_chicken_biryani', category_id: 'cat_biryani', name: 'Chicken Biryani', description: 'Layered Sindhi-style with aloo, served with raita and kachumber salad.', price: 280, image_url: IMG_BIRYANI, is_available: true, prep_time_minutes: 15, tags: ['bestseller', 'spicy'] },
    { id: 'item_beef_biryani', category_id: 'cat_biryani', name: 'Beef Biryani', description: 'Tender beef folded through saffron-kissed basmati with crispy brown onions.', price: 340, image_url: IMG_BEEF_BIRYANI, is_available: true, prep_time_minutes: 15, tags: ['spicy'] },
    { id: 'item_chicken_pulao', category_id: 'cat_biryani', name: 'Chicken Pulao', description: 'Yakhni-cooked basmati with whole garam masala — aromatic, not fiery.', price: 300, image_url: IMG_BIRYANI, is_available: true, prep_time_minutes: 15 },
    { id: 'item_veg_fried_rice', category_id: 'cat_biryani', name: 'Vegetable Fried Rice', description: 'Smoky wok-tossed rice with crunchy seasonal sabzi.', price: 320, is_available: true, prep_time_minutes: 12, tags: ['veg'] },
    { id: 'item_chicken_fried_rice', category_id: 'cat_biryani', name: 'Chicken Fried Rice', description: 'Egg ribbons, spring onion and charred chicken in every bite.', price: 380, is_available: true, prep_time_minutes: 12 },
    { id: 'item_zeera_rice', category_id: 'cat_biryani', name: 'Zeera Rice', description: 'Fluffy basmati tossed with roasted cumin — the quiet hero of every dawat.', price: 250, is_available: true, prep_time_minutes: 10, tags: ['veg'] },
    // Chinese
    { id: 'item_chow_mein', category_id: 'cat_chinese', name: 'Chicken Chow Mein', description: 'Street-style wok noodles with julienned chicken and crunchy vegetables.', price: 420, is_available: true, prep_time_minutes: 15 },
    { id: 'item_manchurian', category_id: 'cat_chinese', name: 'Chicken Manchurian with Rice', description: 'Crispy chicken balls in a garlicky soy glaze, served over egg fried rice.', price: 450, is_available: true, prep_time_minutes: 18 },
    { id: 'item_sweet_sour', category_id: 'cat_chinese', name: 'Sweet & Sour Chicken', description: 'Golden chicken tossed with peppers and pineapple in a glossy tangy sauce.', price: 480, is_available: true, prep_time_minutes: 18 },
    { id: 'item_kung_pao', category_id: 'cat_chinese', name: 'Kung Pao Chicken', description: 'Fiery dried chillies, roasted peanuts and that unmistakable wok hei.', price: 520, is_available: true, prep_time_minutes: 18, tags: ['spicy'] },
    { id: 'item_hot_sour_soup', category_id: 'cat_chinese', name: 'Hot & Sour Soup', description: 'Peppery, tangy and loaded — the desi-Chinese hug in a bowl.', price: 280, is_available: true, prep_time_minutes: 10, tags: ['spicy'] },
    // Fast Food
    { id: 'item_zinger', category_id: 'cat_fastfood', name: 'Zinger Burger', description: 'Crunchy marinated fillet, mayo and crisp lettuce in a toasted brioche bun.', price: 450, is_available: true, prep_time_minutes: 12, tags: ['bestseller'] },
    { id: 'item_smash_burger', category_id: 'cat_fastfood', name: 'Beef Smash Burger', description: 'Double smashed patty, cheddar, caramelised onions and smoky house sauce.', price: 650, is_available: true, prep_time_minutes: 15, tags: ['bestseller'] },
    { id: 'item_loaded_fries', category_id: 'cat_fastfood', name: 'Loaded Fries', description: 'Crispy fries drowned in cheese sauce, chicken chunks and jalape\u00f1os.', price: 380, is_available: true, prep_time_minutes: 10 },
    { id: 'item_broast', category_id: 'cat_fastfood', name: 'Crispy Broast (2 pc)', description: 'Pressure-fried extra crunchy — with fries and garlic mayo.', price: 420, is_available: true, prep_time_minutes: 15 },
    { id: 'item_shawarma', category_id: 'cat_fastfood', name: 'Chicken Shawarma', description: 'Char-grilled strips, pickles and toum wrapped in soft khubz.', price: 300, is_available: true, prep_time_minutes: 10 },
    // Breads & Naan
    { id: 'item_roghni_naan', category_id: 'cat_breads', name: 'Roghni Naan', description: 'Sesame-topped and tandoor-blistered — the karahi\u2019s best friend.', price: 60, image_url: IMG_NAAN, is_available: true, prep_time_minutes: 5, tags: ['veg'] },
    { id: 'item_garlic_naan', category_id: 'cat_breads', name: 'Garlic Naan', description: 'Brushed with garlic butter — made for scooping.', price: 90, image_url: IMG_NAAN, is_available: true, prep_time_minutes: 5, tags: ['veg'] },
    { id: 'item_cheese_naan', category_id: 'cat_breads', name: 'Cheese Naan', description: 'Stuffed with molten mozzarella. Dangerously good.', price: 150, image_url: IMG_NAAN, is_available: true, prep_time_minutes: 8, tags: ['veg', 'bestseller'] },
    { id: 'item_tandoori_roti', category_id: 'cat_breads', name: 'Tandoori Roti (2 pc)', description: 'Whole-wheat, clay-oven fresh.', price: 50, is_available: true, prep_time_minutes: 5, tags: ['veg'] },
    // Drinks & Shakes
    { id: 'item_lime_soda', category_id: 'cat_drinks', name: 'Fresh Lime Soda', description: 'Hand-pressed lime, soda and black salt — served ice cold.', price: 180, is_available: true, prep_time_minutes: 5 },
    { id: 'item_mango_shake', category_id: 'cat_drinks', name: 'Mango Shake', description: 'Thick-blended Sindhri mangoes with a scoop of vanilla ice cream.', price: 320, is_available: true, prep_time_minutes: 5, tags: ['bestseller'] },
    { id: 'item_kashmiri_chai', category_id: 'cat_drinks', name: 'Kashmiri Chai', description: 'Pink, lightly salted, crowned with crushed pistachio and almond.', price: 200, image_url: IMG_CHAI, is_available: true, prep_time_minutes: 8 },
    { id: 'item_doodh_patti', category_id: 'cat_drinks', name: 'Doodh Patti', description: 'Slow-brewed milky chai, the dhaba way — strong and soul-warming.', price: 150, image_url: IMG_CHAI, is_available: true, prep_time_minutes: 5 },
    { id: 'item_mint_margarita', category_id: 'cat_drinks', name: 'Mint Margarita', description: 'Crushed mint, lime and soda over a mountain of ice.', price: 220, is_available: true, prep_time_minutes: 5 },
    // Desserts
    { id: 'item_gulab_jamun', category_id: 'cat_desserts', name: 'Gulab Jamun (4 pc)', description: 'Warm, syrup-soaked and impossibly soft.', price: 250, is_available: true, prep_time_minutes: 5, tags: ['veg', 'bestseller'] },
    { id: 'item_kheer', category_id: 'cat_desserts', name: 'Kheer', description: 'Slow-cooked rice pudding with cardamom, chilled in a clay bowl.', price: 220, is_available: true, prep_time_minutes: 5, tags: ['veg'] },
    { id: 'item_kulfi_falooda', category_id: 'cat_desserts', name: 'Kulfi Falooda', description: 'Dense malai kulfi over vermicelli, basil seeds and rose syrup.', price: 350, is_available: true, prep_time_minutes: 8, tags: ['veg', 'bestseller'] },
    { id: 'item_shahi_tukray', category_id: 'cat_desserts', name: 'Shahi Tukray', description: 'Saffron-soaked fried bread crowned with rabri and pistachio.', price: 300, is_available: true, prep_time_minutes: 8, tags: ['veg'] },
  ];

  const users: StaffUser[] = [
    { id: 'user_owner', restaurant_id: restaurant.id, email: 'owner@orderkar.pk', password: 'demo123', role: 'owner', name: 'Tahseen Alam', phone: '0300-0000001', is_active: true },
    { id: 'user_manager', restaurant_id: restaurant.id, email: 'manager@orderkar.pk', password: 'demo123', role: 'manager', name: 'Ali Raza', phone: '0300-1234567', is_active: true },
    { id: 'user_kitchen', restaurant_id: restaurant.id, email: 'kitchen@orderkar.pk', password: 'demo123', role: 'kitchen', name: 'Bilal Ahmed', phone: '0300-2345678', is_active: true },
    { id: 'user_waiter', restaurant_id: restaurant.id, email: 'waiter@orderkar.pk', password: 'demo123', role: 'waiter', name: 'Usman Tariq', phone: '0300-3456789', is_active: true },
    { id: 'user_waiter2', restaurant_id: restaurant.id, email: 'danish@orderkar.pk', password: 'demo123', role: 'waiter', name: 'Danish Ali', phone: '0300-4567890', is_active: true },
  ];

  // ------------------------------------------------------------------
  // 12-month history. Full orders for days 1..45, compact DailySummary
  // rows for days 46..365. Day 0 (today) keeps the handcrafted live
  // demo orders below.
  // ------------------------------------------------------------------
  const rng = mulberry32(20261003);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

  // Weighted item picker — bestsellers sell ~3x.
  const itemPool: MenuItem[] = [];
  for (const m of items) {
    const w = m.tags?.includes('bestseller') ? 3 : 1;
    for (let k = 0; k < w; k++) itemPool.push(m);
  }

  const HOUR_W: Record<number, number> = {
    0: 0.4, 11: 0.7, 12: 3, 13: 3, 14: 2.5, 15: 1.5, 16: 1.2, 17: 1.2,
    18: 1.8, 19: 4, 20: 4, 21: 3.5, 22: 2.5, 23: 1.2,
  };
  const hourWeight = (h: number): number => HOUR_W[h] ?? 0.08;
  const pickHour = (): number => {
    let total = 0;
    for (let h = 0; h < 24; h++) total += hourWeight(h);
    let r = rng() * total;
    for (let h = 0; h < 24; h++) {
      r -= hourWeight(h);
      if (r <= 0) return h;
    }
    return 19;
  };

  const weeklyMult = (wd: number): number =>
    wd === 5 || wd === 0 ? 1.8 : wd === 6 ? 1.6 : wd === 4 ? 1.2 : 0.85;

  const pickCovers = (): number => {
    const r = rng();
    if (r < 0.1) return 1;
    if (r < 0.4) return 2;
    if (r < 0.6) return 3;
    if (r < 0.85) return 4;
    if (r < 0.95) return 5;
    return 6;
  };

  const mkHistItems = (orderId: string, created: Date): { items: OrderItem[]; total: number; prep: number } => {
    const lines = 1 + Math.floor(rng() * 3);
    const orderItems: OrderItem[] = [];
    let total = 0;
    let prep = 0;
    for (let k = 0; k < lines; k++) {
      const m = pick(itemPool);
      const qty = m.category_id === 'cat_breads' ? 2 + Math.floor(rng() * 4) : 1 + Math.floor(rng() * 2);
      total += m.price * qty;
      prep = Math.max(prep, m.prep_time_minutes);
      orderItems.push({
        id: `hi_${orderId}_${k}`,
        order_id: orderId,
        menu_item_id: m.id,
        item_name: m.name,
        quantity: qty,
        unit_price: m.price,
        status: 'ready',
      });
    }
    void created;
    return { items: orderItems, total, prep: Math.round(prep * (0.8 + rng() * 0.5)) };
  };

  const histOrders: Order[] = [];
  const summaries: DailySummary[] = [];
  const wasteLogs: WasteLog[] = [];
  const reviews: Review[] = [];
  let orderNum = 2000;

  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Emits one historical order into either the full-order list or a summary.
  const emitHistOrder = (
    day: Date,
    d: number,
    i: number,
    hour: number,
    sum: DailySummary | null,
  ): void => {
    const minute = Math.floor(rng() * 60);
    const created = new Date(day.getTime() + hour * 3600000 + minute * 60000);
    const tableNum = 1 + Math.floor(rng() * 6);
    const waiter = rng() < 0.55 ? 'user_waiter' : 'user_waiter2';
    const covers = pickCovers();
    const orderId = `hist_${d}_${i}`;
    const { items: oItems, total, prep } = mkHistItems(orderId, created);
    const updated = new Date(created.getTime() + prep * 60000);
    orderNum += 1;

    if (sum === null) {
      histOrders.push({
        id: orderId,
        order_number: orderNum,
        restaurant_id: restaurant.id,
        table_id: `table_${tableNum}`,
        waiter_id: waiter,
        customer_name: pick(CUSTOMER_NAMES),
        covers,
        status: 'completed',
        total_amount: total,
        created_at: created.toISOString(),
        updated_at: updated.toISOString(),
        items: oItems,
      });
    } else {
      sum.orders += 1;
      sum.revenue += total;
      sum.covers += covers;
      sum.hours[hour] += 1;
      sum.waiters[waiter] = (sum.waiters[waiter] ?? 0) + 1;
      sum.prep_minutes_sum += prep;
      sum.completed_count += 1;
      for (const li of oItems) sum.items[li.menu_item_id] = (sum.items[li.menu_item_id] ?? 0) + li.quantity;
    }
  };

  const blankSummary = (day: Date, wd: number): DailySummary => ({
    date: day.toISOString().slice(0, 10),
    weekday: wd,
    orders: 0,
    revenue: 0,
    covers: 0,
    items: {},
    hours: new Array<number>(24).fill(0),
    waiters: {},
    prep_minutes_sum: 0,
    completed_count: 0,
  });

  for (let d = 1; d <= 365; d++) {
    const day = new Date(dayStart.getTime() - d * 86400000);
    const wd = day.getDay();
    const nOrders = Math.max(4, Math.round(26 * weeklyMult(wd) * (0.85 + rng() * 0.3)));
    const full = d <= 45;
    const sum: DailySummary = blankSummary(day, wd);

    for (let i = 0; i < nOrders; i++) {
      emitHistOrder(day, d, i, pickHour(), full ? null : sum);
    }
    if (!full) summaries.push(sum);

    // ~1 review every 3 days
    if (rng() < 0.34) {
      const r = rng();
      const rating = r < 0.45 ? 5 : r < 0.75 ? 4 : r < 0.9 ? 3 : r < 0.97 ? 2 : 1;
      const created = new Date(day.getTime() + (12 + Math.floor(rng() * 10)) * 3600000);
      reviews.push({
        id: `hrev_${d}`,
        order_id: `hist_${d}_0`,
        rating,
        comment: rating >= 4 ? pick(REVIEW_COMMENTS) : undefined,
        customer_name: pick(CUSTOMER_NAMES),
        created_at: created.toISOString(),
      });
    }

    // occasional waste log (~8% of days)
    if (rng() < 0.08) {
      const m = pick(items);
      const qty = 1 + Math.floor(rng() * 5);
      wasteLogs.push({
        id: `hwaste_${d}`,
        restaurant_id: restaurant.id,
        menu_item_id: m.id,
        item_name: m.name,
        quantity: qty,
        reason: pick(['spoilage', 'overprep', 'spoilage', 'overprep', 'other'] as WasteReason[]),
        logged_by: 'Ali Raza',
        logged_at: new Date(day.getTime() + 22 * 3600000).toISOString(),
        estimated_cost: Math.round(m.price * qty * 0.6),
      });
    }
  }

  // Today's earlier hours (before the live demo window): completed orders so
  // "today" analytics look like a real trading day, not just the 6 live demos.
  {
    const nowH = now.getHours();
    const cutoffH = nowH - 6;
    if (cutoffH > 0) {
      const wd = dayStart.getDay();
      const nEarly = Math.max(3, Math.round(26 * weeklyMult(wd) * (cutoffH / 24) * 1.7));
      for (let i = 0; i < nEarly; i++) {
        emitHistOrder(dayStart, 0, i, Math.floor(rng() * cutoffH), null);
      }
    }
  }

  // ---------------------------------------------------------------
  // Today's live demo orders (interactive — keep as-is).
  // ---------------------------------------------------------------
  const mkItems = (orderId: string, lines: [string, number][], status: OrderItemStatus, note?: string): OrderItem[] =>
    lines.map(([itemId, qty]) => {
      const m = items.find((x) => x.id === itemId);
      return {
        id: uid(),
        order_id: orderId,
        menu_item_id: itemId,
        item_name: m?.name ?? 'Item',
        quantity: qty,
        unit_price: m?.price ?? 0,
        notes: note,
        status,
      };
    });

  const mkOrder = (
    n: number, tableNum: number, status: OrderStatus, itemStatus: OrderItemStatus,
    lines: [string, number][], createdMinsAgo: number, extra?: Partial<Order>,
  ): Order => {
    const id = `seed_order_${n}`;
    const orderItems = mkItems(id, lines, itemStatus);
    const total = orderItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    const created = isoMinsAgo(createdMinsAgo);
    return {
      id,
      order_number: 1000 + n,
      restaurant_id: restaurant.id,
      table_id: `table_${tableNum}`,
      status,
      total_amount: total,
      created_at: created,
      updated_at: status === 'completed' ? isoMinsAgo(Math.max(1, createdMinsAgo - 35)) : created,
      items: orderItems,
      ...extra,
    };
  };

  const demoOrders: Order[] = [
    mkOrder(1, 3, 'completed', 'ready', [['item_chicken_biryani', 2], ['item_doodh_patti', 2]], 300, { customer_name: 'Ahmed', covers: 2 }),
    mkOrder(2, 5, 'completed', 'ready', [['item_chicken_karahi_half', 1], ['item_roghni_naan', 4]], 180, { customer_name: 'Fatima', covers: 4 }),
    mkOrder(3, 2, 'completed', 'ready', [['item_beef_biryani', 2], ['item_lime_soda', 1]], 90, { customer_name: 'Hassan', covers: 2 }),
    mkOrder(4, 1, 'ready', 'ready', [['item_bbq_platter', 1], ['item_mango_shake', 2]], 25, { customer_name: 'Ayesha', covers: 3 }),
    mkOrder(5, 4, 'preparing', 'preparing', [['item_mutton_karahi_half', 1], ['item_garlic_naan', 2]], 12, { customer_name: 'Bilal', waiter_id: 'user_waiter', covers: 2 }),
    mkOrder(6, 6, 'pending', 'pending', [['item_chicken_tikka', 2], ['item_mint_margarita', 2]], 3, { notes: 'One tikka extra spicy', covers: 2 }),
  ];

  const allOrders = [...demoOrders, ...histOrders];

  const seedWaste: WasteLog[] = [
    {
      id: 'waste_1', restaurant_id: restaurant.id, menu_item_id: 'item_chicken_tikka',
      item_name: 'Chicken Tikka', quantity: 4, reason: 'overprep',
      logged_by: 'Ali Raza', logged_at: isoMinsAgo(240), estimated_cost: 1120,
    },
  ];

  const seedReviews: Review[] = [
    { id: 'rev_1', order_id: 'seed_order_1', rating: 5, comment: REVIEW_COMMENTS[0], customer_name: 'Ahmed', created_at: isoMinsAgo(240) },
    { id: 'rev_2', order_id: 'seed_order_2', rating: 4, comment: REVIEW_COMMENTS[1], customer_name: 'Fatima', created_at: isoMinsAgo(120) },
  ];

  return {
    version: 1,
    revision: 0,
    seq: orderNum,
    restaurant,
    tables,
    categories,
    items,
    orders: allOrders,
    summaries,
    users,
    wasteLogs: [...seedWaste, ...wasteLogs],
    reviews: [...seedReviews, ...reviews],
  };
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

export function loadDB(): DBState {
  if (typeof window === 'undefined') return seed();
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DBState;
      if (
        parsed &&
        parsed.version === 1 &&
        Array.isArray(parsed.orders) &&
        Array.isArray(parsed.items) &&
        Array.isArray(parsed.summaries)
      ) {
        return parsed;
      }
    }
  } catch {
    // Corrupt storage — reseed below.
  }
  const db = seed();
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // Storage unavailable (private mode) — run in memory.
  }
  return db;
}

function saveDB(db: DBState): DBState {
  const next: DBState = { ...db, revision: db.revision + 1 };
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(next));
  } catch {
    // ignore — in-memory fallback
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  }
  return next;
}

function mutate(fn: (db: DBState) => DBState): DBState {
  return saveDB(fn(loadDB()));
}

/** Subscribe to db changes (other tabs via 'storage' + same tab via custom event). */
export function subscribe(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const onStorage = (e: StorageEvent): void => {
    if (e.key === DB_KEY) cb();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(UPDATE_EVENT, cb);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(UPDATE_EVENT, cb);
  };
}

/** Live db snapshot: re-reads on every mutation + polls every `pollMs`. */
export function useLiveDb(pollMs = 5000): DBState {
  const [db, setDb] = useState<DBState>(() => loadDB());
  useEffect(() => {
    const refresh = (): void => {
      const next = loadDB();
      setDb((prev) => (prev.revision === next.revision ? prev : next));
    };
    refresh();
    const unsub = subscribe(refresh);
    const t = window.setInterval(refresh, pollMs);
    return () => {
      unsub();
      window.clearInterval(t);
    };
  }, [pollMs]);
  return db;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export function getTables(db: DBState): DiningTable[] {
  return db.tables.filter((t) => t.is_active).sort((a, b) => a.table_number - b.table_number);
}

export interface MenuCategoryWithItems extends MenuCategory {
  items: MenuItem[];
}

export function getMenu(db: DBState): MenuCategoryWithItems[] {
  return db.categories
    .filter((c) => c.is_active)
    .sort((a, b) => a.display_order - b.display_order)
    .map((c) => ({ ...c, items: db.items.filter((i) => i.category_id === c.id) }));
}

export function getOrder(db: DBState, id: string): Order | undefined {
  return db.orders.find((o) => o.id === id);
}

export function getActiveOrders(db: DBState): Order[] {
  return db.orders
    .filter((o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(a.created_at).getTime());
}

const isToday = (iso: string): boolean =>
  new Date(iso).toDateString() === new Date().toDateString();

export function getOrdersToday(db: DBState): Order[] {
  return db.orders
    .filter((o) => isToday(o.created_at))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/** The currently open order for a table, if any. */
export function tableActiveOrder(db: DBState, tableId: string): Order | undefined {
  return db.orders.find(
    (o) => o.table_id === tableId && (o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'),
  );
}

export function tableNumber(db: DBState, tableId: string): number | undefined {
  return db.tables.find((t) => t.id === tableId)?.table_number;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export interface CreateOrderInput {
  table_id: string;
  items: { menu_item_id: string; quantity: number; notes?: string }[];
  customer_name?: string;
  customer_phone?: string;
  covers?: number;
  notes?: string;
  waiter_id?: string;
}

export function createOrder(input: CreateOrderInput): Order {
  let created: Order | undefined;
  mutate((db) => {
    const order_number = db.seq + 1;
    const id = uid();
    const now = new Date().toISOString();
    const orderItems: OrderItem[] = input.items.map((line) => {
      const menuItem = db.items.find((m) => m.id === line.menu_item_id);
      return {
        id: uid(),
        order_id: id,
        menu_item_id: line.menu_item_id,
        item_name: menuItem?.name ?? 'Item',
        quantity: line.quantity,
        unit_price: menuItem?.price ?? 0,
        notes: line.notes,
        status: 'pending' as OrderItemStatus,
      };
    });
    created = {
      id,
      order_number,
      restaurant_id: db.restaurant.id,
      table_id: input.table_id,
      waiter_id: input.waiter_id,
      customer_name: input.customer_name || undefined,
      customer_phone: input.customer_phone || undefined,
      covers: input.covers,
      status: 'pending',
      total_amount: orderItems.reduce((s, i) => s + i.unit_price * i.quantity, 0),
      notes: input.notes || undefined,
      created_at: now,
      updated_at: now,
      items: orderItems,
    };
    return { ...db, seq: order_number, orders: [created, ...db.orders] };
  });
  if (!created) throw new Error('Failed to create order');
  return created;
}

export function updateOrderStatus(orderId: string, status: OrderStatus): void {
  mutate((db) => ({
    ...db,
    orders: db.orders.map((o) => {
      if (o.id !== orderId) return o;
      const itemStatus: OrderItemStatus =
        status === 'ready' || status === 'completed' ? 'ready' : status === 'preparing' ? 'preparing' : 'pending';
      return {
        ...o,
        status,
        updated_at: new Date().toISOString(),
        items: o.items.map((i) => ({ ...i, status: itemStatus })),
      };
    }),
  }));
}

export function updateOrderItemStatus(orderId: string, itemId: string, status: OrderItemStatus): void {
  mutate((db) => ({
    ...db,
    orders: db.orders.map((o) => {
      if (o.id !== orderId) return o;
      const items = o.items.map((i) => (i.id === itemId ? { ...i, status } : i));
      // Roll the order status up from its items.
      const allReady = items.every((i) => i.status === 'ready');
      const anyPreparing = items.some((i) => i.status === 'preparing');
      const nextStatus: OrderStatus = allReady ? 'ready' : anyPreparing ? 'preparing' : o.status === 'completed' ? 'completed' : 'pending';
      return { ...o, items, status: nextStatus, updated_at: new Date().toISOString() };
    }),
  }));
}

export interface LogWasteInput {
  menu_item_id?: string;
  item_name: string;
  quantity: number;
  reason: WasteReason;
  logged_by: string;
  estimated_cost: number;
}

export function logWaste(input: LogWasteInput): WasteLog {
  let entry: WasteLog | undefined;
  mutate((db) => {
    entry = {
      id: uid(),
      restaurant_id: db.restaurant.id,
      menu_item_id: input.menu_item_id,
      item_name: input.item_name,
      quantity: input.quantity,
      reason: input.reason,
      logged_by: input.logged_by,
      logged_at: new Date().toISOString(),
      estimated_cost: input.estimated_cost,
    };
    return { ...db, wasteLogs: [entry, ...db.wasteLogs] };
  });
  if (!entry) throw new Error('Failed to log waste');
  return entry;
}

export function getWasteLogs(db: DBState): WasteLog[] {
  return [...db.wasteLogs].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime(),
  );
}

export interface AddReviewInput {
  order_id: string;
  rating: number;
  comment?: string;
  customer_name?: string;
  customer_phone?: string;
}

export function addReview(input: AddReviewInput): Review {
  let review: Review | undefined;
  mutate((db) => {
    review = {
      id: uid(),
      order_id: input.order_id,
      rating: Math.min(5, Math.max(1, Math.round(input.rating))),
      comment: input.comment || undefined,
      customer_name: input.customer_name || undefined,
      customer_phone: input.customer_phone || undefined,
      created_at: new Date().toISOString(),
    };
    return { ...db, reviews: [review, ...db.reviews] };
  });
  if (!review) throw new Error('Failed to add review');
  return review;
}

export function getReviews(db: DBState): Review[] {
  return [...db.reviews].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function setItemAvailability(itemId: string, isAvailable: boolean): void {
  mutate((db) => ({
    ...db,
    items: db.items.map((i) => (i.id === itemId ? { ...i, is_available: isAvailable } : i)),
  }));
}

// ---------------------------------------------------------------------------
// Analytics (backwards-compatible dashboard helpers)
// ---------------------------------------------------------------------------

export interface DashboardStats {
  ordersToday: number;
  revenueToday: number;
  pendingCount: number;
  avgPrepMinutes: number;
}

export function dashboardStats(db: DBState): DashboardStats {
  const today = getOrdersToday(db);
  const completed = today.filter((o) => o.status === 'completed');
  const revenueToday = today.reduce((s, o) => s + o.total_amount, 0);
  const pendingCount = db.orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length;
  const avgPrepMinutes = completed.length
    ? Math.round(
        completed.reduce(
          (s, o) => s + (new Date(o.updated_at).getTime() - new Date(o.created_at).getTime()) / 60000,
          0,
        ) / completed.length,
      )
    : 0;
  return { ordersToday: today.length, revenueToday, pendingCount, avgPrepMinutes };
}

/** Orders created per hour (0-23) for today. */
export function ordersPerHour(db: DBState): number[] {
  const hours = new Array<number>(24).fill(0);
  for (const o of db.orders) {
    if (!isToday(o.created_at)) continue;
    hours[new Date(o.created_at).getHours()] += 1;
  }
  return hours;
}
