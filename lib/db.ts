'use client';

// ---------------------------------------------------------------------------
// Spice Villa — local-first demo data layer.
//
// Bundled seed data + browser localStorage persistence. Zero backend required.
// The schema mirrors /supabase/schema.sql so a real Supabase backend can be
// wired later without changing the UI code.
//
// Cross-tab realtime: every mutation writes localStorage (fires 'storage'
// events in other tabs) AND dispatches window CustomEvent('spicevilla-db-update').
// Pages use useLiveDb() which subscribes to both and polls every 5s.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed';
export type OrderItemStatus = 'pending' | 'preparing' | 'ready';
export type StaffRole = 'owner' | 'manager' | 'waiter' | 'kitchen';
export type WasteReason = 'spoilage' | 'theft' | 'overprep' | 'other';

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
  customer_phone?: string;
  created_at: string;
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
  users: StaffUser[];
  wasteLogs: WasteLog[];
  reviews: Review[];
}

export const DB_KEY = 'spicevilla_db_v1';
const UPDATE_EVENT = 'spicevilla-db-update';

const uid = (): string =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

const isoMinsAgo = (mins: number): string =>
  new Date(Date.now() - mins * 60000).toISOString();

const img = (id: string): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

function seed(): DBState {
  const restaurant: Restaurant = {
    id: 'rest_spicevilla',
    name: 'Spice Villa',
    tagline: 'Desi flavours, served with pride',
    cuisine: 'Pakistani',
    address: 'Main Bahadurabad Road, Karachi',
    phone: '021-34567890',
  };

  const tables: DiningTable[] = Array.from({ length: 6 }, (_, i) => ({
    id: `table_${i + 1}`,
    restaurant_id: restaurant.id,
    table_number: i + 1,
    qr_code: `SPICEVILLA-T${i + 1}`,
    is_active: true,
  }));

  const categories: MenuCategory[] = [
    { id: 'cat_starters', restaurant_id: restaurant.id, name: 'Starters', display_order: 1, is_active: true },
    { id: 'cat_main', restaurant_id: restaurant.id, name: 'Main Course', display_order: 2, is_active: true },
    { id: 'cat_biryani', restaurant_id: restaurant.id, name: 'Biryani', display_order: 3, is_active: true },
    { id: 'cat_drinks', restaurant_id: restaurant.id, name: 'Drinks', display_order: 4, is_active: true },
  ];

  const items: MenuItem[] = [
    // Starters
    { id: 'item_samosa', category_id: 'cat_starters', name: 'Crispy Samosa (2 pcs)', description: 'Golden flaky pastry stuffed with spiced potatoes and peas, served with imli chutney.', price: 120, image_url: img('1601050690597-df0568f70950'), is_available: true, prep_time_minutes: 10 },
    { id: 'item_tikkaboti', category_id: 'cat_starters', name: 'Chicken Tikka Boti', description: 'Char-grilled chicken cubes marinated overnight in yoghurt and desi spices.', price: 350, image_url: img('1599487488170-d11ec9c172f0'), is_available: true, prep_time_minutes: 20 },
    { id: 'item_seekhkebab', category_id: 'cat_starters', name: 'Beef Seekh Kebab (4 pcs)', description: 'Hand-minced beef with green chillies and coriander, flame-grilled on skewers.', price: 420, image_url: img('1603360946369-dc9bb6258143'), is_available: true, prep_time_minutes: 20 },
    // Main Course
    { id: 'item_karahi', category_id: 'cat_main', name: 'Chicken Karahi (Half)', description: 'The Lahore classic — wok-tossed chicken in fresh tomatoes, ginger and green chillies.', price: 850, image_url: img('1565557623262-b51c2513a641'), is_available: true, prep_time_minutes: 25 },
    { id: 'item_daaltadka', category_id: 'cat_main', name: 'Daal Tadka', description: 'Slow-cooked yellow daal tempered with garlic, cumin and a spoon of desi ghee.', price: 320, image_url: img('1585937421612-70a008356fbe'), is_available: true, prep_time_minutes: 15 },
    { id: 'item_chapli', category_id: 'cat_main', name: 'Beef Chapli Kebab (2 pcs)', description: 'Peshawari-style flat kebabs with pomegranate seeds, served with hot naan.', price: 280, is_available: true, prep_time_minutes: 15 },
    { id: 'item_bbqplatter', category_id: 'cat_main', name: 'BBQ Platter (Serves 2)', description: 'Seekh kebab, tikka boti, malai boti and grilled wings with naan and chutneys.', price: 1450, image_url: img('1555939594-58d7cb561ad1'), is_available: true, prep_time_minutes: 30 },
    { id: 'item_garlicnaan', category_id: 'cat_main', name: 'Garlic Naan (2 pcs)', description: 'Tandoor-fresh naan brushed with garlic butter — made to scoop up karahi.', price: 80, image_url: img('1567337710282-00832b415979'), is_available: true, prep_time_minutes: 8 },
    // Biryani
    { id: 'item_chickenbiryani', category_id: 'cat_biryani', name: 'Chicken Biryani', description: 'Fragrant basmati layered with masala chicken, served with raita and salad.', price: 320, image_url: img('1589302168068-964664d93dc0'), is_available: true, prep_time_minutes: 15 },
    { id: 'item_beefbiryani', category_id: 'cat_biryani', name: 'Beef Biryani', description: 'Tender beef folded through saffron-kissed rice with crispy brown onions.', price: 380, image_url: img('1633945274405-b6c8069047b0'), is_available: true, prep_time_minutes: 15 },
    { id: 'item_chickenpulao', category_id: 'cat_biryani', name: 'Chicken Pulao', description: 'Yakhni-cooked basmati with whole spices — milder, aromatic, deeply comforting.', price: 300, is_available: true, prep_time_minutes: 15 },
    // Drinks
    { id: 'item_doodhpatti', category_id: 'cat_drinks', name: 'Doodh Patti', description: 'Slow-brewed milky chai, the dhaba way — strong, sweet and soul-warming.', price: 150, image_url: img('1571934811356-5cc061b6821f'), is_available: true, prep_time_minutes: 5 },
    { id: 'item_limesoda', category_id: 'cat_drinks', name: 'Fresh Lime Soda', description: 'Hand-pressed lime with soda and a whisper of black salt — served ice cold.', price: 180, is_available: true, prep_time_minutes: 5 },
    { id: 'item_mangolassi', category_id: 'cat_drinks', name: 'Mango Lassi', description: 'Thick churned yoghurt blended with ripe Sindhri mangoes.', price: 250, is_available: true, prep_time_minutes: 5 },
  ];

  const users: StaffUser[] = [
    { id: 'user_manager', restaurant_id: restaurant.id, email: 'manager@spicevilla.pk', password: 'demo123', role: 'manager', name: 'Ali Raza', phone: '0300-1234567', is_active: true },
    { id: 'user_kitchen', restaurant_id: restaurant.id, email: 'kitchen@spicevilla.pk', password: 'demo123', role: 'kitchen', name: 'Bilal Ahmed', phone: '0300-2345678', is_active: true },
    { id: 'user_waiter', restaurant_id: restaurant.id, email: 'waiter@spicevilla.pk', password: 'demo123', role: 'waiter', name: 'Usman Tariq', phone: '0300-3456789', is_active: true },
  ];

  // Demo orders for today so every screen has live data on first open.
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

  const orders: Order[] = [
    mkOrder(1, 3, 'completed', 'ready', [['item_chickenbiryani', 2], ['item_doodhpatti', 2]], 300, { customer_name: 'Ahmed' }),
    mkOrder(2, 5, 'completed', 'ready', [['item_karahi', 1], ['item_garlicnaan', 4]], 180, { customer_name: 'Fatima' }),
    mkOrder(3, 2, 'completed', 'ready', [['item_beefbiryani', 2], ['item_limesoda', 1]], 90, { customer_name: 'Hassan' }),
    mkOrder(4, 1, 'ready', 'ready', [['item_bbqplatter', 1], ['item_mangolassi', 2]], 25, { customer_name: 'Ayesha' }),
    mkOrder(5, 4, 'preparing', 'preparing', [['item_karahi', 2], ['item_garlicnaan', 4]], 12, { customer_name: 'Bilal', waiter_id: 'user_waiter' }),
    mkOrder(6, 6, 'pending', 'pending', [['item_samosa', 4], ['item_doodhpatti', 4]], 3, { notes: 'One samosa extra spicy' }),
  ];

  const wasteLogs: WasteLog[] = [
    {
      id: 'waste_1', restaurant_id: restaurant.id, menu_item_id: 'item_samosa',
      item_name: 'Crispy Samosa (2 pcs)', quantity: 6, reason: 'overprep',
      logged_by: 'Ali Raza', logged_at: isoMinsAgo(240), estimated_cost: 360,
    },
  ];

  const reviews: Review[] = [
    { id: 'rev_1', order_id: 'seed_order_1', rating: 5, comment: 'Biryani was on point — masala perfect, rice fluffy. Will come again!', created_at: isoMinsAgo(240) },
    { id: 'rev_2', order_id: 'seed_order_2', rating: 4, comment: 'Karahi had great flavour. Service was a little slow at peak time.', created_at: isoMinsAgo(120) },
  ];

  return {
    version: 1,
    revision: 0,
    seq: 1006,
    restaurant,
    tables,
    categories,
    items,
    orders,
    users,
    wasteLogs,
    reviews,
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
      if (parsed && parsed.version === 1 && Array.isArray(parsed.orders) && Array.isArray(parsed.items)) {
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
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
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
// Analytics
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
