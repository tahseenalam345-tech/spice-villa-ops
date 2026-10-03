import type { Config } from 'tailwindcss';

// OrderKar design system — KoDriftDev-inspired, light-first.
// All themeable colors resolve through CSS variables so the light/dark
// toggle (data-theme on <html>) flips every page instantly.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: 'var(--c-page)',
        soft: 'var(--c-soft)',
        surface: 'var(--c-surface)',
        ink: 'var(--c-ink)',
        body: 'var(--c-body)',
        muted: 'var(--c-muted)',
        line: 'var(--c-line)',
        brand: 'var(--c-brand)',
        'brand-deep': 'var(--c-brand-deep)',
        coral: 'var(--c-coral)',
        ok: 'var(--c-ok)',
        warn: 'var(--c-warn)',
        danger: 'var(--c-danger)',
        hard: 'var(--c-hard)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        lift: 'var(--shadow-lift)',
      },
      borderRadius: {
        btn: '13px',
        card: '18px',
      },
    },
  },
  plugins: [],
};

export default config;
