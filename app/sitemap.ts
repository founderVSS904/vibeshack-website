import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.vibeshackstudios.com'

  // Main pages
  const pages = [
    { url: '/', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: '/pricing', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: '/book', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.95 },
    { url: '/tour', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/about', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/contact', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/support', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/made-at-vibeshack', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/find-your-studio', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/privacy', lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: '/terms', lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  // SEO landing pages
  const landingPages = [
    { url: '/podcast-studio-san-francisco', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: '/green-screen-studio-sf', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: '/photography-studio-san-francisco', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: '/rental-studios', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.75 },
  ]

  // Individual studio pages
  const studios = [
    { url: '/the-executive', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/the-wing', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/encore', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/premier', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/sunset-studio', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/parlor', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/horizon', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/canvas-podcast', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/canvas-rental', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/white-backdrop-studio', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.75 },
    { url: '/cozy-podcast', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.75 },
  ]

  return [
    ...pages.map(page => ({
      url: `${baseUrl}${page.url}`,
      lastModified: page.lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...landingPages.map(page => ({
      url: `${baseUrl}${page.url}`,
      lastModified: page.lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...studios.map(studio => ({
      url: `${baseUrl}${studio.url}`,
      lastModified: studio.lastModified,
      changeFrequency: studio.changeFrequency,
      priority: studio.priority,
    })),
  ]
}
