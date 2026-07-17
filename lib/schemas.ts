/**
 * Schema.org JSON-LD structured data definitions
 * Used across VibeShack Studios for SEO and rich snippets
 */

import { business } from './seo/site'

export const greenScreenStudioSchema = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: 'Green Screen Studio Rental',
  description: 'Professional green screen production studio with 4K cameras, professional lighting, and flexible backdrop setup',
  provider: {
    '@type': 'LocalBusiness',
    name: 'VibeShack Studios',
  },
  offers: {
    '@type': 'Offer',
    priceCurrency: 'USD',
    price: '100',
    availability: 'https://schema.org/InStock',
    priceValidUntil: '2027-12-31',
  },
}

// Breadcrumb schema for navigation
export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
})

// FAQ schema
export const faqSchema = (questions: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: questions.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: answer,
    },
  })),
})

export const studioServiceSchema = ({
  name,
  description,
  url,
  image,
  price,
  serviceType,
}: {
  name: string
  description: string
  url: string
  image: string
  price?: string
  serviceType: string
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${url}#service`,
  name,
  description,
  serviceType,
  image,
  url,
  provider: {
    '@id': 'https://www.vibeshackstudios.com/#business',
  },
  areaServed: [
    { '@type': 'City', name: 'San Francisco' },
    { '@type': 'AdministrativeArea', name: 'Bay Area' },
  ],
  offers: price
    ? {
        '@type': 'Offer',
        url: 'https://www.vibeshackstudios.com/book/',
        priceCurrency: 'USD',
        price,
        availability: 'https://schema.org/InStock',
        priceValidUntil: '2027-12-31',
      }
    : {
        '@type': 'Offer',
        url: 'https://www.vibeshackstudios.com/contact/',
        availability: 'https://schema.org/InStock',
        description: 'Contact VibeShack Studios for a scoped quote.',
      },
})
