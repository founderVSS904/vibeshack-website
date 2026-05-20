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
        sans: ['var(--font-brand-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-brand-display)'],
        mono: ['var(--font-brand-mono)'],
      },
    },
  },
  plugins: [],
}
