// Generates printable QR PNGs into public/qr/.
// Run: node scripts/gen-qr.mjs   (after changing SITE_URL in lib/qr.ts,
// update the constant below to match and re-run.)
import QRCode from 'qrcode';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const SITE_URL = 'https://spice-villa-ops.vercel.app';

const CODES = [
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ id: `table-${n}`, url: `${SITE_URL}/table/${n}` })),
  { id: 'reviews', url: `${SITE_URL}/feedback` },
];

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'qr');
mkdirSync(outDir, { recursive: true });

for (const c of CODES) {
  const file = join(outDir, `${c.id}.png`);
  await QRCode.toFile(file, c.url, {
    width: 1024,
    margin: 2,
    color: { dark: '#0F172A', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  });
  console.log('wrote', file, '->', c.url);
}
