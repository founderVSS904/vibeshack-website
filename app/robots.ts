import { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/seo/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
          '/book/confirmation/',
          '/patriot-black/',
          '/patriotblack/',
          '/partners/patriot-black/',
        ],
      },
    ],
    sitemap: [
      `${siteUrl}/sitemap.xml`,
      `${siteUrl}/image-sitemap.xml`,
    ],
    host: siteUrl,
  }
}
