import type { Metadata } from 'next'
import { DynamicFrameHero } from '@/components/DynamicFrameHero'
import { FeaturedOriginals } from '@/components/home/FeaturedOriginals'
import { TrustedStrip } from '@/components/home/TrustedStrip'
import { WhatWeDo } from '@/components/home/WhatWeDo'
import { StudioSpaces } from '@/components/home/StudioSpaces'
import { siteUrl } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: { absolute: 'VibeShack Studios | San Francisco Production Studio' },
  description:
    'Podcast, video, and photo studios at 950 Battery St, San Francisco. Book by the hour, 24/7, from $100/hr.',
  alternates: { canonical: `${siteUrl}/` },
  openGraph: {
    title: 'VibeShack Studios | San Francisco Production Studio',
    description:
      'Podcast, video, and photo studios at 950 Battery St, San Francisco. Book by the hour, 24/7, from $100/hr.',
    url: `${siteUrl}/`,
    images: [
      {
        url: `${siteUrl}/og/home-og-body-is-tea.jpg`,
        width: 1200,
        height: 630,
        alt: 'Body Is Tea music video by Varii, presented by VibeShack Studios',
      },
    ],
  },
  twitter: {
    images: [`${siteUrl}/og/home-og-body-is-tea.jpg`],
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
