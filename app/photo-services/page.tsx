import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { absoluteUrl, business } from '@/lib/seo/site'
import PhotoServicesHero from './PhotoServicesHero'
import { breadcrumbSchema, faqSchema } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'Photo Services SF',
  description:
    'Photo services in San Francisco for product photography, headshots, food, portraits, weddings and events, campaigns, lookbooks, press photos, and content days.',
  alternates: {
    canonical: 'https://www.vibeshackstudios.com/photo-services/',
  },
  openGraph: {
    title: 'Photo Services San Francisco | VibeShack Studios',
    description:
      'Book a produced photoshoot for product photography, headshots, food, portraits, weddings and events, campaigns, press photos, and content days.',
    url: 'https://www.vibeshackstudios.com/photo-services/',
    images: ['/studio-images/enhanced-photography-cyc-fashion-black-curtain-v20260716.jpg'],
  },
}

const process = [
  ['Brief', 'We define the audience, final placements, mood, references, must-have shots, and what would make the shoot feel successful.'],
  ['Plan', 'We match the shoot to the right room, lighting direction, backgrounds, wardrobe rhythm, product needs, and day-of flow.'],
  ['Shoot', 'The session runs around useful deliverables first, then creative variations once the required images are protected.'],
  ['Wrap', 'We review priorities before the day ends so there are no missing headshots, product crops, press images, or campaign frames.'],
]

const scopes = [
  {
    title: 'Headshot block',
    detail: 'For individuals or teams that need polished profile images with consistent lighting and fast, organized pacing.',
  },
  {
    title: 'Portrait session',
    detail: 'For founders, artists, executives, creators, and teams that need a wider set of brand images beyond one profile photo.',
  },
  {
    title: 'Product shoot',
    detail: 'For brands that need clean product details, ecommerce crops, launch images, ad creative, and social visuals.',
  },
  {
    title: 'Content day',
    detail: 'For teams that want portraits, product stills, behind-the-scenes images, and content variations from one production day.',
  },
]

const gallery = [
  {
    src: '/studio-images/photo-gallery-white-cyc-glam-portrait-v20260520.jpg',
    alt: 'White cyc glam portrait photographed at VibeShack Studios San Francisco',
    objectPosition: 'center center',
    frameClass: 'aspect-[3/2]',
  },
  {
    src: '/studio-images/photo-gallery-black-white-cap-portrait-v20260520.jpg',
    alt: 'Black and white editorial portrait photographed at VibeShack Studios San Francisco',
    objectPosition: 'center 34%',
    frameClass: 'aspect-[4/5]',
  },
  {
    src: '/studio-images/photo-gallery-editorial-makeup-closeup-v20260520.jpg',
    alt: 'Editorial makeup close-up photographed at VibeShack Studios San Francisco',
    objectPosition: 'center 38%',
    frameClass: 'aspect-[4/5]',
  },
  {
    src: '/studio-images/photo-gallery-red-blue-sunglasses-v20260520.jpg',
    alt: 'Red and blue gel portrait photographed at VibeShack Studios San Francisco',
    objectPosition: 'center center',
    frameClass: 'aspect-[4/5]',
  },
  {
    src: '/studio-images/photo-gallery-pole-form-white-cyc-v20260520.jpg',
    alt: 'White cyc movement portrait photographed at VibeShack Studios San Francisco',
    objectPosition: 'center center',
    frameClass: 'aspect-[4/5]',
  },
  {
    src: '/studio-images/photo-gallery-beauty-jewelry-closeup-v20260520.jpg',
    alt: 'Beauty jewelry close-up photographed at VibeShack Studios San Francisco',
    objectPosition: 'center center',
    frameClass: 'aspect-[5/6]',
  },
  {
    src: '/studio-images/photo-gallery-beauty-expression-closeup-v20260520.jpg',
    alt: 'Beauty portrait close-up photographed at VibeShack Studios San Francisco',
    objectPosition: 'center center',
    frameClass: 'aspect-[5/6]',
  },
  {
    src: '/studio-images/photo-gallery-red-sunglasses-portrait-v20260520.jpg',
    alt: 'Red backdrop sunglasses portrait photographed at VibeShack Studios San Francisco',
    objectPosition: 'center 34%',
    frameClass: 'aspect-[4/5]',
  },
  {
    src: '/studio-images/photo-gallery-direct-beauty-portrait-v20260520.jpg',
    alt: 'Direct beauty portrait photographed at VibeShack Studios San Francisco',
    objectPosition: 'center 34%',
    frameClass: 'aspect-[4/5]',
  },
  {
    src: '/studio-images/photo-gallery-side-beauty-black-bg-v20260520.jpg',
    alt: 'Side-profile beauty portrait photographed at VibeShack Studios San Francisco',
    objectPosition: 'center 42%',
    frameClass: 'aspect-[4/5]',
  },
  {
    src: '/studio-images/photo-gallery-black-red-afro-portrait-v20260520.jpg',
    alt: 'Black and red studio portrait photographed at VibeShack Studios San Francisco',
    objectPosition: 'center 38%',
    frameClass: 'aspect-[5/6]',
  },
  {
    src: '/studio-images/photo-gallery-mens-shadow-portrait-v20260520.jpg',
    alt: "Men's shadow portrait photographed at VibeShack Studios San Francisco",
    objectPosition: 'center 40%',
    frameClass: 'aspect-[5/6]',
  },
  {
    src: '/studio-images/photo-gallery-pink-studio-portrait-v20260520.jpg',
    alt: 'Pink studio portrait photographed at VibeShack Studios San Francisco',
    objectPosition: 'center 34%',
    frameClass: 'aspect-[4/5]',
  },
  {
    src: '/studio-images/photo-gallery-gesture-portrait-v20260520.jpg',
    alt: 'Gesture portrait photographed at VibeShack Studios San Francisco',
    objectPosition: 'center 38%',
    frameClass: 'aspect-[3/4]',
  },
  {
    src: '/studio-images/photo-gallery-black-white-sunglasses-v20260520.jpg',
    alt: 'Black and white sunglasses portrait photographed at VibeShack Studios San Francisco',
    objectPosition: 'center 38%',
    frameClass: 'aspect-[4/5]',
  },
]

