import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { comparisons } from '@/lib/seo/comparisons'
import { DynamicFrameHero } from '@/components/DynamicFrameHero'
import { InsideStudiosCarousel } from '@/components/InsideStudiosCarousel'
import { moneyPages } from '@/lib/seo/site'
import { studioGuides } from '@/lib/seo/studioGuides'
import { useCases } from '@/lib/seo/useCases'

export const metadata: Metadata = {
  title: 'Duplicate Homepage | VibeShack Studios',
  description: 'Temporary duplicate of the previous VibeShack Studios homepage layout.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/duplicate/' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Duplicate Homepage | VibeShack Studios',
    description: 'Temporary duplicate of the previous VibeShack Studios homepage layout.',
    url: 'https://www.vibeshackstudios.com/duplicate/',
  },
}

const serviceHighlights = [
  {
    href: '/podcast-studio-san-francisco/',
    label: 'Podcasts',
    kicker: 'Rooms, cameras, crew',
    description: 'Book podcast sets built for filmed conversations, interviews, branded shows, creators, and repeatable episode production.',
    price: '$300-$400/hr',
    image: '/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg',
    alt: 'Two-host podcast production setup at VibeShack Studios San Francisco',
  },
  {
    href: '/commercials/',
    label: 'Commercials',
    kicker: 'Launches, ads, product',
    description: 'Custom video production for product launches, talking-head ads, founder videos, demos, paid social, and campaign spots.',
    price: 'Contact us',
    image: '/studio-images/enhanced-vibeshack-bts-cyc-lighting-v20260510.jpg',
    alt: 'Behind the scenes lighting setup for a VibeShack Studios production in San Francisco',
  },
  {
    href: '/editorials/',
    label: 'Editorials',
    kicker: 'Fashion, beauty, portraits',
    description: 'Produced editorial shoots for beauty, fashion, cover art, lookbooks, brand portraits, campaign stills, and content days.',
    price: 'Contact us',
    image: '/studio-images/photo-gallery-direct-beauty-portrait-v20260520.jpg',
    alt: 'Editorial beauty portrait photographed at VibeShack Studios San Francisco',
  },
  {
    href: '/branding/',
    label: 'Branding',
    kicker: 'Identity, systems, launches',
    description: 'Creative direction and brand systems for founders, campaigns, decks, launch assets, social content, and visual identity.',
    price: 'Contact us',
    image: '/studio-images/photo-gallery-red-blue-sunglasses-v20260520.jpg',
    alt: 'Color-driven brand content created at VibeShack Studios San Francisco',
  },
  {
    href: '/rental-studios/',
    label: 'Rentals',
    kicker: 'White cyc, green screen, creative rooms',
    description: 'Bring your crew and use the building like a production base: lighting, staging, backdrops, makeup, and multiple looks.',
    price: 'From $100/hr',
    image: '/studio-images/inside-canvas-cyc-v20260509.jpg',
    alt: 'White cyc rental studio at VibeShack Studios San Francisco',
  },
  {
    href: '/our-work/',
    label: 'Our Work',
    kicker: 'Portfolio, proof, taste',
    description: 'See the work made here, including commercials, music videos, editorials, podcasts, branding, and studio production.',
    price: 'Explore',
    image: '/studio-images/canvas-rental-music-v1775095665.jpg',
    alt: 'Portfolio work made inside VibeShack Studios San Francisco',
  },
]

