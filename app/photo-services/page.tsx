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
    images: ['/studio-images/enhanced-photography-cyc-fashion-black-curtain-v20260510.jpg'],
  },
}

const shootTypes = [
  {
    eyebrow: '01 / Headshots',
    title: 'Headshots and team portraits',
    image: '/studio-images/enhanced-photography-headshot-black-blazer-v20260510.jpg',
    alt: 'Professional headshot photographed at VibeShack Studios San Francisco',
    objectPosition: 'center 38%',
    clientNeed:
      'A clean, current image system for LinkedIn, website bios, investor decks, press kits, recruiting pages, and internal profiles.',
    howWeThink:
      'We plan lighting, background, crop ratios, and pacing so every person looks consistent without the session feeling stiff.',
  },
  {
    eyebrow: '02 / Portraits',
    title: 'Founder and brand portraits',
    image: '/studio-images/enhanced-photography-editorial-male-portrait-v20260510.jpg',
    alt: 'Editorial brand portrait photographed at VibeShack Studios San Francisco',
    objectPosition: 'center 34%',
    clientNeed:
      'Images that make the person behind the brand feel credible, sharp, and human across the website, press, and social channels.',
    howWeThink:
      'We build a small visual range: approachable, authoritative, editorial, and negative-space frames for headlines and overlays.',
  },
  {
    eyebrow: '03 / Campaigns',
    title: 'Product and campaign photos',
    image: '/studio-images/enhanced-photography-cyc-fashion-black-curtain-v20260510.jpg',
    alt: 'Campaign photography on the white cyc at VibeShack Studios San Francisco',
    objectPosition: '42% center',
    clientNeed:
      'Controlled stills for launches, ecommerce, ads, landing pages, thumbnails, sales collateral, and social content.',
    howWeThink:
      'We start with where the images will live, then choose surface, light direction, background, and crop needs before shoot day.',
  },
  {
    eyebrow: '04 / Editorial',
    title: 'Lookbooks and editorial sessions',
    image: '/studio-images/photography-spotlight-portrait-v20260509.jpg',
    alt: 'Creative editorial portrait photographed at VibeShack Studios San Francisco',
    objectPosition: 'center 42%',
    clientNeed:
      'A more produced photo day with wardrobe changes, movement, color, texture, full-body frames, tight portraits, and social crops.',
    howWeThink:
      'We protect the schedule around outfits, set changes, makeup, selects, and the hero images that have to carry the campaign.',
  },
]

const process = [
  ['Brief', 'We define the audience, final placements, mood, references, must-have shots, and what would make the shoot feel successful.'],
  ['Plan', 'We match the shoot to the right room, lighting direction, backgrounds, wardrobe rhythm, product needs, and day-of flow.'],
  ['Shoot', 'The session runs around useful deliverables first, then creative variations once the required images are protected.'],
  ['Wrap', 'We review priorities before the day ends so there are no missing headshots, product crops, press images, or campaign frames.'],
]

