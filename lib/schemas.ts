/**
 * Schema.org JSON-LD structured data definitions
 * Used across VibeShack Studios for SEO and rich snippets
 */

import { business, externalProfiles, founders, parentBrand, peerspaceListings, siteUrl, studioOffers } from './seo/site'

export const parentBrandSchema = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'Brand'],
  '@id': `${siteUrl}/#vibeshack`,
  name: parentBrand.name,
  description: parentBrand.description,
  slogan: business.tagline,
  url: `${siteUrl}/`,
  logo: business.logo,
  subOrganization: { '@id': `${siteUrl}/#org` },
  department: { '@id': `${siteUrl}/#business` },
  sameAs: business.sameAs,
}

export const baseBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'ProfessionalService'],
  '@id': 'https://www.vibeshackstudios.com/#business',
  name: business.name,
  legalName: business.legalName,
  alternateName: ['VibeShack', 'VibeShack SF', 'The Dream Factory'],
  description: business.description,
  disambiguatingDescription: business.entityRelationship,
  slogan: business.tagline,
  url: `${siteUrl}/`,
  image: business.image,
  logo: business.logo,
  email: business.email,
  address: { '@type': 'PostalAddress', ...business.address },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: business.geo.latitude,
    longitude: business.geo.longitude,
  },
  hasMap: business.mapUrl,
  parentOrganization: { '@id': `${siteUrl}/#vibeshack` },
  openingHours: 'Mo-Su 00:00-23:59',
  priceRange: business.priceRange,
  areaServed: [
    { '@type': 'City', name: 'San Francisco' },
    { '@type': 'AdministrativeArea', name: 'Bay Area' },
    { '@type': 'Place', name: business.neighborhood },
  ],
  knowsAbout: [
    'Podcast studio rental',
    'Green screen studio rental',
    'Photo services',
    'Headshot photography',
    'Portrait photography',
    'Product photography',
    'Photography studio rental',
    'White cyc studio rental',
    'Video production studio',
    'San Francisco production studio',
  ],
  makesOffer: studioOffers.map((offer) => ({
    '@type': 'Offer',
    url: `${siteUrl}${offer.href}`,
    itemOffered: {
      '@type': 'Service',
      name: offer.name,
      serviceType: offer.serviceType,
    },
    ...(offer.minPrice && offer.maxPrice && offer.unitText
      ? {
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            priceCurrency: 'USD',
            minPrice: offer.minPrice,
            maxPrice: offer.maxPrice,
            unitText: offer.unitText,
          },
        }
      : {
          description: 'Contact VibeShack Studios for a scoped quote.',
        }),
  })),
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'VibeShack Studios production studio services',
    itemListElement: studioOffers.map((offer) => ({
      '@type': 'Offer',
      url: `${siteUrl}${offer.href}`,
      itemOffered: {
        '@type': 'Service',
        name: offer.name,
        serviceType: offer.serviceType,
      },
      ...(offer.minPrice && offer.maxPrice && offer.unitText
        ? {
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              priceCurrency: 'USD',
              minPrice: offer.minPrice,
              maxPrice: offer.maxPrice,
              unitText: offer.unitText,
            },
          }
        : {
            description: 'Contact VibeShack Studios for a scoped quote.',
          }),
    })),
  },
  founder: founders.map((founder) => ({
    '@type': 'Person',
    name: founder.name,
    jobTitle: founder.role,
    sameAs: founder.sameAs,
  })),
  subjectOf: peerspaceListings.map((listing) => ({
    '@type': 'WebPage',
    name: listing.name,
    url: listing.href,
    about: listing.serviceType,
  })),
  sameAs: business.sameAs,
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://www.vibeshackstudios.com/#org',
  name: business.name,
  legalName: business.legalName,
  alternateName: ['VibeShack', 'VibeShack SF'],
  url: `${siteUrl}/`,
  logo: business.logo,
  description: business.description,
  disambiguatingDescription: business.entityRelationship,
  parentOrganization: { '@id': `${siteUrl}/#vibeshack` },
  sameAs: business.sameAs,
  founder: founders.map((founder) => ({
    '@type': 'Person',
    name: founder.name,
    jobTitle: founder.role,
    sameAs: founder.sameAs,
  })),
  subjectOf: externalProfiles.map((profile) => ({
    '@type': 'WebPage',
    name: profile.label,
    url: profile.href,
  })),
  address: { '@type': 'PostalAddress', ...business.address },
  contactPoint: {
    '@type': 'ContactPoint',
    email: business.email,
    contactType: 'customer service',
    areaServed: 'US',
    availableLanguage: 'English',
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
    priceValidUntil: '2027-12-31',
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
    priceValidUntil: '2027-12-31',
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

// Service schema for studio rental
export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Professional Studio Rental',
  description: 'Professional production studio rental in San Francisco. Podcast studios, green screen, photography studio rental, white cyc, and video production rooms. Open 24/7.',
  serviceType: 'Studio Rental',
  provider: {
    '@type': 'LocalBusiness',
    name: 'VibeShack Studios',
    url: 'https://www.vibeshackstudios.com/',
  },
  areaServed: {
    '@type': 'City',
    name: 'San Francisco',
  },
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: 'https://www.vibeshackstudios.com/book/',
  },
}

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

const schemas = {
  baseBusinessSchema,
  organizationSchema,
  podcastStudioSchema,
  greenScreenStudioSchema,
  photographyStudioSchema,
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
  studioServiceSchema,
  videoSchema,
}

export default schemas
