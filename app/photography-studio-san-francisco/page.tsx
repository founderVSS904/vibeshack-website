import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { absoluteUrl } from '@/lib/seo/site'
import { breadcrumbSchema, faqSchema, studioServiceSchema } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'Photography Studio Rental SF',
  description:
    'Photography studio rental in San Francisco for photographers, creators, and crews bringing their own camera team. Lighting, backdrops, makeup room, from $100/hr.',
  alternates: {
    canonical: 'https://www.vibeshackstudios.com/photography-studio-san-francisco/',
  },
  openGraph: {
    title: 'Photography Studio Rental San Francisco | VibeShack Studios',
    description:
      'Book a room-only photography studio rental in San Francisco with lighting, backdrops, makeup room, and white cyc access. From $100/hr.',
    url: 'https://www.vibeshackstudios.com/photography-studio-san-francisco/',
    images: ['/studio-images/photography-hero-service-v20260509.jpg'],
  },
}

const serviceTabs = [
  { href: '/photo-services/', label: 'Photo Services', active: false },
  { href: '/video-production/', label: 'Video Production', active: false },
  { href: '/podcast-studio-san-francisco/', label: 'Podcast', active: false },
  { href: '/green-screen-studio-sf/', label: 'Green Screen', active: false },
  { href: '/canvas-rental/', label: 'White Cyc', active: false },
  { href: '/photography-studio-san-francisco/', label: 'Studio Rental', active: true },
]

const shootTypes = [
  {
    title: 'Brand and founder portraits',
    pressure: 'You need the person to look credible, sharp, and current without making the shoot feel corporate-flat.',
    roomAdvantage: 'Use controlled lighting, simple backgrounds, and enough room for wardrobe, grooming, and multiple crop ratios.',
  },
  {
    title: 'Product and e-commerce',
    pressure: 'Small products reveal messy light fast. Reflections, shadows, and color consistency matter more than people expect.',
    roomAdvantage: 'The studio gives you repeatable light, clean surfaces, staging space, and white background options.',
  },
  {
    title: 'Lookbooks and fashion tests',
    pressure: 'You need speed: outfits, movement, verticals, horizontals, detail shots, and clean selects in one booking.',
    roomAdvantage: 'The makeup room, clothing rack, steamer, backdrops, and open shooting zone keep the day moving.',
  },
  {
    title: 'Press kits and music campaigns',
    pressure: 'The images have to hold up as a profile photo, event poster, Spotify canvas, article hero, and social crop.',
    roomAdvantage: 'Shoot tight portraits, full body frames, negative-space crops, and moodier lighting setups in one place.',
  },
]

const planningNotes = [
  ['Final placements', 'Know whether the hero image needs website-wide, square, vertical story, YouTube thumbnail, press headshot, or ad crop versions.'],
  ['Background strategy', 'Pick one clean background, one texture or color look, and one close portrait setup instead of improvising every frame.'],
  ['Wardrobe rhythm', 'Bring fewer outfits than you think, but make each one meaningfully different in color, silhouette, and use case.'],
  ['Shot-list discipline', 'Plan required shots first, then leave time for creative variations. This prevents a beautiful shoot with missing deliverables.'],
]

const included = [
  'Photography room with controlled lighting',
  'White cyc and clean backdrop access',
  'Hair and makeup room with vanity lighting',
  'Colored backdrop options',
  'Clothing rack, steamer, and changing area',
  'Equipment staging space',
  'High-speed WiFi for uploads and tethering',
  '24/7 booking subject to availability',
]

const gallery = [
  {
    src: '/studio-images/photography-hero-service-v20260509.jpg',
    alt: 'Fashion campaign still on a warm gradient set at VibeShack Studios San Francisco',
    label: 'Campaign Movement',
  },
  {
    src: '/studio-images/photography-spotlight-portrait-v20260509.jpg',
    alt: 'Dramatic spotlight portrait photographed at VibeShack Studios San Francisco',
    label: 'Spotlight Portrait',
  },
  {
    src: '/studio-images/photography-cyc-editorial-v20260509.jpg',
    alt: 'Black and white editorial movement image photographed on cyc at VibeShack Studios San Francisco',
    label: 'Editorial Cyc',
  },
  {
    src: '/studio-images/photography-vibeshack-cover-v20260509.jpg',
    alt: 'Magazine-style portrait photographed at VibeShack Studios San Francisco',
    label: 'Press Cover',
  },
]

