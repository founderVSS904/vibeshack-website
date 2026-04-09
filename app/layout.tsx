import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import RevealObserver from '@/components/RevealObserver'
import MotionEngine from '@/components/MotionEngine'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // prevents iOS auto-zoom on input focus in booking form
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.vibeshackstudios.com'),
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
  title: {
    default: 'VibeShack Studios | San Francisco Production Studio',
    template: '%s | VibeShack Studios | San Francisco',
  },
  description:
    'Professional production studios in San Francisco\'s Northern Waterfront. Green screen, podcast (podcast, 3-cam), photography & video. Book hourly from $100.',
  keywords: [
    'production studio san francisco',
    'podcast studio san francisco',
    'green screen studio sf',
    'photography studio san francisco',
    'video production studio sf',
    'film studio san francisco',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.vibeshackstudios.com',
    siteName: 'VibeShack Studios',
    title: 'VibeShack Studios | San Francisco Production Studio',
    description:
      'Professional production studios in San Francisco\'s Northern Waterfront. Green screen, podcast, photography & video. Book hourly from $100.',
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
    title: 'VibeShack Studios | San Francisco Production Studio',
    description:
      'Professional production studios in SF\'s Northern Waterfront. Green screen, podcast, photography & video.',
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
    canonical: 'https://www.vibeshackstudios.com',
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://www.vibeshackstudios.com/#business',
  name: 'VibeShack Studios',
  description: 'Professional production studios in San Francisco\'s Northern Waterfront. Podcast studios, green screen, photography, video production. Open 24/7.',
  url: 'https://www.vibeshackstudios.com',
  image: 'https://www.vibeshackstudios.com/og-image.jpg',
  logo: 'https://www.vibeshackstudios.com/brand/logo.png',
  // telephone: removed — placeholder number
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
  priceRange: '$100-$400',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '47',
    bestRating: '5',
    worstRating: '1',
  },
  hasMap: 'https://maps.google.com/?q=950+Battery+St+San+Francisco+CA+94111',
  sameAs: [
    'https://www.instagram.com/vibeshackstudios',
    'https://www.peerspace.com/spaces/vibeshack-studios',
  ],
}

// Organization schema for search results
const organizationSchema = {
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* GA4 Analytics */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA4_ID}', {
                page_path: window.location.pathname,
                cookie_flags: 'SameSite=None;Secure'
              });
            `,
          }}
        />
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`bg-black text-white antialiased ${inter.className}`}>
                <Header />
        <RevealObserver />
        <MotionEngine />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
