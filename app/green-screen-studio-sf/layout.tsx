import { greenScreenStudioSchema, breadcrumbSchema } from '@/lib/schemas'

export default function GreenScreenLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: 'https://www.vibeshackstudios.com' },
    { name: 'Studios', url: 'https://www.vibeshackstudios.com/pricing' },
    { name: 'Green Screen Studio', url: 'https://www.vibeshackstudios.com/green-screen-studio-sf' },
  ])

  const greenScreenFull = {
    ...greenScreenStudioSchema,
    name: 'Green Screen Studio - VibeShack Studios',
    description: '750 sqft floor-to-ceiling green screen studio in San Francisco. Professional lighting grid, VFX-ready setup, ideal for music videos, commercials, content creation. From $100/hr. Northern Waterfront location.',
    image: 'https://www.vibeshackstudios.com/studio-images/greenscreen-wide.jpg',
    url: 'https://www.vibeshackstudios.com/green-screen-studio-sf',
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
