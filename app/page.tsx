import type { Metadata } from 'next'
import { DynamicFrameHero } from '@/components/DynamicFrameHero'
import { FeaturedOriginals } from '@/components/home/FeaturedOriginals'
import { TrustedStrip } from '@/components/home/TrustedStrip'
import { WhatWeDo } from '@/components/home/WhatWeDo'
import { StudioSpaces } from '@/components/home/StudioSpaces'

export const metadata: Metadata = {
  title: 'VibeShack Studios | San Francisco Production Studio',
  description:
    'Book podcast, video production, photography, branding, portfolio, and rental studio services at VibeShack Studios in San Francisco.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/' },
  openGraph: {
    title: 'VibeShack Studios | San Francisco Production Studio',
    description:
      'Podcast, video production, photography, branding, portfolio, and rental studio services in San Francisco.',
    url: 'https://www.vibeshackstudios.com/',
    images: [
      {
        url: 'https://www.vibeshackstudios.com/studio-images/work-body-is-tea-music-v20260708b.jpg',
        width: 3840,
        height: 2160,
        alt: 'Body Is Tea music video by Varii, presented by VibeShack Studios',
      },
    ],
  },
}

export default function HomePage() {
  return (
    <div className="home-landing-page">
      <DynamicFrameHero />
      <FeaturedOriginals />
      <TrustedStrip />
      <StudioSpaces />
      <WhatWeDo />
    </div>
  )
}
