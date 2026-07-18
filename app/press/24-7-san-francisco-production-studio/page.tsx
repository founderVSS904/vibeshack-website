import type { Metadata } from 'next'
import Link from 'next/link'
import { breadcrumbSchema } from '@/lib/schemas'
import { absoluteUrl, business, parentBrand, peerspaceListings, siteUrl } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: '24/7 Production Studio in San Francisco',
  description: 'Press release: VibeShack Studios brings 24/7 podcast, green screen, photo, video, and white cyc studio access to San Francisco.',
  alternates: { canonical: absoluteUrl('/press/24-7-san-francisco-production-studio/') },
  openGraph: {
    title: 'VibeShack Studios Builds a 24/7 Production Studio in San Francisco',
    description: 'The San Francisco production arm of VibeShack: a 24/7 studio for creators, brands, and production teams at 950 Battery St, San Francisco, CA 94111.',
    url: absoluteUrl('/press/24-7-san-francisco-production-studio/'),
    images: ['/og-image.jpg'],
  },
}

export default function PressReleasePage() {
  const canonical = absoluteUrl('/press/24-7-san-francisco-production-studio/')
  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Press', url: absoluteUrl('/press/') },
    { name: '24/7 San Francisco Production Studio', url: canonical },
  ])

  const newsArticle = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${canonical}#article`,
    headline: 'VibeShack Studios Builds a 24/7 Production Studio in San Francisco',
    description: 'VibeShack Studios is the San Francisco production arm of VibeShack, offering podcast sets, green screen, photo services, video, and white cyc studio rentals.',
    image: absoluteUrl('/og-image.jpg'),
    datePublished: '2026-05-09',
    dateModified: '2026-05-09',
    author: { '@id': `${siteUrl}/#business` },
    publisher: { '@id': `${siteUrl}/#business` },
    mainEntityOfPage: canonical,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticle) }} />
      <section className="bg-black pt-36 pb-20 px-6 sm:px-10 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <Link href="/press/" className="text-gray-500 hover:text-white text-sm transition-colors">← Press Kit</Link>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-brand-red mt-10 mb-6">Press Release</p>
          <h1 className="text-white font-black leading-none" style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', letterSpacing: 0 }}>
            VibeShack Studios builds a 24/7 production studio in San Francisco.
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mt-8">
            San Francisco, CA - VibeShack Studios, the production arm of {parentBrand.name}, is expanding access to hourly production space for creators, brands, agencies, and production teams at 950 Battery St in the Northern Waterfront.
          </p>
        </div>
      </section>

      <section className="bg-zinc-950 py-20 px-6 sm:px-10 lg:px-16">
        <article className="max-w-4xl mx-auto space-y-10 text-gray-300 text-lg leading-relaxed">
          <p>
            {parentBrand.name} operates as a media company and brand studio for teams that need content, campaigns, and production support. VibeShack Studios is the physical production arm, bringing multiple production environments together at one address: podcast sets, green screen, photo services, video, and white cyc rental spaces. The studio is designed for teams that need professional infrastructure without losing time to fragmented vendors, uncertain availability, or gear-heavy setup days.
          </p>
          <p>
            The facility supports hourly bookings, 24/7 availability, professional lighting, broadcast audio, camera-ready sets, and crew options. Use cases include podcast interviews, founder videos, social media campaigns, product photography, green screen explainers, music videos, commercials, and brand content days.
          </p>
          <p>
            The public studio address is {business.address.streetAddress}, {business.address.addressLocality}, {business.address.addressRegion} {business.address.postalCode}. Bookings are available directly through the VibeShack website, with additional marketplace visibility through Peerspace.
          </p>

          <div className="rounded-lg border border-white/10 bg-black p-8">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-500 mb-6">Visible Peerspace listings</p>
            <ul className="space-y-4">
              {peerspaceListings.slice(0, 4).map((listing) => (
                <li key={listing.href}>
                  <a href={listing.href} target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-red font-bold transition-colors">{listing.name}</a>
                  <p className="text-gray-500 text-sm mt-1">{listing.serviceType} · {listing.price}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-white/10 pt-10">
            <p className="text-white font-bold mb-2">Media contact</p>
            <a href={`mailto:${business.email}`} className="text-brand-red hover:text-white transition-colors">{business.email}</a>
          </div>
        </article>
      </section>
    </>
  )
}