export default function HomePage() {
  return (
    <>
      <DynamicFrameHero />

      {/* ═══ STUDIO GRID ═══ */}
      <section className="bg-black pb-3 pt-10 sm:py-4">
        <div className="max-w-7xl mx-auto px-3">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { src: '/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg', label: 'The Executive', href: '/the-executive/', alt: 'The Executive — Podcast table setup in use — VibeShack Studios SF' },
              { src: '/studio-images/sunset-hero-v20260509.jpg', label: 'Sunset', href: '/sunset-studio/', alt: 'Sunset — Warm programmable podcast set in use — VibeShack Studios SF' },
              { src: '/studio-images/enhanced-encore-podcast-wide-v20260510.jpg',        label: 'Encore',         href: '/encore/', alt: 'Encore — Modern podcast studio with professional lighting — VibeShack Studios SF' },
              { src: '/studio-images/enhanced-the-wing-podcast-guest-closeup-v20260510.jpg',      label: 'The Wing',       href: '/the-wing/', alt: 'The Wing — Cozy podcast studio in Walnut Series — VibeShack Studios SF' },
              { src: '/studio-images/inside-green-screen-v20260509.jpg', label: 'Green Screen', href: '/green-screen-studio-sf/', alt: 'Green screen production stage — VibeShack Studios SF' },
              { src: '/studio-images/inside-photography-red-v20260509.jpg', label: 'Photography Studio', href: '/photography-studio-san-francisco/', alt: 'Photography studio rental room with red backdrop — VibeShack Studios SF' },
              { src: '/studio-images/parlor-production-v20260509.jpg', label: 'Parlor', href: '/parlor/', alt: 'Parlor — Premium interview session with Chesterfield seating — VibeShack Studios SF' },
              { src: '/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg', label: 'Horizon', href: '/horizon/', alt: 'Horizon — Immersive creative podcast space in use — VibeShack Studios SF' },
              { src: '/studio-images/enhanced-canvas-podcast-white-cyc-duo-v20260510.jpg', label: 'Canvas Rental', href: '/canvas-rental/', alt: 'Canvas Rental — White cyc podcast setup in use — VibeShack Studios SF' },
            ].map(({ src, label, href, alt }) => (
              <div key={label} className="studio-grid-card card-lift">
                <a href={href} className="homepage-studio-link relative overflow-hidden rounded-xl group block" style={{height: '160px'}}>
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    className="homepage-studio-thumb-img object-cover"
                    sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
                    quality={55}
                    fetchPriority="low"
                  />
                  <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-60" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)'}} />
                  <p className="absolute bottom-3 left-3 text-white text-xs font-semibold tracking-wide">{label}</p>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services tabs */}
      <section className="py-20 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
            <div>
              <span className="number-label mb-4 block">Services</span>
              <h2 className="text-white font-black leading-tight max-w-2xl" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
                Choose the service before you choose the room.
              </h2>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md">
              Start with what you&apos;re making: podcasts, commercials, editorials, branding, rentals, or proof from the portfolio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {serviceHighlights.map(({ href, label, kicker, description, price, image, alt }) => (
              <Link key={href} href={href} className="group block overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 hover:border-white/25 transition-colors">
                <div className="relative h-64 overflow-hidden">
                  <Image src={image} alt={alt} fill quality={58} fetchPriority="low" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]" sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw" />
                  <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.22) 58%, rgba(0,0,0,0.08) 100%)'}} />
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-gray-300 text-[10px] tracking-[0.22em] uppercase mb-2">{kicker}</p>
                    <h3 className="text-white font-black text-2xl leading-none" style={{letterSpacing: '-0.03em'}}>{label}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{description}</p>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-white text-sm font-semibold">{price}</span>
                    <span className="text-[#f00000] text-sm font-semibold group-hover:text-white transition-colors">Explore {label}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DIFFERENTIATORS ═══ */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="mb-16 max-w-3xl">
            <h2 className="text-white font-black leading-tight mb-5" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
              Production studios in San Francisco for every kind of shoot.
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              VibeShack Studios brings podcast sets, green screen production, photo services, video, and white cyc rental studios together at 950 Battery St in San Francisco's Northern Waterfront.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            {[
              { n: '24/7', label: 'Always Open', sub: 'Every hour. Every day. No exceptions.' },
              { n: '$100', label: 'Rental studios', sub: 'Bring your crew. We provide everything else.' },
              { n: '$300', label: 'Podcast studios', sub: 'Cameraman included on every booking.' },
              { n: '6hr', label: 'Footage turnaround', sub: 'Your footage delivered same day. 6–12hr turnaround.' },
            ].map(({ n, label, sub }) => (
              <div key={label}>
                <div className="py-10 md:py-0 md:px-12 first:md:pl-0 last:md:pr-0">
                  <div className="text-white font-black leading-none mb-2" style={{fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.04em'}}>{n}</div>
                  <div className="text-white text-sm font-semibold mb-1">{label}</div>
                  <div className="text-gray-600 text-xs leading-relaxed">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICE AND PLANNING LINKS ═══ */}
      <section className="py-20 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-16">
            <div>
              <span className="number-label mb-4 block">Choose by need</span>
              <h2 className="text-white font-black leading-tight mb-6" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
                Find the right San Francisco studio faster.
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                Start with what you are making, then choose the right room, service, or planning guide for the session.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
              {moneyPages.map((page) => (
                <a key={page.href} href={page.href} className="group border-t border-white/10 pt-5">
                  <p className="text-white font-bold text-lg group-hover:text-brand-red transition-colors">{page.label}</p>
                  <p className="text-gray-600 text-xs tracking-[0.16em] uppercase mt-2">{page.keyword}</p>
                  <p className="text-gray-500 text-sm leading-relaxed mt-3">{page.description}</p>
                </a>
              ))}
              <Link href="/studio-guides/" className="group border-t border-white/10 pt-5">
                <p className="text-white font-bold text-lg group-hover:text-brand-red transition-colors">Studio Planning Guides</p>
                <p className="text-gray-600 text-xs tracking-[0.16em] uppercase mt-2">prepare for your shoot</p>
                <p className="text-gray-500 text-sm leading-relaxed mt-3">{studioGuides.length} practical guides for planning better podcast, photo, green screen, and white cyc sessions.</p>
              </Link>
              <Link href="/use-cases/" className="group border-t border-white/10 pt-5">
                <p className="text-white font-bold text-lg group-hover:text-brand-red transition-colors">Studio Use Cases</p>
                <p className="text-gray-600 text-xs tracking-[0.16em] uppercase mt-2">book by outcome</p>
                <p className="text-gray-500 text-sm leading-relaxed mt-3">{useCases.length} ways to choose a setup by outcome: interviews, content days, product campaigns, green screen, and social production.</p>
              </Link>
              <Link href="/compare/" className="group border-t border-white/10 pt-5">
                <p className="text-white font-bold text-lg group-hover:text-brand-red transition-colors">Studio Comparisons</p>
                <p className="text-gray-600 text-xs tracking-[0.16em] uppercase mt-2">choose the right setup</p>
                <p className="text-gray-500 text-sm leading-relaxed mt-3">{comparisons.length} decision guides for green screen, white cyc, office recording, studio, and location choices.</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Single quote — early trust signal */}
      <section className="py-16 bg-black border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <p className="text-white font-light text-xl sm:text-2xl leading-relaxed max-w-3xl" style={{letterSpacing: '-0.01em'}}>
            &ldquo;Fantastic space, wonderful hosts. So much room to shoot.&rdquo;
          </p>
          <p className="text-gray-600 text-xs tracking-[0.2em] uppercase mt-4">
            Daryl D. &nbsp;&middot;&nbsp; Dollars &amp; Donuts Productions &nbsp;&middot;&nbsp; Peerspace
          </p>
        </div>
      </section>

      {/* ═══ PODCAST SHOWCASE ═══ */}
      <section className="py-24 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="number-label mb-4 block">Podcast Production</span>
              <h2 className="text-white font-black leading-none" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
                Built for the<br/><span className="text-brand-red">conversation.</span>
              </h2>
            </div>
            <a href="/podcast-studio-san-francisco/" className="hidden md:block text-gray-600 hover:text-white text-sm tracking-wide transition-colors">View podcast studios →</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Large left — duo shot */}
            <div className="md:col-span-2 overflow-hidden rounded-2xl group relative" style={{height: '480px'}}>
              <Image
                src="/studio-images/enhanced-canvas-podcast-white-cyc-duo-v20260510.jpg"
                alt="Two-person podcast session on white cyc wall — VibeShack Studios SF"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                style={{objectPosition: 'center'}}
              />
            </div>
            {/* Right column — two stacked */}
            <div className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-2xl flex-1 group relative" style={{height: '232px'}}>
                <Image
                  src="/studio-images/enhanced-canvas-podcast-white-studio-closeup-v20260510.jpg"
                  alt="Solo podcast host — white cyc wall — VibeShack Studios SF"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  style={{objectPosition: 'center top'}}
                />
              </div>
              <div className="overflow-hidden rounded-2xl flex-1 group relative" style={{height: '232px'}}>
                <Image
                  src="/studio-images/enhanced-canvas-podcast-purple-portrait-v20260510.jpg"
                  alt="Podcast guest — studio session — VibeShack Studios SF"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  style={{objectPosition: 'center top'}}
                />
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-12 border-t border-white/[0.08] pt-10">
            {[
              { label: 'Clean white cyc backdrop', sub: 'Minimal. Timeless. Versatile.' },
              { label: 'Professional mics & cameras', sub: 'Already set up. Walk in and record.' },
              { label: 'From $100/hr', sub: 'Cameraman included on podcast packages.' },
            ].map(({ label, sub }) => (
              <div key={label}>
                <p className="text-white text-sm font-semibold">{label}</p>
                <p className="text-gray-600 text-xs mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          STUDIOS — Editorial bento grid
          Inspired by: Folioblox image grid + SYNTH numbered drops
      ═══════════════════════════════════════════ */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Section header */}
          <div>
            <div className="flex items-end justify-between mb-16">
              <div>
                <span className="number-label mb-4 block">Studio Spaces</span>
                <h2 className="text-white font-black leading-none" style={{fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', letterSpacing: '-0.04em'}}>
                  Choose<br/>Your <span className="text-brand-red">Space.</span>
                </h2>
              </div>
              <a href="/pricing/" className="hidden md:block text-gray-600 hover:text-white text-sm tracking-wide transition-colors">All studios + pricing →</a>
            </div>
          </div>

          {/* Featured hero card */}
          <a href="/the-executive/" className="studio-card block relative mb-3 group overflow-hidden rounded-2xl">

            <Image src="/studio-images/the-executive-hero.jpg"
              alt="The Executive — VibeShack Studios"
              width={1200} height={620}
              className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              style={{height: '620px', objectPosition: 'center 40%'}} />
            <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.1) 60%, transparent 100%)'}} />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:px-10 sm:pb-12">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-5">Walnut Series</p>
                  <h3 className="text-white font-black leading-none" style={{fontSize: 'clamp(2.5rem, 4vw, 4rem)', letterSpacing: '-0.04em'}}>The Executive</h3>
                </div>
                <div className="text-left sm:text-right flex-shrink-0 sm:ml-8 sm:pb-1">
                  <div className="text-white font-black" style={{fontSize: 'clamp(2rem, 3vw, 3rem)', letterSpacing: '-0.03em'}}>$300<span className="text-gray-500 font-light text-lg">/hr</span></div>
                  <div className="text-gray-500 text-xs mt-1">cameraman included</div>
                </div>
              </div>
            </div>
          </a>

          {/* 2-column row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {[
              { slug: '/sunset-studio/', img: '/studio-images/sunset-hero-v20260509.jpg', name: 'Sunset', series: 'Creative Series', seriesColor: '#99f6e4', seriesBg: 'rgba(13,148,136,0.3)', price: '$300', sub: 'Programmable color backdrop · Cameraman included' },
              { slug: '/canvas-rental/', img: '/studio-images/inside-canvas-cyc-v20260509.jpg', name: 'Canvas Rental', series: 'Creative Series', seriesColor: '#99f6e4', seriesBg: 'rgba(13,148,136,0.4)', price: '$100', sub: 'White cyc wall · Overhead lighting grid' },
            ].map(({ slug, img, name, series, seriesColor, seriesBg, price, sub }) => (
              <a key={name} href={slug} className="img-reveal studio-card block relative group overflow-hidden rounded-2xl" style={{height: '380px'}}>
                <Image src={img} alt={`${name} — VibeShack Studios San Francisco`} fill className="object-cover" />
                <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)'}} />
                <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
                  <div className="min-w-0">
                    <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{color: seriesColor}}>{series}</span>
                    <h3 className="text-white font-black text-2xl mb-1" style={{letterSpacing: '-0.02em'}}>{name}</h3>
                    <p className="text-gray-500 text-xs">{sub}</p>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0 sm:ml-4">
                    <div className="text-white font-black text-2xl">{price}</div>
                    <div className="text-gray-500 text-xs">per hour</div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* 4 remaining studios — clean list rows, no muddy dark cards */}
          <div className="border-t border-white/10 mt-3">
            {[
              { name: 'The Executive', price: '$300/hr', slug: '/the-executive/', note: 'Walnut Series · Podcast · cameraman included' },
              { name: 'The Wing', price: '$300/hr', slug: '/the-wing/', note: 'Walnut Series · Podcast · cameraman included' },
              { name: 'Canvas Rental', price: '$100/hr', slug: '/canvas-rental/', note: 'Creative Series · Rental · all equipment included' },
            ].map(({ name, price, slug, note }) => (
              <a key={name} href={slug}
                className="flex items-center justify-between py-4 border-b border-white/[0.08] group hover:opacity-70 transition-opacity">
                <div>
                  <p className="text-white text-sm font-semibold group-hover:text-gray-300 transition-colors">{name}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{note}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-6">
                  <span className="text-white font-bold text-sm">{price}</span>
                  <span className="text-gray-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <InsideStudiosCarousel />

      {/* ═══════════════════════════════════════════
          WHY — 3 columns, editorial numbers
          Inspired by: Folioblox "Behind the Designs"
      ═══════════════════════════════════════════ */}
      {/* ═══ STATEMENT ═══ */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div>
            <p className="text-gray-600 text-xs uppercase tracking-widest mb-8">The Dream Factory · SF Northern Waterfront</p>
            <p className="text-white font-black leading-tight mb-6" style={{fontSize: 'clamp(2.2rem, 4.5vw, 4.5rem)', letterSpacing: '-0.04em', maxWidth: '1000px'}}>
              Our job is <span className="text-brand-red">production.</span><br/>
              Your job is to look good.
            </p>
            <p className="text-gray-500 font-light leading-relaxed" style={{fontSize: 'clamp(1rem, 1.8vw, 1.4rem)', maxWidth: '680px', letterSpacing: '-0.01em'}}>
              You don&apos;t need to know how any of this works. That&apos;s what we&apos;re here for. Every creator deserves the infrastructure to make their best work. We built it. You just show up.
            </p>
            <p className="text-gray-700 text-xs mt-8 tracking-[0.2em] uppercase">The Creative Standard</p>
          </div>
        </div>
      </section>

      {/* ═══ COMBINED: Why + How — one section, two halves ═══ */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* Left — Why VibeShack: 3 reasons, no numbers */}
            <div className="lg:pr-20 lg:border-r border-white/10 pb-16 lg:pb-0">
              <span className="number-label mb-12 block">Why VibeShack</span>
              <div className="space-y-10">
                {[
                  { title: 'Everything in one building', body: 'Podcast, green screen, photo services, video, and room rentals. Hair and makeup rooms on-site. No hauling gear across the city.' },
                  { title: 'The gear is already set up', body: '4K cameras, professional lighting, and studio microphones. Walk in and start shooting.' },
                  { title: "The best rate", body: 'From $100/hr. Most SF studios charge $200 to $350 for the same setup.' },
                ].map(({ title, body }) => (
                  <div key={title} className="border-t border-white/[0.08] pt-8">
                    <h3 className="text-white font-bold text-lg mb-2 leading-tight">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                  </div>
                ))}
            </div>
            </div>

            {/* Right — How It Works: numbered, minimal */}
            <div className="lg:pl-20 pt-16 lg:pt-0">
              <div className="flex items-start justify-between mb-12">
                <span className="number-label">How It Works</span>
                <p className="text-gray-700 text-xs max-w-[140px] text-right">Under two minutes. No back-and-forth.</p>
              </div>
              <div className="space-y-0">
                {[
                  { n: '01', title: 'Pick your studio', body: 'Multiple studios. Each one set up and ready.' },
                  { n: '02', title: 'Book a time', body: 'Select your date. Instant confirmation.' },
                  { n: '03', title: 'Show up and shoot', body: "We're on-site. Everything's ready." },
                ].map(({ n, title, body }) => (
                  <div key={n} className="flex gap-8 border-t border-white/[0.08] py-8">
                    <span className="text-gray-700 font-black text-3xl leading-none flex-shrink-0 w-12" style={{letterSpacing: '-0.04em'}}>{n}</span>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
                      <p className="text-gray-500 text-sm">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <a href="/book/" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 hover:scale-[1.02] hover:gap-4 active:scale-[0.98] transition-all duration-300 cursor-pointer">
                  Book Your Session
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ OVERSIZED TEXT STATEMENT ═══ */}
      <section className="relative py-32 bg-zinc-950 border-t border-white/5 overflow-hidden">
        {/* Huge background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-white font-black leading-none" style={{
            fontSize: 'clamp(5.25rem, 20vw, 22rem)',
            letterSpacing: '-0.06em',
            opacity: 0.03,
            whiteSpace: 'nowrap',
          }}>STUDIOS</span>
        </div>
        {/* Content over it */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <p className="text-gray-600 text-xs tracking-[0.3em] uppercase mb-8">San Francisco · 950 Battery St · Northern Waterfront</p>
          <h2 className="text-white font-black leading-tight mb-8" style={{fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '-0.04em'}}>
            The creative <span className="text-brand-red">standard.</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
            Just bring your idea. We handle everything else.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TESTIMONIAL — Single big quote
          Inspired by: Folioblox minimal trust section
      ═══════════════════════════════════════════ */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16">
          <div>
            <span className="number-label mb-16 block">What Clients Say</span>
            <blockquote className="text-white font-light leading-relaxed mb-12" style={{fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', letterSpacing: '-0.02em'}}>
              &ldquo;Fantastic space, wonderful hosts. So much room to shoot and plenty of space for guests and talent to hang out comfortably.&rdquo;
            </blockquote>
            <cite className="not-italic text-gray-500 text-xs tracking-[0.2em] uppercase font-semibold">
              Daryl D. &nbsp;&middot;&nbsp; Dollars &amp; Donuts Productions &nbsp;&middot;&nbsp; Peerspace
            </cite>
          </div>
          
          <div className="mt-20 pt-16 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { q: '"Best photography studio I\'ve used in the Bay. Full lighting, full vanity, everything you need is there."', name: 'Alicia R.' },
              { q: '"Location is unbeatable. Northern Waterfront, easy to get to. Studio is clean and the team is top-notch."', name: 'Jordan K.' },
              { q: '"Most versatile studio I\'ve booked. More studios in one building than anywhere else in SF."', name: 'Nadia C.' },
            ].map(({ q, name }) => (
              <div key={name}>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{q}</p>
                <p className="text-gray-400 text-xs tracking-[0.2em] uppercase font-semibold">{name} &middot; Peerspace</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          LOCATION — Split layout
      ═══════════════════════════════════════════ */}
      <section className="py-16 sm:py-28 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="number-label mb-12 block">San Francisco</span>
              <h2 className="text-white font-black leading-none mb-10" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
                Where creators<br/><span className="text-brand-red">create.</span>
              </h2>
              <div className="space-y-5 mb-10">
                {[
                  { l: 'Address', v: '950 Battery St, SF 94111' },
                  { l: 'Area', v: 'Northern Waterfront' },
                  { l: 'Parking', v: 'Street parking on Battery St' },
                  { l: 'Transit', v: '10 min walk from the Ferry Building' },
                  { l: 'Hours', v: 'Open 24/7, every day' },
                ].map(({ l, v }) => (
                  <div key={l} className="flex gap-8">
                    <span className="text-gray-600 text-sm w-24 flex-shrink-0">{l}</span>
                    <span className="text-gray-300 text-sm">{v}</span>
                  </div>
                ))}
              </div>
              <a href="https://maps.google.com/?q=950+Battery+St+San+Francisco+CA+94111" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-red hover:text-white transition-colors text-sm font-semibold">
                Open in Google Maps →
              </a>
            </div>
            <div className="img-reveal overflow-hidden rounded-2xl relative" style={{height: '480px'}}>
              <Image src="/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg"
                alt="Lit production setup inside VibeShack Studios in San Francisco"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FREE TOUR CTA — Cinematic full screen
          "Come see the space. Book a free tour."
      ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden border-t border-white/5 bg-black">
        <div className="absolute inset-0">
          <Image src="/studio-images/usecase-photography-campaign-v20260509.jpg" alt="" fill className="object-cover" style={{opacity: 0.15}} />
          <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.8) 100%)'}} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <p className="text-gray-600 text-xs tracking-[0.2em] uppercase mb-8">The Dream Factory</p>
          <h2 className="text-white font-black leading-tight mb-6" style={{fontSize: 'clamp(3rem, 8vw, 6.5rem)', letterSpacing: '-0.05em'}}>
            Come see the<br/><span className="text-brand-red">space.</span>
          </h2>
          <p className="text-brand-red font-black text-4xl mb-8" style={{fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.03em'}}>
            Book a free tour.
          </p>
          <p className="text-gray-400 text-lg mb-16 leading-relaxed max-w-xl mx-auto">
            Pick a live tour time and see the space before you book. 950 Battery St, San Francisco.
          </p>
          <a href="/tour/" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-base tracking-wide rounded-full hover:bg-gray-100 hover:scale-[1.03] hover:gap-4 active:scale-[0.98] transition-all duration-300 cursor-pointer">
            Book a Free Tour
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </a>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA — Cinematic, hexagon bg
          Inspired by: SYNTH "WEAR IT LIKE ARMOR"
      ═══════════════════════════════════════════ */}
      <section className="relative py-40 overflow-hidden border-t border-white/5" style={{background: '#000'}}>
        <div className="absolute inset-0">
          <Image src="/brand/hexagon-bg.jpg" alt="" fill className="object-cover" style={{opacity: 0.25}} />
          <div className="absolute inset-0" style={{background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.4) 100%)'}} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-10 block">Ready?</span>
          <h2 className="text-white font-black leading-none mb-14 max-w-3xl" style={{fontSize: 'clamp(3rem, 8vw, 7rem)', letterSpacing: '-0.05em'}}>
            Your next<br/>session <span className="text-brand-red" >starts<br/>here.</span>
          </h2>
          <div className="flex flex-wrap gap-6 items-center">
            <a href="/book/" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 hover:scale-[1.02] hover:gap-4 active:scale-[0.98] transition-all duration-300 cursor-pointer">
              Book Your Session
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </a>
            <a href="/tour/" className="text-gray-500 hover:text-white transition-colors text-sm">Free tour available →</a>
          </div>
          <p className="text-gray-700 text-xs mt-8 tracking-wide">From $100/hr &nbsp;&middot;&nbsp; Open 24/7 &nbsp;&middot;&nbsp; Instant confirmation</p>
        </div>
      </section>
    </>
  )
}
