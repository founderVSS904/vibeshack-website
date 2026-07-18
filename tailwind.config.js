/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#EC0000',
          dark: '#0a0a0a',
          gray: '#111111',
          muted: '#888888',
          border: '#222222',
        },
      },
      fontFamily: {
        // --font-inter and --font-ibm-plex-mono come from next/font in app/fonts.ts
        sans: [
          'var(--font-inter)',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
        // Druk Condensed is not licensed; the display stack is the heavy
        // condensed system chain set in app/layout.tsx (brandFontStyle).
        display: ['var(--font-brand-display)'],
        mono: [
          'var(--font-ibm-plex-mono)',
          'SFMono-Regular',
          'Consolas',
          '"Liberation Mono"',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}
