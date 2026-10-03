'use client';

// ---------------------------------------------------------------------------
// OrderKar QR codes — real, scannable, per table.
// Scanning a table QR opens THAT table's menu: <SITE_URL>/table/<n>.
// The reviews QR opens the standalone feedback page.
//
// To change the deployment URL later, update SITE_URL here. QRs render at
// runtime from these URLs (components/QrSection.tsx); `node scripts/gen-qr.mjs`
// can still generate printable public/qr/*.png files on demand.
// ---------------------------------------------------------------------------

export const SITE_URL = 'https://spice-villa-ops.vercel.app';

export const tableUrl = (n: number): string => `${SITE_URL}/table/${n}`;
export const reviewsUrl = `${SITE_URL}/feedback`;

export interface QrDef {
  id: string; // public/qr/<id>.png
  label: string;
  sub: string;
  url: string;
}

export const TABLE_QRS: QrDef[] = [1, 2, 3, 4, 5, 6].map((n) => ({
  id: `table-${n}`,
  label: `Table ${n}`,
  sub: tableUrl(n),
  url: tableUrl(n),
}));

export const REVIEWS_QR: QrDef = {
  id: 'reviews',
  label: 'Reviews',
  sub: reviewsUrl,
  url: reviewsUrl,
};

export const ALL_QRS: QrDef[] = [...TABLE_QRS, REVIEWS_QR];
