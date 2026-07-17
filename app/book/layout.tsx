import type { Metadata } from 'next'
import { siteUrl } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: 'Book a Studio',
  description: 'Book a podcast studio, green screen, or white cyc rental in San Francisco. Instant confirmation. Starting at $100/hr.',
  alternates: {
    canonical: `${siteUrl}/book/`,
  },
  openGraph: {
    type: 'website',
    siteName: 'VibeShack Studios',
    title: 'Book a Studio | VibeShack Studios SF',
    description: 'Book a podcast studio, green screen, or white cyc rental in San Francisco. Instant confirmation. Starting at $100/hr.',
    url: `${siteUrl}/book/`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Book a studio at VibeShack Studios San Francisco' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a Studio | VibeShack Studios SF',
    description: 'Book a podcast studio, green screen, or white cyc rental in San Francisco. Instant confirmation. Starting at $100/hr.',
    images: ['/og-image.jpg'],
  },
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h1 className="sr-only">Book a VibeShack Studio in San Francisco</h1>
      {children}
    </>
  )
}
