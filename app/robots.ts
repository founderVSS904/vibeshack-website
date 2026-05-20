import { MetadataRoute } from 'next'

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
      'https://www.vibeshackstudios.com/sitemap.xml',
      'https://www.vibeshackstudios.com/image-sitemap.xml',
    ],
    host: 'https://www.vibeshackstudios.com',
  }
}