const faqs = [
  {
    question: 'Is this the same as renting the photography studio?',
    answer:
      'No. Photo services means VibeShack plans and produces the shoot: product photography, headshots and portraits, food and beverage, editorials and lookbooks, wedding and event content, and full content days. If you already have a photographer and only need the room, book the Photography Studio under rentals instead.',
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
      'Photo services are quoted after the brief, shot list, crew needs, number of people or products, usage, timeline, and post-production expectations are clear. Room-only photography studio rental is separate and starts at $100 per hour.',
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
  '@id': 'https://www.vibeshackstudios.com/photo-services/#service',
  name: 'Photo Services in San Francisco',
  serviceType: 'Photography Services',
  description:
    'Photoshoot services in San Francisco for product photography, food photography, headshots, portraits, weddings and events, brand campaigns, lookbooks, press photos, and content days.',
  url: 'https://www.vibeshackstudios.com/photo-services/',
  image: 'https://www.vibeshackstudios.com/studio-images/enhanced-photography-cyc-fashion-black-curtain-v20260716.jpg',
  provider: {
    '@id': 'https://www.vibeshackstudios.com/#business',
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
    url: 'https://www.vibeshackstudios.com/photo-services/',
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

      <section className="py-20 sm:py-28 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="mb-8 flex items-center justify-between gap-6">
            <span className="number-label">Portrait gallery</span>
            <Link href="/our-work/" className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 transition-colors hover:text-white">
              Explore the work
            </Link>
          </div>

          <div className="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4" aria-label="Portrait gallery">
            {gallery.map(({ src, alt, objectPosition, frameClass }) => (
              <figure key={src} className="mb-3 break-inside-avoid overflow-hidden rounded-lg bg-black ring-1 ring-white/5">
                <div className={`relative w-full ${frameClass}`}>
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover transition-transform duration-700 ease-out hover:scale-[1.035]"
                    style={{ objectPosition }}
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-16">
            <div>
              <span className="number-label mb-6 block">Production logic</span>
              <h2 className="text-white font-black leading-tight mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em' }}>
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

      <section className="py-24 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
            <div>
              <span className="number-label mb-6 block">Common requests</span>
              <h2 className="text-white font-black leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em' }}>
                Choose a scope that matches the real deliverable.
              </h2>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md">
              We scope the final plan around people, products, usage, timeline, and post-production needs. Food, event, and fashion briefs run through the same process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {scopes.map(({ title, detail }) => (
              <div key={title} className="border border-white/10 rounded-lg bg-black p-6">
                <h3 className="text-white font-black text-2xl leading-none mb-5" style={{ letterSpacing: '-0.03em' }}>{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
            Every scope is quoted after the brief.
          </p>
        </div>
      </section>

      <section className="py-24 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-16 items-start">
            <div>
              <span className="number-label mb-6 block">FAQ</span>
              <h2 className="text-white font-black leading-tight mb-8" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em' }}>
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
