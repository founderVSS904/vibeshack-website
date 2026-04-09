import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sunset Studio: Color Backdrop Podcast Studio SF | VibeShack Studios SF',
  description: 'Programmable LED color backdrop. 3-camera 4K. Cameraman included. Immersive podcast studio in San Francisco. $300/hr. Northern Waterfront. Open 24/7.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/sunset-studio' },
  openGraph: {
    title: 'Sunset Studio | VibeShack Studios SF',
    description: 'Programmable LED color backdrop studio with 12 colors, 4K cameras, and cameraman included. $300/hr in San Francisco.',
    url: 'https://www.vibeshackstudios.com/sunset-studio',
    siteName: 'VibeShack Studios',
    images: [{ url: '/studio-images/sunset-hero.jpg', width: 1200, height: 630, alt: 'Sunset Studio at VibeShack Studios SF' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sunset Studio | VibeShack Studios SF',
    description: 'Programmable LED color backdrop studio with 12 colors, 4K cameras, and cameraman included. $300/hr in San Francisco.',
    images: ['/studio-images/sunset-hero.jpg'],
  },
}

export default function SunsetStudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
