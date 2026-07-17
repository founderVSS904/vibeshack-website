import type { Metadata } from 'next'
import { siteUrl } from '@/lib/seo/site'

// Social card metadata only. Title, description, and canonical live in page.tsx.
export const metadata: Metadata = {
  openGraph: {
    type: 'website',
    siteName: 'VibeShack Studios',
    title: 'Canvas White Cyc Studio | VibeShack Studios SF',
    description: 'Creative Series. Flexible white cyc backdrop studio. Perfect for photography, video, and creative projects. $100/hr. Open 24/7.',
    url: `${siteUrl}/canvas-rental/`,
    images: [{ url: '/studio-images/canvas-rental-hero-v1775094073.jpg', width: 1200, height: 630, alt: 'Canvas white cyc studio at VibeShack Studios SF' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Canvas White Cyc Studio | VibeShack Studios SF',
    description: 'Creative Series. Flexible white cyc backdrop studio. Perfect for photography, video, and creative projects. $100/hr. Open 24/7.',
    images: ['/studio-images/canvas-rental-hero-v1775094073.jpg'],
  },
}

export default function CanvasRentalLayout({ children }: { children: React.ReactNode }) {
  return children
}
