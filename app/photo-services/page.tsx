import type { Metadata } from 'next'
import Link from 'next/link'
import { absoluteUrl, business, siteUrl } from '@/lib/seo/site'
import PhotoServicesHero from './PhotoServicesHero'
import { breadcrumbSchema, faqSchema } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'Photo Services SF',
  description:
    'Photo services in San Francisco for product photography, headshots, food, portraits, weddings and events, campaigns, lookbooks, press photos, and content days.',
  alternates: {
    canonical: `${siteUrl}/photo-services/`,
  },
  openGraph: {
    title: 'Photo Services San Francisco | VibeShack Studios',
    description:
      'Book a produced photoshoot for product photography, headshots, food, portraits, weddings and events, campaigns, press photos, and content days.',
    url: `${siteUrl}/photo-services/`,
    images: ['/studio-images/enhanced-photography-cyc-fashion-black-curtain-v20260716.jpg'],
  },
}

const process = [
  ['Brief', 'We define the audience, final placements, mood, references, must-have shots, and what would make the shoot feel successful.'],
  ['Plan', 'We match the shoot to the right room, lighting direction, backgrounds, wardrobe rhythm, product needs, and day-of flow.'],
  ['Shoot', 'The session runs around useful deliverables first, then creative variations once the required images are protected.'],
  ['Wrap', 'We review priorities before the day ends so there are no missing headshots, product crops, press images, or campaign frames.'],
]

const faqs = [
  {
    question: 'Is this the same as renting a room?',
    answer:
      'No. Photo services means VibeShack plans and produces the shoot: product photography, headshots and portraits, food and beverage, editorials and lookbooks, wedding and event content, and full content days. If you already have a photographer and only need the room, book Canvas Rental under rentals instead.',
  },
  {
    question: 'Do you shoot headshots and portraits?',
    answer:
      'Yes. Headshots, team portraits, founder portraits, artist portraits, press photos, and brand profile images are all strong fits for the studio.',
  },
  {
    question: 'Can you shoot food, products, and event content?',
    answer:
      'Yes. Food and beverage images, product stills, ecommerce crops, and wedding and event content are planned shoots here, scoped the same way as portrait work.',
  },
  {
    question: 'How is pricing handled?',
    answer:
      'Photo services are quoted after the brief, shot list, crew needs, number of people or products, usage, timeline, and post-production expectations are clear. Room-only rental is separate and starts at $100 per hour.',
  },
  {
    question: 'Can you shoot products and portraits in one session?',
    answer:
      'Yes, that is what a content day is for. We define the required deliverables first so the day can move through headshots, portraits, product details, and campaign images without missing priority shots.',
  },
]

const photoServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${siteUrl}/photo-services/#service`,
  name: 'Photo Services in San Francisco',
  serviceType: 'Photography Services',
  description:
    'Photoshoot services in San Francisco for product photography, food photography, headshots, portraits, weddings and events, brand campaigns, lookbooks, press photos, and content days.',
  url: `${siteUrl}/photo-services/`,
  image: `${siteUrl}/studio-images/enhanced-photography-cyc-fashion-black-curtain-v20260716.jpg`,
  provider: {
    '@id': `${siteUrl}/#business`,
  },
  areaServed: [
    { '@type': 'City', name: 'San Francisco' },
    { '@type': 'AdministrativeArea', name: 'Bay Area' },
    { '@type': 'Place', name: business.neighborhood },
  ],
  offers: {
    '@type': 'Offer',
    name: 'Photo Services quote request',
    availability: 'https://schema.org/InStock',
    url: `${siteUrl}/photo-services/`,
    description:
      'Contact VibeShack to scope photo services based on shot list, crew, deliverables, usage, timeline, and post-production needs.',
  },
}

const breadcrumbs = breadcrumbSchema([
  { name: 'VibeShack Studios', url: absoluteUrl('/') },
  { name: 'Services', url: absoluteUrl('/services/') },
  { name: 'Photo Services', url: absoluteUrl('/photo-services/') },
])

export default function PhotoServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(photoServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <PhotoServicesHero />

      <section className="py-24 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-16">
            <div>
              <span className="number-label mb-6 block">Production logic</span>
              <h2 className="text-white font-black leading-tight mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: 0 }}>
                A stronger shoot starts before the camera comes out.
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                The goal is not a folder of random selects. The goal is a useful image set that works across the places it has to live: website, press, social, ads, decks, and profiles.
              </p>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {process.map(([title, body]) => (
                <div key={title} className="grid grid-cols-1 md:grid-cols-[0.3fr_0.7fr] gap-4 md:gap-12 py-7">
                  <p className="text-white font-semibold">{title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-16 items-start">
            <div>
              <span className="number-label mb-6 block">FAQ</span>
              <h2 className="text-white font-black leading-tight mb-8" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: 0 }}>
                Before you book.
              </h2>
              <Link href="/contact/?service=photo-services" className="inline-flex rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
                Plan your shoot
              </Link>
            </div>

            <div className="divide-y divide-white/10 border-y border-white/10">
              {faqs.map(({ question, answer }) => (
                <div key={question} className="grid grid-cols-1 md:grid-cols-[0.42fr_0.58fr] gap-4 md:gap-12 py-7">
                  <p className="text-white font-semibold">{question}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
