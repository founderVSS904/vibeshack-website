import type { Metadata } from 'next'
import { siteUrl } from '@/lib/seo/site'

// Social card metadata only. Title, description, and canonical live in page.tsx.
export const metadata: Metadata = {
  openGraph: {
    type: 'website',
    siteName: 'VibeShack Studios',
    title: 'Book a Free Studio Tour | VibeShack Studios SF',
    description: 'Book a free VibeShack Studios tour online. Tour availability is checked against the live studio calendar at 950 Battery St, San Francisco.',
    url: `${siteUrl}/tour/`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Tour VibeShack Studios in San Francisco' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a Free Studio Tour | VibeShack Studios SF',
    description: 'Book a free VibeShack Studios tour online. Tour availability is checked against the live studio calendar at 950 Battery St, San Francisco.',
    images: ['/og-image.jpg'],
  },
}

export default function TourLayout({ children }: { children: React.ReactNode }) {
  return children
}
