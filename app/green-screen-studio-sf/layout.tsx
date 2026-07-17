import { greenScreenStudioSchema, breadcrumbSchema } from '@/lib/schemas'
import { siteUrl } from '@/lib/seo/site'

export default function GreenScreenLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/` },
    { name: 'Studios', url: `${siteUrl}/pricing` },
    { name: 'Green Screen Studio', url: `${siteUrl}/green-screen-studio-sf` },
  ])

  const greenScreenFull = {
    ...greenScreenStudioSchema,
    name: 'Green Screen Studio - VibeShack Studios',
    description: '750 sqft floor-to-ceiling green screen studio in San Francisco. Professional lighting grid, VFX-ready setup, ideal for music videos, commercials, content creation. From $100/hr. Northern Waterfront location.',
    image: `${siteUrl}/studio-images/inside-green-screen-v20260509.jpg`,
    url: `${siteUrl}/green-screen-studio-sf`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(greenScreenFull) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {children}
    </>
  )
}
