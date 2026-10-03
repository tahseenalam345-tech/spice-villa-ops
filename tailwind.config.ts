import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pine: {
          DEFAULT: '#0B3D2E',
          deep: '#062B21',
          card: '#0E4A37',
          soft: '#155843',
          line: '#1D6B52',
        },
        saffron: {
          DEFAULT: '#F2A413',
          deep: '#D98F06',
          soft: '#FCE3AC',
        },
        cream: {
          DEFAULT: '#FAF6EE',
          dim: '#F3ECDB',
          deep: '#E7DCC3',
        },
        chili: {
          DEFAULT: '#C93A2E',
          deep: '#A82E23',
        },
        leaf: {
          DEFAULT: '#35A06B',
          deep: '#237A4F',
        },
        ink: {
          DEFAULT: '#0E241B',
          soft: '#41604F',
          faint: '#7A9384',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(14, 36, 27, 0.06), 0 8px 24px -12px rgba(14, 36, 27, 0.18)',
        lift: '0 2px 4px rgba(14, 36, 27, 0.08), 0 16px 40px -16px rgba(14, 36, 27, 0.28)',
      },
    },
  },
  plugins: [],
};

export default config;
