import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { breadcrumbSchema } from '@/lib/schemas'
import { absoluteUrl, business, citationTargets, externalProfiles, founders, moneyPages, parentBrand, peerspaceListings } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: 'Press & Media Kit',
  description:
    'Official VibeShack and VibeShack Studios press facts, brand architecture, address, services, and media references for coverage.',
  alternates: { canonical: absoluteUrl('/press/') },
  openGraph: {
    title: 'Press & Media Kit | VibeShack Studios',
    description: 'Official facts and media resources for VibeShack and its San Francisco production arm, VibeShack Studios.',
    url: absoluteUrl('/press/'),
    images: ['/og-image.jpg'],
  },
}

export default function PressPage() {
  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Press', url: absoluteUrl('/press/') },
  ])

  const pressSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${absoluteUrl('/press/')}#press`,
    name: 'VibeShack Studios Press & Media Kit',
    about: { '@id': 'https://www.vibeshackstudios.com/#business' },
    mainEntity: { '@id': 'https://www.vibeshackstudios.com/#business' },
    mentions: [
      ...founders.map((founder) => ({ '@type': 'Person', name: founder.name, jobTitle: founder.role, sameAs: founder.sameAs })),
      ...peerspaceListings.map((listing) => ({ '@type': 'WebPage', name: listing.name, url: listing.href })),
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pressSchema) }} />

      <section className="relative min-h-[78vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/the-executive-hero.jpg" alt="VibeShack Studios podcast room in San Francisco" fill priority className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/10" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-32 w-full">
          <p className="text-brand-red text-xs font-bold tracking-[0.25em] uppercase mb-6">Official Media Kit</p>
          <h1 className="text-white font-black leading-none max-w-5xl" style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', letterSpacing: '-0.05em' }}>
            VibeShack Studios.
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mt-8">
            Official facts, links, and language for covering VibeShack, the media company and brand studio, and VibeShack Studios, its 24/7 San Francisco production arm at 950 Battery St.
          </p>
        </div>
      </section>

      <section className="bg-black py-20 px-6 sm:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16">
          <div className="space-y-16">
            <div>
              <p className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase mb-6">Boilerplate</p>
              <p className="text-white text-2xl sm:text-3xl font-light leading-relaxed max-w-4xl">
                VibeShack is a media company and brand studio for creators, founders, and companies that need content, campaigns, and production support. VibeShack Studios is the San Francisco production arm: a 24/7 production studio with podcast rooms, green screen, photo services, video production, photography studio rental, and white cyc rental spaces at 950 Battery St in the Northern Waterfront.
              </p>
              <Link href="/press/24-7-san-francisco-production-studio/" className="inline-flex text-brand-red font-bold text-sm hover:text-white transition-colors mt-6">
                Read the launch press release →
              </Link>
            </div>

            <div>
              <p className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase mb-6">Brand Architecture</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['VibeShack', parentBrand.descriptor, parentBrand.shortDescription],
                  ['VibeShack Studios', 'Production arm / local studio', business.entityRelationship],
                ].map(([name, role, copy]) => (
                  <div key={name} className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
                    <p className="text-brand-red text-xs font-bold tracking-[0.18em] uppercase mb-4">{role}</p>
                    <h2 className="text-white font-black text-2xl mb-4" style={{ letterSpacing: '-0.03em' }}>{name}</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">{copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ['Parent brand', parentBrand.name],
                ['Parent descriptor', parentBrand.descriptor],
                ['Official name', business.name],
                ['Legal name', business.legalName],
                ['Tagline', business.tagline],
                ['Address', `${business.address.streetAddress}, ${business.address.addressLocality}, ${business.address.addressRegion} ${business.address.postalCode}`],
                ['Neighborhood', business.neighborhood],
                ['Hours', 'Open 24/7'],
                ['Booking', 'Hourly studio bookings from $100/hr'],
              ].map(([label, value]) => (
                <div key={label} className="border-t border-white/10 pt-5">
                  <p className="text-gray-500 text-xs font-bold tracking-[0.18em] uppercase mb-3">{label}</p>
                  <p className="text-white text-lg font-bold">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase mb-6">Leadership Signals</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {founders.map((founder) => (
                  <a key={founder.name} href={founder.sameAs} target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-white/10 p-6 hover:border-white/30 transition-colors">
                    <h2 className="text-white font-black text-xl mb-2" style={{ letterSpacing: '-0.02em' }}>{founder.name}</h2>
                    <p className="text-gray-500 text-sm">{founder.role}</p>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase mb-6">Service Pages</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {moneyPages.map((page) => (
                  <Link key={page.href} href={page.href} className="block rounded-2xl border border-white/10 p-6 hover:border-white/30 transition-colors">
                    <h2 className="text-white font-black text-xl mb-3" style={{ letterSpacing: '-0.02em' }}>{page.label}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">{page.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase mb-6">Peerspace Footprint</p>
              <div className="space-y-3">
                {peerspaceListings.map((listing) => (
                  <a key={listing.href} href={listing.href} target="_blank" rel="noopener noreferrer" className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 rounded-2xl border border-white/10 p-5 hover:border-white/30 transition-colors">
                    <span>
                      <span className="block text-white font-bold">{listing.name}</span>
                      <span className="block text-gray-500 text-sm mt-1">{listing.serviceType}</span>
                    </span>
                    <span className="text-brand-red text-sm font-bold">{listing.price}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase mb-6">Citation Checklist</p>
              <div className="flex flex-wrap gap-2">
                {citationTargets.map((target) => (
                  <span key={target} className="rounded-full border border-white/10 px-4 py-2 text-gray-400 text-sm">{target}</span>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 self-start">
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8">
              <p className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase mb-6">Official Links</p>
              <div className="space-y-4">
                <a href={business.mapUrl} target="_blank" rel="noopener noreferrer" className="block text-white hover:text-brand-red transition-colors">Google Maps →</a>
                {externalProfiles.map((profile) => (
                  <a key={profile.href} href={profile.href} target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white transition-colors">
                    {profile.label} →
                  </a>
                ))}
                <a href={`mailto:${business.email}`} className="block text-gray-400 hover:text-white transition-colors">{business.email}</a>
              </div>
              <div className="border-t border-white/10 mt-8 pt-8">
                <Link href="/book/" prefetch={false} className="inline-flex items-center justify-center w-full bg-white text-black font-bold rounded-full px-6 py-4 hover:bg-gray-100 transition-colors">
                  Book a Session
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
