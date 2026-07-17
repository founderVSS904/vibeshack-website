import { MetadataRoute } from 'next'
import { comparisons } from '@/lib/seo/comparisons'
import { studioGuides } from '@/lib/seo/studioGuides'
import { useCases } from '@/lib/seo/useCases'
import { allWorkProjects } from '@/lib/seo/workProjects'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.vibeshackstudios.com'
  const lastModified = new Date('2026-07-16')
  const absoluteUrl = (path: string) => `${baseUrl}${path === '/' ? '/' : `${path}/`}`

  // Main pages. The parked old homepage at /duplicate/ is intentionally
  // excluded here and carries noindex, nofollow in its own metadata.
  const pages = [
    { url: '/', lastModified, changeFrequency: 'weekly' as const, priority: 1 },
    { url: '/pricing', lastModified, changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: '/book', lastModified, changeFrequency: 'weekly' as const, priority: 0.95 },
    { url: '/tour', lastModified, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/about', lastModified, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/contact', lastModified, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/support', lastModified, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/made-at-vibeshack', lastModified, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/our-work', lastModified, changeFrequency: 'monthly' as const, priority: 0.82 },
    { url: '/services', lastModified, changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: '/find-your-studio', lastModified, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/studio-guides', lastModified, changeFrequency: 'monthly' as const, priority: 0.75 },
    { url: '/use-cases', lastModified, changeFrequency: 'monthly' as const, priority: 0.75 },
    { url: '/compare', lastModified, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/press', lastModified, changeFrequency: 'monthly' as const, priority: 0.65 },
    { url: '/press/24-7-san-francisco-production-studio', lastModified, changeFrequency: 'monthly' as const, priority: 0.62 },
    { url: '/privacy', lastModified, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: '/terms', lastModified, changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  // SEO landing pages
  const landingPages = [
    { url: '/podcast-studio-san-francisco', lastModified, changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: '/commercials', lastModified, changeFrequency: 'monthly' as const, priority: 0.84 },
    { url: '/editorials', lastModified, changeFrequency: 'monthly' as const, priority: 0.84 },
    { url: '/branding', lastModified, changeFrequency: 'monthly' as const, priority: 0.82 },
    { url: '/green-screen-studio-sf', lastModified, changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: '/photo-services', lastModified, changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: '/photography-studio-san-francisco', lastModified, changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: '/video-production', lastModified, changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: '/rental-studios', lastModified, changeFrequency: 'monthly' as const, priority: 0.75 },
  ]

  // Individual studio pages
  const studios = [
    { url: '/the-executive', lastModified, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/the-wing', lastModified, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/encore', lastModified, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/sunset-studio', lastModified, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/parlor', lastModified, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/horizon', lastModified, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/canvas-podcast', lastModified, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/canvas-rental', lastModified, changeFrequency: 'monthly' as const, priority: 0.8 },
  ]

  return [
    ...pages.map(page => ({
      url: absoluteUrl(page.url),
      lastModified: page.lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...landingPages.map(page => ({
      url: absoluteUrl(page.url),
      lastModified: page.lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...studios.map(studio => ({
      url: absoluteUrl(studio.url),
      lastModified: studio.lastModified,
      changeFrequency: studio.changeFrequency,
      priority: studio.priority,
    })),
    ...allWorkProjects.map(project => ({
      url: absoluteUrl(`/our-work/${project.slug}`),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...studioGuides.map(guide => ({
      url: absoluteUrl(`/studio-guides/${guide.slug}`),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...useCases.map(useCase => ({
      url: absoluteUrl(`/use-cases/${useCase.slug}`),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.72,
    })),
    ...comparisons.map(comparison => ({
      url: absoluteUrl(`/compare/${comparison.slug}`),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.68,
    })),
  ]
}
