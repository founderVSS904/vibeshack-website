import { NextResponse } from 'next/server'
import { comparisons } from '@/lib/seo/comparisons'
import { absoluteUrl } from '@/lib/seo/site'
import { studioGuides } from '@/lib/seo/studioGuides'
import { useCases } from '@/lib/seo/useCases'
import { allWorkProjects } from '@/lib/seo/workProjects'

export const dynamic = 'force-static'

const pageImages = [
  {
    loc: '/',
    images: [
      ['/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg', 'Two-person podcast recording at VibeShack Studios San Francisco'],
      ['/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg', 'Video production lighting setup at VibeShack Studios San Francisco'],
      ['/studio-images/canvas-rental-music-v1775095665.jpg', 'Music video production inside a VibeShack Studios rental space'],
      ['/studio-images/photo-gallery-direct-beauty-portrait-v20260520.jpg', 'Photography services portrait created at VibeShack Studios San Francisco'],
      ['/studio-images/home-branding-pure-magic-v20260716.jpg', 'Pure Magic product branding image featured on the VibeShack Studios homepage'],
      ['/studio-images/canvas-rental-space-v20260509.jpg', 'White cyc rental studio at VibeShack Studios San Francisco'],
      ['/studio-images/work-body-is-tea-music-v20260708b.jpg', 'Body Is Tea music video by Varii, presented by VibeShack Studios'],
      ['/studio-images/work-the-buzzer-silicon-mania-v20260708.jpg', 'The Buzzer pitch show by Silicon Mania, shot at VibeShack Studios'],
      ['/studio-images/work-wing-battle-melindas-v20260708b.jpg', "Melinda's Hot Sauce Wing Battle event film by VibeShack Studios"],
      ['/studio-images/sunset-hero-v20260509.jpg', 'Sunset color podcast studio at VibeShack Studios San Francisco'],
      ['/studio-images/enhanced-encore-podcast-wide-v20260510.jpg', 'Encore modern podcast studio at VibeShack Studios San Francisco'],
      ['/studio-images/enhanced-the-wing-podcast-guest-closeup-v20260510.jpg', 'The Wing cozy podcast studio at VibeShack Studios San Francisco'],
      ['/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg', 'Canvas Podcast white cyc stage at VibeShack Studios San Francisco'],
      ['/studio-images/inside-green-screen-v20260509.jpg', 'Green screen studio at VibeShack Studios San Francisco'],
      ['/studio-images/inside-photography-red-v20260509.jpg', 'Photography studio at VibeShack Studios San Francisco'],
      ['/studio-images/parlor-production-v20260509.jpg', 'Parlor premium interview studio at VibeShack Studios San Francisco'],
      ['/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg', 'Horizon immersive podcast studio at VibeShack Studios San Francisco'],
      ['/studio-images/inside-canvas-cyc-v20260509.jpg', 'Canvas white cyc studio at VibeShack Studios San Francisco'],
    ],
  },
  {
    loc: '/services/',
    images: [
      ['/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg', 'Blue-lit production services set at VibeShack Studios San Francisco'],
      ['/studio-images/enhanced-photography-cyc-fashion-black-curtain-v20260716.jpg', 'Photo services and creative photoshoots at VibeShack Studios San Francisco'],
      ['/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg', 'Video production lighting setup at VibeShack Studios San Francisco'],
      ['/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg', 'Podcast production services at VibeShack Studios San Francisco'],
    ],
  },
  {
    loc: '/podcast-studio-san-francisco/',
    images: [
      ['/studio-images/podcast-cyc-duo.jpg', 'Two-person podcast recording at VibeShack Studios San Francisco'],
      ['/studio-images/the-wing-hero.jpg', 'The Wing podcast studio at VibeShack Studios San Francisco'],
      ['/studio-images/the-executive-hero.jpg', 'The Executive podcast studio at VibeShack Studios San Francisco'],
      ['/studio-images/encore-wide.jpg', 'Encore podcast studio at VibeShack Studios San Francisco'],
    ],
  },
  {
    loc: '/commercials/',
    images: [
      ['/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg', 'Commercial video production lighting setup at VibeShack Studios San Francisco'],
      ['/studio-images/usecase-brand-content-v20260509.jpg', 'Brand content production setup at VibeShack Studios San Francisco'],
      ['/studio-images/parlor-production-v20260509.jpg', 'Premium interview setup for commercial videos at VibeShack Studios San Francisco'],
    ],
  },
  {
    loc: '/editorials/',
    images: [
      ['/studio-images/photo-gallery-direct-beauty-portrait-v20260520.jpg', 'Editorial beauty portrait photographed at VibeShack Studios San Francisco'],
      ['/studio-images/enhanced-photography-cyc-fashion-black-curtain-v20260716.jpg', 'Fashion editorial photographed at VibeShack Studios San Francisco'],
      ['/studio-images/photo-gallery-red-blue-sunglasses-v20260520.jpg', 'Color-driven editorial portrait photographed at VibeShack Studios San Francisco'],
    ],
  },
  {
    loc: '/branding/',
    images: [
      ['/studio-images/photo-gallery-red-blue-sunglasses-v20260520.jpg', 'Color-driven branding and creative direction image from VibeShack Studios San Francisco'],
      ['/studio-images/usecase-brand-content-v20260509.jpg', 'Brand content creative direction at VibeShack Studios San Francisco'],
      ['/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg', 'Blue stage brand content system at VibeShack Studios San Francisco'],
    ],
  },
  {
    loc: '/green-screen-studio-sf/',
    images: [['/studio-images/inside-green-screen-v20260509.jpg', 'Green screen studio rental in San Francisco at VibeShack Studios']],
  },
  {
    loc: '/photo-services/',
    images: [
      ['/studio-images/photography-hero-service-v20260509.jpg', 'Photo services for headshots portraits and campaign photography at VibeShack Studios San Francisco'],
      ['/studio-images/photo-gallery-white-cyc-glam-portrait-v20260520.jpg', 'White cyc glam portrait photographed at VibeShack Studios San Francisco'],
      ['/studio-images/photo-gallery-black-red-afro-portrait-v20260520.jpg', 'Black and red studio portrait photographed at VibeShack Studios San Francisco'],
      ['/studio-images/photo-gallery-direct-beauty-portrait-v20260520.jpg', 'Direct beauty portrait photographed at VibeShack Studios San Francisco'],
      ['/studio-images/photo-gallery-red-sunglasses-portrait-v20260520.jpg', 'Red backdrop sunglasses portrait photographed at VibeShack Studios San Francisco'],
    ],
  },
  {
    loc: '/about/',
    images: [
      ['/brand/vibeshack/dream-factory-rooftop-wide-v20260520.jpg', 'VibeShack Dream Factory hoodie on a San Francisco rooftop'],
      ['/brand/vibeshack/dream-factory-rooftop-detail-v20260520.jpg', 'Dream Factory hoodie detail with red and blue production light'],
    ],
  },
  {
    loc: '/sunset-studio/',
    images: [['/studio-images/sunset-hero-v20260509.jpg', 'Sunset color podcast studio rental in San Francisco at VibeShack Studios']],
  },
  {
    loc: '/photography-studio-san-francisco/',
    images: [
      ['/studio-images/photography-hero-service-v20260509.jpg', 'Fashion campaign photography created at VibeShack Studios San Francisco'],
      ['/studio-images/photography-room-red-backdrop-v20260509.jpg', 'Photography room rental in San Francisco at VibeShack Studios'],
      ['/studio-images/photography-spotlight-portrait-v20260509.jpg', 'Spotlight portrait photography created at VibeShack Studios San Francisco'],
      ['/studio-images/photography-cyc-editorial-v20260509.jpg', 'Editorial cyc photography created at VibeShack Studios San Francisco'],
    ],
  },
  {
    loc: '/video-production/',
    images: [
      ['/studio-images/usecase-brand-content-v20260509.jpg', 'Video production studio in San Francisco at VibeShack Studios'],
      ['/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg', 'Behind the scenes video production lighting at VibeShack Studios San Francisco'],
      ['/studio-images/inside-green-screen-v20260509.jpg', 'Green screen video production studio at VibeShack Studios San Francisco'],
      ['/studio-images/inside-canvas-cyc-v20260509.jpg', 'White cyc video production studio at VibeShack Studios San Francisco'],
    ],
  },
  {
    loc: '/canvas-rental/',
    images: [['/studio-images/canvas-rental-hero-v1775094073.jpg', 'White cyc studio rental in San Francisco at VibeShack Studios']],
  },
  {
    loc: '/rental-studios/',
    images: [
      ['/studio-images/inside-canvas-cyc-v20260509.jpg', 'Canvas Rental white cyc studio at VibeShack Studios San Francisco'],
      ['/studio-images/inside-green-screen-v20260509.jpg', 'Green Screen studio at VibeShack Studios San Francisco'],
    ],
  },
  {
    loc: '/parlor/',
    images: [
      ['/studio-images/parlor-hero.jpg', 'Parlor interview studio with Chesterfield seating at VibeShack Studios San Francisco'],
      ['/studio-images/parlor-production-v20260509.jpg', 'Parlor podcast microphones and premium seating at VibeShack Studios San Francisco'],
    ],
  },
  {
    loc: '/horizon/',
    images: [
      ['/studio-images/horizon-hero.jpg', 'Horizon warm sunset studio at VibeShack Studios San Francisco'],
      ['/studio-images/horizon-wide-v20260509.jpg', 'Horizon curated podcast studio at VibeShack Studios San Francisco'],
    ],
  },
  {
    loc: '/the-executive/',
    images: [['/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg', 'The Executive podcast studio at VibeShack Studios San Francisco']],
  },
  {
    loc: '/the-wing/',
    images: [['/studio-images/the-wing-hero.jpg', 'The Wing podcast studio at VibeShack Studios San Francisco']],
  },
  {
    loc: '/encore/',
    images: [['/studio-images/enhanced-encore-podcast-wide-v20260510.jpg', 'Encore podcast studio at VibeShack Studios San Francisco']],
  },
  {
    loc: '/made-at-vibeshack/',
    images: [
      ['/studio-images/shot-here-beatrice-motion-v20260509.jpg', 'White cyc movement photography created at VibeShack Studios San Francisco'],
      ['/studio-images/shot-here-red-fabric-portrait-v20260509.jpg', 'Red fabric portrait photography created at VibeShack Studios San Francisco'],
      ['/studio-images/shot-here-joshua-spotlight-v20260509.jpg', 'Spotlight portrait photography created at VibeShack Studios San Francisco'],
    ],
  },
  {
    loc: '/our-work/',
    images: allWorkProjects.map((project) => [project.image, project.alt]),
  },
  ...allWorkProjects.map((project) => ({
    loc: `/our-work/${project.slug}/`,
    images: [[project.image, project.alt]],
  })),
  ...studioGuides.map((guide) => ({
    loc: `/studio-guides/${guide.slug}/`,
    images: [[guide.image, guide.imageAlt]],
  })),
  ...useCases.map((useCase) => ({
    loc: `/use-cases/${useCase.slug}/`,
    images: [[useCase.image, useCase.imageAlt]],
  })),
  ...comparisons.map((comparison) => ({
    loc: `/compare/${comparison.slug}/`,
    images: [[comparison.image, comparison.imageAlt]],
  })),
]

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pageImages.map((page) => `  <url>
    <loc>${escapeXml(absoluteUrl(page.loc))}</loc>
${page.images.map(([src, caption]) => `    <image:image>
      <image:loc>${escapeXml(absoluteUrl(src))}</image:loc>
      <image:caption>${escapeXml(caption)}</image:caption>
    </image:image>`).join('\n')}
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
