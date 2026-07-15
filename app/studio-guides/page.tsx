import type { Metadata } from 'next'
import { breadcrumbSchema } from '@/lib/schemas'
import { absoluteUrl } from '@/lib/seo/site'
import GuidesPageClient from './GuidesPageClient'

export const metadata: Metadata = {
  title: 'Studio Guides',
  description:
    'Production prep guides for podcast, green screen, photo services, white cyc, and San Francisco studio rental planning at VibeShack Studios.',
  alternates: { canonical: absoluteUrl('/studio-guides/') },
  openGraph: {
    title: 'Studio Guides | VibeShack Studios',
    description:
      'Practical production guides for choosing and preparing for studio shoots in San Francisco.',
    url: absoluteUrl('/studio-guides/'),
    images: ['/og-image.jpg'],
  },
}

export default function StudioGuidesPage() {
  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Studio Guides', url: absoluteUrl('/studio-guides/') },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <GuidesPageClient />
    </>
  )
}
