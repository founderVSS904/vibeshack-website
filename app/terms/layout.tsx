import type { Metadata } from 'next'
import { siteUrl } from '@/lib/seo/site'

// Social card metadata only. Title, description, and canonical live in page.tsx.
export const metadata: Metadata = {
  openGraph: {
    type: 'website',
    siteName: 'VibeShack Studios',
    title: 'Terms of Service | VibeShack Studios SF',
    description: 'Booking policies, cancellation, studio rules, and terms of use for VibeShack Studios.',
    url: `${siteUrl}/terms/`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'VibeShack Studios terms of service' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | VibeShack Studios SF',
    description: 'Booking policies, cancellation, studio rules, and terms of use for VibeShack Studios.',
    images: ['/og-image.jpg'],
  },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
