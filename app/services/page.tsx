import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { absoluteUrl } from '@/lib/seo/site'
import { breadcrumbSchema } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'Production Services San Francisco',
  description:
    "Choose the right VibeShack service for podcasts, commercials, editorials, branding, portfolio proof, and studio rentals in San Francisco.",
  alternates: { canonical: 'https://www.vibeshackstudios.com/services/' },
  openGraph: {
    title: 'Production Services San Francisco | VibeShack Studios',
    description:
      'Choose the right VibeShack path: podcasts, commercials, editorials, branding, portfolio proof, and studio rentals.',
    url: 'https://www.vibeshackstudios.com/services/',
    images: ['/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg'],
  },
}

const services = [
  {
    href: '/podcast-studio-san-francisco/',
    title: 'Podcasts',
    eyebrow: 'Rooms, cameras, crew',
    image: '/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg',
    alt: 'Podcast production at VibeShack Studios San Francisco',
    body:
      'For video podcasts, interview series, internal shows, creator episodes, and branded conversations that need clean sound, cameras, lighting, and a repeatable setup.',
    price: '$300-$400/hr',
    fit: 'Direct booking',
  },
  {
    href: '/commercials/',
    title: 'Commercials',
    eyebrow: 'Launches, ads, product',
    image: '/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg',
    alt: 'Production crew setting lights inside VibeShack Studios San Francisco',
    body:
      'For product launches, talking-head ads, founder videos, product demos, social ad batches, testimonials, and campaign video work.',
    price: 'Contact us',
    fit: 'Custom quote',
  },
  {
    href: '/editorials/',
    title: 'Editorials',
    eyebrow: 'Fashion, beauty, portraits',
    image: '/studio-images/photo-gallery-direct-beauty-portrait-v20260520.jpg',
    alt: 'Editorial portrait photographed at VibeShack Studios San Francisco',
    body:
      'For fashion, beauty, cover art, lookbooks, founder portraits, campaign stills, and content-day photography with a stronger point of view.',
    price: 'Contact us',
    fit: 'Custom quote',
  },
  {
    href: '/branding/',
    title: 'Branding',
    eyebrow: 'Identity, systems, launches',
    image: '/studio-images/photo-gallery-red-blue-sunglasses-v20260520.jpg',
    alt: 'Color-driven brand content at VibeShack Studios San Francisco',
    body:
      'For creative direction, visual identity, launch creative, content systems, pitch decks, campaign direction, and founder brand systems.',
    price: 'Contact us',
    fit: 'Custom quote',
  },
  {
    href: '/rental-studios/',
    title: 'Rentals',
    eyebrow: 'White cyc, green screen, photo rooms',
    image: '/studio-images/inside-canvas-cyc-v20260509.jpg',
    alt: 'White cyc rental studio at VibeShack Studios San Francisco',
    body:
      'For crews who already have the photographer, operator, producer, shot list, and gear plan, and need the room, lighting, staging, and 24/7 access.',
    price: 'From $100/hr',
    fit: 'Direct booking',
  },
  {
    href: '/our-work/',
    title: 'Our Work',
    eyebrow: 'Portfolio, proof, taste',
    image: '/studio-images/canvas-rental-music-v1775095665.jpg',
    alt: 'Portfolio work made at VibeShack Studios San Francisco',
    body:
      'For buyers who need to see the taste first: commercials, music videos, editorials, podcasts, brand content, and production proof.',
    price: 'Portfolio',
    fit: 'Proof path',
  },
]

const breadcrumbs = breadcrumbSchema([
  { name: 'VibeShack Studios', url: absoluteUrl('/') },
  { name: 'Services', url: absoluteUrl('/services/') },
])

const serviceItemList = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'VibeShack Studios production services',
  itemListElement: services.map((service, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Service',
      name: service.title,
      description: service.body,
      url: absoluteUrl(service.href),
      provider: {
        '@type': 'LocalBusiness',
        name: 'VibeShack Studios',
        address: '950 Battery St, San Francisco, CA 94111',
      },
    },
  })),
}