const photographyFaqs = [
  {
    question: 'How much is the photography studio?',
    answer: 'The Photography Studio starts at $100 per hour for room rental. If you want VibeShack to help produce the actual photoshoot, use the Photo Services page instead so we can scope the shoot correctly.',
  },
  {
    question: 'What is included with the photography studio?',
    answer: 'The studio includes controlled lighting, backdrop options, white cyc access, hair and makeup room, clothing rack, steamer, changing area, WiFi, and staging space.',
  },
  {
    question: 'Can I book for headshots, products, fashion, or brand campaigns?',
    answer: 'Yes. The room works for headshots, founder portraits, e-commerce, product photos, fashion tests, lookbooks, press photos, album art, and campaign stills.',
  },
  {
    question: 'Do I need to bring my own photographer?',
    answer: 'Yes for room-only rental. This page is for clients bringing their own photographer, camera, and production plan. If you want VibeShack to help create the images, start with Photo Services.',
  },
  {
    question: 'Is the photography studio available 24/7?',
    answer: 'Yes. VibeShack is open 24/7 in San Francisco, subject to live calendar availability.',
  },
]

const photographyServiceSchema = studioServiceSchema({
  name: 'Photography Studio Rental in San Francisco',
  description:
    'Room-only photography studio rental in San Francisco for photographers, creators, and crews shooting headshots, products, portraits, fashion, lookbooks, press photos, and campaign stills with lighting, backdrops, white cyc access, and makeup room.',
  url: 'https://www.vibeshackstudios.com/photography-studio-san-francisco/',
  image: 'https://www.vibeshackstudios.com/studio-images/photography-hero-service-v20260509.jpg',
  price: '100',
  serviceType: 'Photography Studio Rental',
})

const breadcrumbs = breadcrumbSchema([
  { name: 'VibeShack Studios', url: absoluteUrl('/') },
  { name: 'Rental Studios', url: absoluteUrl('/rental-studios/') },
  { name: 'Photography Studio Rental San Francisco', url: absoluteUrl('/photography-studio-san-francisco/') },
])