const scopes = [
  {
    title: 'Headshot block',
    price: 'Contact us',
    detail: 'For individuals or teams that need polished profile images with consistent lighting and fast, organized pacing.',
  },
  {
    title: 'Portrait session',
    price: 'Contact us',
    detail: 'For founders, artists, executives, creators, and teams that need a wider set of brand images beyond one profile photo.',
  },
  {
    title: 'Product shoot',
    price: 'Contact us',
    detail: 'For brands that need clean product details, ecommerce crops, launch images, ad creative, and social visuals.',
  },
  {
    title: 'Campaign day',
    price: 'Contact us',
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
    src: '/studio-images/photo-gallery-pink-profile-v20260520.jpg',
    alt: 'Pink profile portrait photographed at VibeShack Studios San Francisco',
    objectPosition: 'center center',
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
      'No. Photo services means VibeShack helps scope a photoshoot such as headshots, portraits, product photos, lookbooks, campaign stills, or press images. Photography studio rental is the room-only option for clients bringing their own photographer and crew.',
  },
  {
    question: 'Can I still bring my own photographer?',
    answer:
      'Yes. If you already have a photographer, book the Photography Studio under rentals. If you want VibeShack to help plan or produce the shoot, use this photo services page to start a request.',
  },
  {
    question: 'Do you shoot headshots and portraits?',
    answer:
      'Yes. Headshots, team portraits, founder portraits, artist portraits, press photos, and brand profile images are all strong fits for the studio.',
  },
  {
    question: 'How is pricing handled?',
    answer:
      'Photo services are quoted after the brief, shot list, crew needs, number of people or products, usage, timeline, and post-production expectations are clear. Room-only photography studio rental is separate and starts at $100 per hour.',
  },
  {
    question: 'Can you shoot products and portraits in one session?',
    answer:
      'Often, yes. The cleanest way is to define the required deliverables first so the day can move through headshots, portraits, product details, and campaign images without missing priority shots.',
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
  image: 'https://www.vibeshackstudios.com/studio-images/enhanced-photography-cyc-fashion-black-curtain-v20260510.jpg',
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

      <section className="py-28 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="max-w-3xl mb-20">
            <span className="number-label mb-6 block">Photo service types</span>
            <h2 className="text-white font-black leading-[0.98] mb-6" style={{ fontSize: 'clamp(2.45rem, 5vw, 5.4rem)', letterSpacing: 0 }}>
              Choose the image system first.
            </h2>
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-2xl">
              This page is for planned photoshoots: photographer, lighting direction, shot list, and a finished set of images. If you already have a crew and only need the room, use studio rental.
            </p>
          </div>

          <div className="space-y-24">
            {shootTypes.map(({ eyebrow, title, image, alt, objectPosition, clientNeed, howWeThink }, index) => (
              <article key={title} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
                <div className={`relative overflow-hidden rounded-lg bg-zinc-950 h-[72vh] min-h-[520px] max-h-[760px] lg:col-span-7 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <Image
                    src={image}
                    alt={alt}
                    fill
                    className="object-cover"
                    style={{ objectPosition }}
                    sizes="(min-width: 1024px) 58vw, 100vw"
                  />
                </div>
                <div className="lg:col-span-5">
                  <p className="number-label mb-7">{eyebrow}</p>
                  <h3 className="text-white font-black leading-[0.98] mb-7" style={{ fontSize: 'clamp(2.25rem, 4.8vw, 4.8rem)', letterSpacing: 0 }}>
                    {title}
                  </h3>
                  <div className="border-y border-white/10 divide-y divide-white/10">
                    <div className="py-7">
                      <p className="text-gray-600 text-[10px] tracking-[0.22em] uppercase mb-3">Best for</p>
                      <p className="text-gray-300 text-base leading-relaxed">{clientNeed}</p>
                    </div>
                    <div className="py-7">
                      <p className="text-gray-600 text-[10px] tracking-[0.22em] uppercase mb-3">How we shape it</p>
                      <p className="text-gray-400 text-base leading-relaxed">{howWeThink}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="mb-8 flex items-center justify-between gap-6">
            <span className="number-label">Gallery</span>
            <Link href="/our-work/" className="text-gray-600 hover:text-white text-sm font-semibold transition-colors">
              See more work
            </Link>
          </div>

          <div className="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4" aria-label="Photo services gallery">
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
              We scope the final plan around people, products, usage, timeline, and post-production needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {scopes.map(({ title, price, detail }) => (
              <div key={title} className="border border-white/10 rounded-2xl bg-black p-6">
                <p className="mb-5 text-brand-red text-sm font-black uppercase tracking-[0.18em]">{price}</p>
                <h3 className="text-white font-black text-2xl leading-none mb-5" style={{ letterSpacing: '-0.03em' }}>{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-16 items-start">
            <div>
              <span className="number-label mb-6 block">FAQ</span>
              <h2 className="text-white font-black leading-tight mb-8" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em' }}>
                Room rental and photo services are different.
              </h2>
              <Link href="/contact/?service=photo-services" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors">
                Start a photo request
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