const routes = [
  {
    label: 'Need VibeShack to help make it?',
    body: 'Start with Commercials, Editorials, or Branding when you want help planning the work, choosing the room, and shaping final assets.',
  },
  {
    label: 'Need a polished recording setup?',
    body: 'Start with Podcasts when the format is a filmed conversation with cameras, microphones, lighting, and reliable turnaround.',
  },
  {
    label: 'Already have the crew?',
    body: 'Start with Rentals when your team has the photographer, operator, producer, shot list, and gear plan already handled.',
  },
]

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceItemList) }}
      />

      <section className="relative min-h-[86vh] overflow-hidden bg-black border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src="/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg"
            alt="Blue-lit production set at VibeShack Studios San Francisco"
            fill
            priority
            className="object-cover"
            style={{ objectPosition: 'center center' }}
          />
          <div className="absolute inset-0 hidden lg:block" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.48) 32%, rgba(0,0,0,0.08) 62%, rgba(0,0,0,0.16) 100%)' }} />
          <div className="absolute inset-0 lg:hidden" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.2) 38%, rgba(0,0,0,0.68) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.18) 28%, transparent 58%)' }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-32 pb-10 min-h-[86vh] flex flex-col justify-between">
          <div className="max-w-xl pt-6 lg:pt-10">
            <p className="number-label mb-6">Services</p>
            <h1 className="font-black text-white leading-[0.98] max-w-xl mb-6" style={{ fontSize: 'clamp(2.35rem, 4vw, 4.05rem)', letterSpacing: 0 }}>
              Choose the right path for the shoot.
            </h1>
            <p className="text-gray-200 text-base leading-relaxed max-w-lg">
              Start with what you are making. Some paths book directly, some start with a brief, and the work is always one click away.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap gap-2 lg:max-w-3xl">
            {[
              ['01', 'Custom creative work'],
              ['02', 'Podcast production'],
              ['03', 'Room-only rentals'],
            ].map(([n, label]) => (
              <div key={n} className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-2.5 backdrop-blur-sm">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.18em]">{n}</p>
                <p className="text-white text-sm font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-12 lg:gap-16 items-end mb-12">
            <div>
              <p className="number-label mb-6">Start here</p>
              <h2 className="text-white font-black leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)', letterSpacing: 0 }}>
                Service first. Room second.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
              {routes.map(({ label, body }) => (
                <div key={label} className="bg-black p-6">
                  <p className="text-white font-semibold leading-tight">{label}</p>
                  <p className="text-gray-500 text-sm leading-relaxed mt-4">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {services.map(({ href, title, eyebrow, image, alt, body, price, fit }) => (
              <Link key={href} href={href} className="group flex min-h-[520px] flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950 hover:border-white/25 transition-colors">
                <div className="relative h-64 overflow-hidden">
                  <Image src={image} alt={alt} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]" sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72), transparent 58%)' }} />
                  <p className="absolute left-5 bottom-5 text-white text-[10px] font-bold uppercase tracking-[0.2em]">{fit}</p>
                </div>
                <div className="p-7 flex flex-1 flex-col justify-between">
                  <div>
                    <p className="text-gray-500 text-[10px] tracking-[0.22em] uppercase mb-4">{eyebrow}</p>
                    <h2 className="text-white font-black text-3xl leading-none mb-5" style={{ letterSpacing: 0 }}>{title}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-5 mt-8">
                    <span className="text-white text-sm font-semibold">{price}</span>
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-red transition-colors group-hover:text-white">Explore <span aria-hidden>→</span></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-zinc-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-16">
            <div>
              <p className="number-label mb-6">How to choose</p>
              <h2 className="text-white font-black leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)', letterSpacing: 0 }}>
                Start with what you need to leave with.
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed max-w-md mt-6">
                A commercial, an editorial shoot, a podcast episode, and a room rental are different jobs. Pick by the asset you need to leave with.
              </p>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {[
                ['You need a finished ad or launch video.', 'Choose Commercials when the deliverable is a product launch, talking-head ad, founder video, demo, testimonial, or social campaign.'],
                ['You need campaign images.', 'Choose Editorials when the deliverable is fashion, beauty, portraits, cover art, lookbooks, press images, or campaign stills.'],
                ['You need the brand system.', 'Choose Branding when the deliverable is creative direction, visual identity, launch assets, decks, or a repeatable content system.'],
                ['You need a filmed conversation.', 'Choose Podcasts when the format depends on microphones, cameras, lighting, crew, and repeatable episode setup.'],
                ['You already have the creative team.', 'Choose Rentals when your photographer, producer, camera operator, or crew only needs the space.'],
              ].map(([question, answer]) => (
                <div key={question} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 py-7">
                  <p className="text-white font-semibold">{question}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-12 items-center">
            <div>
              <p className="number-label mb-6">Still deciding?</p>
              <h2 className="text-white font-black leading-tight max-w-3xl" style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)', letterSpacing: 0 }}>
                Tell us what you are making and we will point you to the right setup.
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row lg:justify-end gap-3">
              <Link href="/find-your-studio/" className="inline-flex items-center justify-center rounded-lg bg-brand-red px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
                Find a studio
              </Link>
              <Link href="/tour/" className="inline-flex items-center justify-center rounded-lg border border-white/15 px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-white/40">
                Book a tour
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
