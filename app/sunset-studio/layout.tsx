import type { Metadata } from 'next'
import { siteUrl } from '@/lib/seo/site'
import { PODCAST_CAMERA_LABEL, PODCAST_CREW_LABEL, PODCAST_HOURLY_RATES } from '@/lib/booking/podcast-package'

const pageDescription = `Color-backdrop podcast set in San Francisco. ${PODCAST_CREW_LABEL}. ${PODCAST_CAMERA_LABEL}. $${PODCAST_HOURLY_RATES.sunset}/hr. Open 24/7.`

export const metadata: Metadata = {
  title: 'Sunset Color Backdrop Studio',
  description: pageDescription,
  alternates: { canonical: `${siteUrl}/sunset-studio/` },
  openGraph: {
    title: 'Sunset Studio | VibeShack Studios SF',
    description: pageDescription,
    url: `${siteUrl}/sunset-studio`,
    siteName: 'VibeShack Studios',
    images: [{ url: '/studio-images/sunset-hero-v20260509.jpg', width: 1200, height: 630, alt: 'Sunset Studio at VibeShack Studios SF' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sunset Studio | VibeShack Studios SF',
    description: pageDescription,
    images: ['/studio-images/sunset-hero-v20260509.jpg'],
  },
}

export default function SunsetStudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
