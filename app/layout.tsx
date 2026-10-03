import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Inter } from 'next/font/google';
import './globals.css';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'OrderKar — Restaurant chalana ab aasaan',
  description:
    'OrderKar is restaurant operations software: QR table ordering, live kitchen display, waiter app and manager dashboard — one system for dine-in restaurants.',
};

export const viewport: Viewport = {
  themeColor: '#0B3D2E',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${inter.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
