import { IBM_Plex_Mono, Inter } from 'next/font/google'

// Self-hosted via next/font: fonts are downloaded at build time and served
// from /_next/static, so no runtime request to Google and CSP font-src 'self'
// stays intact. Both expose a CSS variable for the Tailwind font families.

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-ibm-plex-mono',
})
