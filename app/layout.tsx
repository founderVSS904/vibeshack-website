import type { Metadata } from 'next'
import './globals.css'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AttributionCapture from '@/components/AttributionCapture'
import { business, externalProfiles, founders, parentBrand, peerspaceListings, siteUrl, studioOffers } from '@/lib/seo/site'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  manifest: '/manifest.json',
  metadataBase: new URL('https://www.vibeshackstudios.com/'),
  icons: {
    icon: [
      {
        url: '/favicon-vs-monogram-20260520-32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/favicon-vs-monogram-20260520-16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon-vs-monogram-20260520.ico',
        sizes: '16x16 32x32 48x48 64x64',
        type: 'image/x-icon',
      },
    ],
    shortcut: '/favicon-vs-monogram-20260520-32.png',
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  title: {
    default: 'VibeShack Studios | SF Production Studio',
    template: '%s | VibeShack SF',
  },
  description:
    'VibeShack Studios is the San Francisco production arm of VibeShack, a media company and brand studio. Podcast, green screen, photo, video, and studio rentals.',
  keywords: [
    'production studio san francisco',
    'podcast studio san francisco',
    'green screen studio sf',
    'photo services san francisco',
    'headshots san francisco',
    'portrait photography san francisco',
    'photography studio san francisco',
    'video production studio sf',
    'film studio san francisco',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.vibeshackstudios.com/',
    siteName: 'VibeShack Studios',
    title: 'VibeShack Studios | San Francisco Production Studio',
    description:
      'The San Francisco production arm of VibeShack. Green screen, podcast, photo services, video production, and rental studios.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VibeShack Studios San Francisco Production Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vibeshackhq',
    creator: '@vibeshackhq',
    title: 'VibeShack Studios | San Francisco Production Studio',
    description:
      'VibeShack Studios is VibeShack\'s SF production arm: green screen, podcast, photo services, video, and studio rentals.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.vibeshackstudios.com/',
  },
}

const localBusinessSchema = {
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
  telephone: business.phone,
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
    { '@type': 'Place', name: 'Northern Waterfront' },
  ],
  knowsAbout: [
    'Podcast studio rental',
    'Green screen studio rental',
    'Commercial video production',
    'Editorial photoshoots',
    'Branding and creative direction',
    'Photo services',
    'Headshot photography',
    'Portrait photography',
    'Product photography',
    'Photography studio rental',
    'White cyc studio rental',
    'Video production studio',
    'San Francisco production studio',
  ],
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
    ...(founder.sameAs ? { sameAs: founder.sameAs } : {}),
  })),
  subjectOf: peerspaceListings.map((listing) => ({
    '@type': 'WebPage',
    name: listing.name,
    url: listing.href,
    about: listing.serviceType,
  })),
  sameAs: business.sameAs,
}

// Organization schema for search results
const parentBrandSchema = {
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

const organizationSchema = {
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
    ...(founder.sameAs ? { sameAs: founder.sameAs } : {}),
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

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://www.vibeshackstudios.com/#website',
  name: 'VibeShack Studios',
  url: 'https://www.vibeshackstudios.com/',
  publisher: {
    '@id': 'https://www.vibeshackstudios.com/#org',
  },
  inLanguage: 'en-US',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA4_ID
  const hasValidGaId = gaId && gaId !== 'undefined' && gaId !== 'G-PLACEHOLDER'

  return (
    <html lang="en">
      <head>
        {hasValidGaId && (
          <>
            {/* GA4 Analytics */}
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
                cookie_flags: 'SameSite=None;Secure'
              });
            `,
              }}
            />
          </>
        )}
      </head>
      <body className="bg-black text-white antialiased">
        <AttributionCapture />
        <Header />
        <main>{children}</main>
        <Footer />
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(parentBrandSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </body>
    </html>
  )
}
