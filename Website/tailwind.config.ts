import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#0a0a0c',
        bone: '#f4ede3',
        ember: '#c9a17a',
      },
      transitionTimingFunction: {
        cinematic: 'cubic-bezier(0.65, 0.02, 0.18, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
