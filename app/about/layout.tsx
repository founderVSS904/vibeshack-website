import type { Metadata } from 'next'
import { siteUrl } from '@/lib/seo/site'

// Social card metadata only. Title, description, and canonical live in page.tsx.
export const metadata: Metadata = {
  openGraph: {
    type: 'website',
    siteName: 'VibeShack Studios',
    title: 'About | VibeShack Studios SF',
    description: 'VibeShack Studios is San Francisco creative production infrastructure: podcast, green screen, photo, and rental studios at the Northern Waterfront.',
    url: `${siteUrl}/about/`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'About VibeShack Studios San Francisco' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | VibeShack Studios SF',
    description: 'VibeShack Studios is San Francisco creative production infrastructure: podcast, green screen, photo, and rental studios at the Northern Waterfront.',
    images: ['/og-image.jpg'],
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
