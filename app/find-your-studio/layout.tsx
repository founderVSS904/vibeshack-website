import type { Metadata } from 'next'
import { siteUrl } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: 'Find Your Studio',
  description: 'Not sure which studio to book? Answer a few quick questions and get matched to a podcast, green screen, photo, or rental studio in San Francisco.',
  alternates: { canonical: `${siteUrl}/find-your-studio/` },
  openGraph: {
    type: 'website',
    siteName: 'VibeShack Studios',
    title: 'Find Your Studio | VibeShack Studios SF',
    description: 'Answer a few quick questions and get matched to a podcast, green screen, photo, or rental studio in San Francisco.',
    url: `${siteUrl}/find-your-studio/`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Find your studio at VibeShack Studios San Francisco' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Your Studio | VibeShack Studios SF',
    description: 'Answer a few quick questions and get matched to a podcast, green screen, photo, or rental studio in San Francisco.',
    images: ['/og-image.jpg'],
  },
}

export default function FindYourStudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