export default function PhotographyStudioPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(photographyFaqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(photographyServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <section className="relative min-h-screen flex items-end overflow-hidden bg-black">
        <div className="absolute inset-0">
          <Image
            src="/studio-images/photography-hero-service-v20260509.jpg"
            fill sizes="100vw"
            className="object-cover"
            alt="Fashion campaign photography created at VibeShack Studios San Francisco"
            style={{ objectPosition: 'center right' }}
            priority
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(100deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.72) 36%, rgba(0,0,0,0.18) 72%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.25) 42%, transparent 80%)' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-12 pt-32 w-full">
          <div className="max-w-3xl">
            <p className="mb-6 text-sm font-semibold text-white/70">Photography Studio Rental San Francisco</p>
            <h1 className="font-black uppercase leading-[0.88] text-white mb-8" style={{ fontSize: 'clamp(4.1rem, 9vw, 8.8rem)', letterSpacing: 0 }}>
              Rent the room.<br />
              <span className="text-brand-red">Bring your photographer.</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mb-10">
              A San Francisco photography studio rental for photographers, creators, agencies, and in-house teams who already have the shoot plan and need controlled light, backdrops, makeup space, staging room, and a clean production environment.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Link href="/book/?studio=photography" className="inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
                Book Studio Rental
              </Link>
              <Link href="/photo-services/" className="text-gray-400 hover:text-white text-sm font-semibold transition-colors">
                Need VibeShack to shoot it?
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black border-t border-white/5 sticky top-20 z-30">
        <div className="scrollbar-hide max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max pr-6" role="list" aria-label="Service pages">
            {serviceTabs.map(({ href, label, active }) => (
              <Link
                key={href}
                href={href}
                role="listitem"
                className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
                  active
                    ? 'border-brand-red bg-brand-red text-white'
                    : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-16 items-start">
            <div>
              <span className="number-label mb-6 block">The point</span>
              <h2 className="text-white font-black leading-tight mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: 0 }}>
                Backdrops, white cyc, and makeup space in one studio.
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                Strong photo sessions are planned around the final use: website hero, press bio, product page, ad creative, cover art, social crop, or sales deck. The studio gives you the control to shoot those variations without changing locations.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['$100/hr', 'Direct studio rental'],
                  ['24/7', 'Live availability'],
                  ['1 address', 'Studio, makeup, staging'],
                ].map(([value, label]) => (
                  <div key={value} className="border border-white/10 rounded-lg p-5 bg-zinc-950">
                    <p className="text-white font-black text-2xl leading-none mb-2" style={{ letterSpacing: 0 }}>{value}</p>
                    <p className="text-gray-600 text-xs leading-relaxed">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative h-[520px] rounded-lg overflow-hidden">
                <Image src="/studio-images/photography-room-red-backdrop-v20260509.jpg" alt="Photography room with red backdrop at VibeShack Studios San Francisco" fill sizes="100vw" className="object-cover" />
              </div>
              <div className="space-y-3">
                <div className="relative h-[254px] rounded-lg overflow-hidden">
                  <Image src="/studio-images/photography-cyc-editorial-v20260509.jpg" alt="Editorial photography created on a white cyc at VibeShack Studios San Francisco" fill sizes="100vw" className="object-cover" />
                </div>
                <div className="relative h-[254px] rounded-lg overflow-hidden">
                  <Image src="/studio-images/drive-video-studio.jpg" alt="Hair and makeup room at VibeShack Studios San Francisco" fill sizes="100vw" className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
            <div>
              <span className="number-label mb-6 block">What to shoot here</span>
              <h2 className="text-white font-black leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: 0 }}>
                A practical studio for the full shot list.
              </h2>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md">
              A good studio should feel practical before you book: clear backgrounds, controllable light, room to stage, and enough flexibility to protect the final images.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {shootTypes.map(({ title, pressure, roomAdvantage }) => (
              <div key={title} className="rounded-lg border border-white/10 bg-black p-7">
                <h3 className="text-white font-black text-2xl mb-5 leading-none" style={{ letterSpacing: 0 }}>{title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-white/10 pt-5">
                  <div>
                    <p className="text-gray-600 text-[10px] tracking-[0.22em] uppercase mb-3">What matters</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{pressure}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-[10px] tracking-[0.22em] uppercase mb-3">Room advantage</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{roomAdvantage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-16">
            <div>
              <span className="number-label mb-6 block">Plan the session</span>
              <h2 className="text-white font-black leading-tight mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: 0 }}>
                The shoot gets better before anyone arrives.
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                Use this checklist before you book. It keeps the session focused and makes the final gallery more useful.
              </p>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {planningNotes.map(([title, body]) => (
                <div key={title} className="grid grid-cols-1 md:grid-cols-[0.35fr_0.65fr] gap-4 md:gap-12 py-7">
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
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="number-label mb-6 block">Shot here</span>
              <h2 className="text-white font-black leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: 0 }}>
                Real photo work, not placeholder polish.
              </h2>
            </div>
            <Link href="/our-work/" className="hidden md:block text-gray-600 hover:text-white text-sm transition-colors">More work made here</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {gallery.map(({ src, alt, label }, index) => (
              <div key={src} className={`relative overflow-hidden rounded-lg ${index === 0 ? 'md:col-span-2 md:row-span-2 h-[520px]' : 'h-[254px]'}`}>
                <Image src={src} alt={alt} fill className="object-cover" sizes={index === 0 ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, 100vw'} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 48%)' }} />
                <p className="absolute bottom-4 left-4 text-white text-sm font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-16">
            <div>
              <span className="number-label mb-6 block">Included</span>
              <h2 className="text-white font-black leading-tight mb-8" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: 0 }}>
                The boring details that save the shoot.
              </h2>
              <Link href="/book/?studio=photography" className="inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
                Book Studio Rental
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-white/10 rounded-lg overflow-hidden">
              {included.map((item) => (
                <div key={item} className="p-5 border-b sm:odd:border-r border-white/10">
                  <p className="text-gray-300 text-sm font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-16 items-start">
            <div>
              <span className="number-label mb-6 block">Pricing</span>
              <div className="font-black text-brand-red leading-none mb-3" style={{ fontSize: 'clamp(5rem, 14vw, 10rem)', letterSpacing: 0 }}>
                $100
              </div>
              <p className="text-white font-semibold mb-2">per hour for studio rental</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Direct booking rate. Bring your photographer and crew, or contact us first if you need production support.
              </p>
            </div>

            <div className="divide-y divide-white/10 border-y border-white/10">
              {photographyFaqs.map(({ question, answer }) => (
                <div key={question} className="grid grid-cols-1 md:grid-cols-[0.42fr_0.58fr] gap-4 md:gap-12 py-7">
                  <p className="text-white font-semibold">{question}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <p className="number-label mb-8">Ready</p>
          <h2 className="font-black text-white leading-none mb-6" style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', letterSpacing: 0 }}>
            Book the room that makes the photo look intentional.
          </h2>
          <p className="text-gray-500 text-lg mb-10">
            Room-only photography studio rental in San Francisco from $100/hr. Open 24/7 at 950 Battery St, San Francisco, CA 94111.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/book/?studio=photography" className="inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
              Book Studio Rental
            </Link>
            <Link href="/services/" className="text-gray-500 hover:text-white transition-colors text-sm self-center">
              Compare all services
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
