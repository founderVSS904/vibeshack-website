import type { Metadata } from 'next'
import { CinemaExperience } from '@/components/our-work/CinemaExperience'
import { cinemaProjects } from '@/lib/cinema/cinemaCatalog'
import { absoluteUrl, siteUrl } from '@/lib/seo/site'
import { breadcrumbSchema } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'Our Work',
  description:
    'Music videos, series, sports films, and event coverage produced with VibeShack Studios in San Francisco, plus client shows shot in our rooms.',
  alternates: { canonical: `${siteUrl}/our-work/` },
  openGraph: {
    title: 'Our Work | VibeShack Studios SF',
    description:
      'Music videos, series, sports films, and event coverage produced with VibeShack Studios in San Francisco.',
    url: `${siteUrl}/our-work/`,
    images: ['/og/home-og-body-is-tea.jpg'],
  },
}

const breadcrumbs = breadcrumbSchema([
  { name: 'VibeShack Studios', url: absoluteUrl('/') },
  { name: 'Our Work', url: absoluteUrl('/our-work/') },
])

export default function OurWorkPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <CinemaExperience projects={cinemaProjects} />
    </>
  )
}
