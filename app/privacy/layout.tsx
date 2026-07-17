import type { Metadata } from 'next'
import { siteUrl } from '@/lib/seo/site'

// Social card metadata only. Title, description, and canonical live in page.tsx.
export const metadata: Metadata = {
  openGraph: {
    type: 'website',
    siteName: 'VibeShack Studios',
    title: 'Privacy Policy | VibeShack Studios SF',
    description: 'How VibeShack Studios collects, uses, and protects your personal information.',
    url: `${siteUrl}/privacy/`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'VibeShack Studios privacy policy' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | VibeShack Studios SF',
    description: 'How VibeShack Studios collects, uses, and protects your personal information.',
    images: ['/og-image.jpg'],
  },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
