import type { Metadata, Viewport } from 'next';
import { Manrope, DM_Sans } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
});
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'OrderKar — Restaurant chalana ab aasaan',
  description:
    'OrderKar is restaurant operations software: QR table ordering, live kitchen display, waiter app, manager and owner dashboards — one system for dine-in restaurants.',
};

export const viewport: Viewport = {
  themeColor: '#ECEEF2',
};

// Runs before paint: restores the saved theme (or OS preference) with no flash.
const THEME_INIT = `(function(){try{var t=localStorage.getItem('orderkar_theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${dmSans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
