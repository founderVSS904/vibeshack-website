/**
 * Schema.org JSON-LD structured data definitions
 * Used across VibeShack Studios for SEO and rich snippets
 */

export const baseBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://www.vibeshackstudios.com/#business',
  name: 'VibeShack Studios',
  description: 'Professional production studios in San Francisco\'s Northern Waterfront. Podcast studios, green screen, photography, video production. Open 24/7.',
  url: 'https://www.vibeshackstudios.com',
  image: 'https://www.vibeshackstudios.com/og-image.jpg',
  logo: 'https://www.vibeshackstudios.com/brand/logo.png',
  email: 'founder@vibeshackstudios.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '950 Battery St',
    addressLocality: 'San Francisco',
    addressRegion: 'CA',
    postalCode: '94111',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 37.8009,
    longitude: -122.4003,
  },
  openingHours: 'Mo-Su 00:00-23:59',
  priceRange: '$100-$300',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '47',
    bestRating: '5',
    worstRating: '1',
  },
  sameAs: [
    'https://www.instagram.com/vibeshackstudios',
    'https://www.peerspace.com/spaces/vibeshack-studios',
  ],
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://www.vibeshackstudios.com/#org',
  name: 'VibeShack Studios',
  url: 'https://www.vibeshackstudios.com',
  logo: 'https://www.vibeshackstudios.com/brand/logo.png',
  description: 'Professional production studios in San Francisco. Podcast, green screen, photography, video production.',
  sameAs: [
    'https://www.instagram.com/vibeshackstudios',
    'https://www.peerspace.com/spaces/vibeshack-studios',
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: '950 Battery St',
    addressLocality: 'San Francisco',
    addressRegion: 'CA',
    postalCode: '94111',
    addressCountry: 'US',
  },
}

export const podcastStudioSchema = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: 'Podcast Studio Rental',
  description: 'Professional podcast studio with cameraman included, broadcast equipment, and hair & makeup room',
  provider: {
    '@type': 'LocalBusiness',
    name: 'VibeShack Studios',
  },
  offers: {
    '@type': 'Offer',
    priceCurrency: 'USD',
    price: '300',
    availability: 'https://schema.org/InStock',
    availabilityStarts: '2024-01-01T00:00:00Z',
    availabilityEnds: '2025-12-31T23:59:59Z',
  },
}

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
    availabilityStarts: '2024-01-01T00:00:00Z',
    availabilityEnds: '2025-12-31T23:59:59Z',
  },
}

export const photographyStudioSchema = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: 'Photography Studio Rental',
  description: 'Professional photography studio with full lighting grid, hair & makeup room, and versatile backdrops',
  provider: {
    '@type': 'LocalBusiness',
    name: 'VibeShack Studios',
  },
  offers: {
    '@type': 'Offer',
    priceCurrency: 'USD',
    price: '100',
    availability: 'https://schema.org/InStock',
    availabilityStarts: '2024-01-01T00:00:00Z',
    availabilityEnds: '2025-12-31T23:59:59Z',
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

// Service schema for studio rental
export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Professional Studio Rental',
  description: 'Professional production studio rental in San Francisco. Podcast studios, green screen, photography. Open 24/7.',
  serviceType: 'Studio Rental',
  provider: {
    '@type': 'LocalBusiness',
    name: 'VibeShack Studios',
    url: 'https://www.vibeshackstudios.com',
  },
  areaServed: {
    '@type': 'City',
    name: 'San Francisco',
  },
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: 'https://www.vibeshackstudios.com/book',
  },
}

// Review aggregate schema
export const reviewSchema = {
  '@context': 'https://schema.org',
  '@type': 'AggregateRating',
  ratingValue: '4.9',
  reviewCount: '47',
  bestRating: '5',
  worstRating: '1',
}

// Video schema for hero content
export const videoSchema = (videoUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: 'VibeShack Studios Tour',
  description: 'Tour of professional production studios in San Francisco',
  thumbnailUrl: 'https://www.vibeshackstudios.com/og-image.jpg',
  uploadDate: '2024-01-01T00:00:00Z',
  duration: 'PT2M',
  contentUrl: videoUrl,
})

export default {
  baseBusinessSchema,
  organizationSchema,
  podcastStudioSchema,
  greenScreenStudioSchema,
  photographyStudioSchema,
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
  reviewSchema,
  videoSchema,
}
