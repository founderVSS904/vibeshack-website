import type { Metadata } from 'next'
import React from 'react'
import Image from 'next/image'
import { WebGLShader } from '@/components/ui/web-gl-shader'

export const metadata: Metadata = {
  title: 'San Francisco Production Studio | VibeShack Studios',
  description: "SF's most equipped production studio. Podcast ($300/hr, cameraman included), green screen, photography. Multiple studios, open 24/7. Northern Waterfront.",
  alternates: { canonical: 'https://www.vibeshackstudios.com' },
  openGraph: {
    title: "VibeShack Studios — SF Production Studio",
    description: "Multiple professional studios. Northern Waterfront SF. From $100/hr. Open 24/7.",
    url: 'https://www.vibeshackstudios.com',
  },
}

export default function HomePage() {
  return (
    <>
      {/* ═══════════════════════════════════════════
          HERO — Full viewport, cinematic, left-anchored
          Inspired by: Folioblox hero + SYNTH world-building
      ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-start bg-black overflow-hidden noise-bg">
        {/* WebGL Shader Background — desktop only (hidden on mobile to prevent blank canvas) */}
        <div className="hidden md:block absolute inset-0 z-0">
          <WebGLShader />
        </div>
        {/* Mobile fallback gradient background */}
        <div className="block md:hidden absolute inset-0 z-0" style={{background: 'radial-gradient(ellipse at 30% 60%, rgba(100,20,20,0.55) 0%, rgba(0,0,0,1) 65%)'}} />
        {/* Left gradient — keeps text readable */}
        <div className="absolute inset-0 z-[1]" style={{background: 'linear-gradient(105deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.05) 80%, transparent 100%)'}} />
        
        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Location tag */}
          <div data-reveal="up" data-delay="100">
            <div className="flex items-center gap-3 mb-10">
              <span className="text-gray-400 text-xs tracking-[0.3em] uppercase font-medium">San Francisco · Northern Waterfront · Open 24/7</span>
            </div>
          </div>
          
          {/* Main headline */}
          <div data-reveal="up" data-delay="200">
            <h1 className="mb-12 max-w-4xl">
              <span className="block text-white font-black leading-none" style={{fontSize: 'clamp(52px, 10vw, 140px)', letterSpacing: '-0.05em', lineHeight: 0.9}}>
                More Studios.<br/><span className="text-brand-red">One Address.</span>
              </span>
            </h1>
          </div>

          {/* Single CTA */}
          <div data-reveal="up" data-delay="350">
            <div className="mb-4">
              <a href="/book" data-magnetic className="btn-press inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-sm tracking-wide rounded-full hover:bg-gray-100 hover:scale-[1.03] hover:gap-4 active:scale-[0.98] transition-all duration-300 cursor-pointer">
                Book a Session
                <svg className="w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>



      {/* ═══ STUDIO GRID ═══ */}
      <section className="bg-black py-3">
        <div className="max-w-7xl mx-auto px-3">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4" data-stagger>
            {[
              { src: '/studio-images/the-executive-hero.jpg', label: 'The Executive', href: '/the-executive', alt: 'The Executive — Premium podcast studio with wood paneling — VibeShack Studios SF' },
              { src: '/studio-images/sunset-red.jpg',         label: 'Sunset',         href: '/sunset-studio', alt: 'Sunset — Programmable red backdrop studio — VibeShack Studios SF' },
              { src: '/studio-images/encore-wide.jpg',        label: 'Encore',         href: '/encore', alt: 'Encore — Modern podcast studio with professional lighting — VibeShack Studios SF' },
              { src: '/studio-images/the-wing-hero.jpg',      label: 'The Wing',       href: '/the-wing', alt: 'The Wing — Cozy podcast studio in Walnut Series — VibeShack Studios SF' },
              { src: '/studio-images/greenscreen-wide.jpg',   label: 'Green Screen',   href: '/green-screen-studio-sf', alt: 'Green Screen studio with full-wall green screen — VibeShack Studios SF' },
              { src: '/studio-images/photography-hero.jpg',   label: 'Photography',    href: '/photography-studio-san-francisco', alt: 'Photography studio with professional lighting setup — VibeShack Studios SF' },
              { src: '/studio-images/parlor-hero.jpg',        label: 'Parlor',         href: '/parlor', alt: 'Parlor — Premium interview studio with Chesterfield seating — VibeShack Studios SF' },
              { src: '/studio-images/horizon-hero.jpg',       label: 'Horizon',        href: '/horizon', alt: 'Horizon — Immersive creative space with sunset LED wall — VibeShack Studios SF' },
              { src: '/studio-images/drive-cyc-wall.jpg',     label: 'Canvas Rental',  href: '/white-backdrop-studio', alt: 'Canvas Rental — White cyc wall studio for photography and content creation — VibeShack Studios SF' },
            ].map(({ src, label, href, alt }, idx) => (
              <div key={label} className="studio-grid-card card-lift">
                <a href={href} className="relative overflow-hidden rounded-xl group block" style={{height: '160px'}}>
                  <Image src={src} alt={alt} fill className="object-cover group-hover:scale-[1.07] transition-transform duration-500 ease-out" placeholder="blur" blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=" {...(idx < 4 ? { priority: true } : {})} />
                  <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-60" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)'}} />
                  <p className="absolute bottom-3 left-3 text-white text-xs font-semibold tracking-wide">{label}</p>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DIFFERENTIATORS ═══ */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/8" data-stagger>
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
            <a href="/podcast-studio-san-francisco" className="hidden md:block text-gray-600 hover:text-white text-sm tracking-wide transition-colors">View podcast studios →</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Large left — duo shot */}
            <div className="md:col-span-2 overflow-hidden rounded-2xl group relative" style={{height: '480px'}}>
              <Image
                src="/studio-images/podcast-cyc-duo.jpg"
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
                  src="/studio-images/podcast-cyc-solo-1.jpg"
                  alt="Solo podcast host — white cyc wall — VibeShack Studios SF"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  style={{objectPosition: 'center top'}}
                />
              </div>
              <div className="overflow-hidden rounded-2xl flex-1 group relative" style={{height: '232px'}}>
                <Image
                  src="/studio-images/podcast-cyc-solo-2.jpg"
                  alt="Podcast guest — studio session — VibeShack Studios SF"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  style={{objectPosition: 'center top'}}
                />
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-12 border-t border-white/8 pt-10">
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
          <div data-reveal="up">
            <div className="flex items-end justify-between mb-16">
              <div>
                <span className="number-label mb-4 block">Studio Spaces</span>
                <h2 className="text-white font-black leading-none" style={{fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', letterSpacing: '-0.04em'}}>
                  Choose<br/>Your <span className="text-brand-red">Space.</span>
                </h2>
              </div>
              <a href="/pricing" className="hidden md:block text-gray-600 hover:text-white text-sm tracking-wide transition-colors">All studios + pricing →</a>
            </div>
          </div>

          {/* Featured hero card */}
          <a href="/the-executive" className="studio-card block relative mb-3 group overflow-hidden rounded-2xl">

            <Image src="/studio-images/the-executive-hero.jpg"
              alt="The Executive — VibeShack Studios"
              width={1200} height={620}
              priority
              className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              style={{height: '620px', objectPosition: 'center 40%'}} />
            <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.1) 60%, transparent 100%)'}} />
            <div className="absolute bottom-0 left-0 right-0 px-10 pb-12">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-5">Walnut Series</p>
                  <h3 className="text-white font-black leading-none" style={{fontSize: 'clamp(2.5rem, 4vw, 4rem)', letterSpacing: '-0.04em'}}>The Executive</h3>
                </div>
                <div className="text-right flex-shrink-0 ml-8 pb-1">
                  <div className="text-white font-black" style={{fontSize: 'clamp(2rem, 3vw, 3rem)', letterSpacing: '-0.03em'}}>$300<span className="text-gray-500 font-light text-lg">/hr</span></div>
                  <div className="text-gray-500 text-xs mt-1">cameraman included</div>
                </div>
              </div>
            </div>
          </a>

          {/* 2-column row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {[
              { slug: '/sunset-studio', img: '/studio-images/sunset-red.jpg', name: 'Sunset', series: 'Creative Series', seriesColor: '#99f6e4', seriesBg: 'rgba(13,148,136,0.3)', price: '$300', sub: 'Programmable color backdrop · Cameraman included' },
              { slug: '/white-backdrop-studio', img: '/studio-images/podcast-cyc-duo.jpg', name: 'Canvas', series: 'Creative Series', seriesColor: '#99f6e4', seriesBg: 'rgba(13,148,136,0.4)', price: '$100', sub: 'White cyc wall · Overhead lighting grid' },
            ].map(({ slug, img, name, series, seriesColor, seriesBg, price, sub }) => (
              <a key={name} href={slug} className="img-reveal studio-card block relative group overflow-hidden rounded-2xl" data-reveal="scale" style={{height: '380px'}}>
                <Image src={img} alt={`${name} — VibeShack Studios San Francisco`} fill className="object-cover" />
                <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)'}} />
                <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
                  <div>
                    <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{color: seriesColor}}>{series}</span>
                    <h3 className="text-white font-black text-2xl mb-1" style={{letterSpacing: '-0.02em'}}>{name}</h3>
                    <p className="text-gray-500 text-xs">{sub}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
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
              { name: 'The Executive', price: '$300/hr', slug: '/the-executive', note: 'Walnut Series · Podcast · cameraman included' },
              { name: 'The Wing', price: '$300/hr', slug: '/the-wing', note: 'Walnut Series · Podcast · cameraman included' },
              { name: 'Canvas', price: '$100/hr', slug: '/white-backdrop-studio', note: 'Creative Series · Rental · all equipment included' },
            ].map(({ name, price, slug, note }) => (
              <a key={name} href={slug}
                className="flex items-center justify-between py-4 border-b border-white/8 group hover:opacity-70 transition-opacity">
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

      {/* ═══ HORIZONTAL SCROLL FILM STRIP ═══ */}
      <section className="py-16 bg-black border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 mb-8">
          <div className="flex items-center justify-between">
            <span className="number-label">Inside the Studios</span>
            <span className="text-gray-600 text-xs tracking-wide">Scroll →</span>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-6 sm:px-10 lg:px-16" style={{scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch'} as React.CSSProperties}>
          {[
            { src: '/studio-images/drive-homepage-1.jpg', label: '4K Cinema Camera Setup' },
            { src: '/studio-images/podcast-cyc-duo.jpg', label: 'Podcast — White Cyc Wall' },
            { src: '/studio-images/encore-wide.jpg', label: 'Encore' },
            { src: '/studio-images/podcast-cyc-solo-1.jpg', label: 'Podcast Production' },
            { src: '/studio-images/drive-greenscreen-hero.jpg', label: 'Green Screen' },
            { src: '/studio-images/podcast-cyc-solo-2.jpg', label: 'Podcast — Studio Session' },
            { src: '/studio-images/photography-hero.jpg', label: 'Photography Studio' },
            { src: '/studio-images/drive-homepage-4.jpg', label: 'Hair & Makeup Room' },
            { src: '/studio-images/the-wing-hero.jpg', label: 'The Wing — Walnut Series' },
            { src: '/studio-images/drive-cyc-wall.jpg', label: 'Canvas' },
          ].map(({ src, label }) => (
            <div key={src} className="flex-shrink-0 relative group" style={{scrollSnapAlign: 'start', width: '340px'}}>
              <div className="overflow-hidden rounded-lg relative" style={{height: '220px'}}>
                <Image src={src} alt={`${label} — VibeShack Studios San Francisco`} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <p className="text-gray-500 text-xs mt-3 tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHY — 3 columns, editorial numbers
          Inspired by: Folioblox "Behind the Designs"
      ═══════════════════════════════════════════ */}
      {/* ═══ STATEMENT ═══ */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div data-reveal="up">
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
                  { title: 'Everything in one building', body: 'Podcast, Green Screen, photography, video. Hair & Makeup rooms on-site. No hauling gear across the city.' },
                  { title: 'The gear is already set up', body: '4K cameras, professional lighting, and studio microphones. Walk in and start shooting.' },
                  { title: "The best rate", body: 'From $100/hr. Most SF studios charge $200 to $350 for the same setup.' },
                ].map(({ title, body }) => (
                  <div key={title} className="border-t border-white/8 pt-8">
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
                  <div key={n} className="flex gap-8 border-t border-white/8 py-8">
                    <span className="text-gray-700 font-black text-3xl leading-none flex-shrink-0 w-12" style={{letterSpacing: '-0.04em'}}>{n}</span>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
                      <p className="text-gray-500 text-sm">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <a href="/book" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 hover:scale-[1.02] hover:gap-4 active:scale-[0.98] transition-all duration-300 cursor-pointer">
                  Book Your Session
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          GALLERY — Edge-to-edge, no borders
          Inspired by: Folioblox editorial image grid
      ═══════════════════════════════════════════ */}
      <section className="bg-black border-t border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          {[
            { src: '/studio-images/drive-homepage-1.jpg', alt: 'VibeShack Studios — RED cameras, SF' },
            { src: '/studio-images/drive-greenscreen-hero.jpg', alt: 'VibeShack Studios — green screen, SF' },
            { src: '/studio-images/drive-podcast-hero.jpg', alt: 'VibeShack Studios — podcast studio, SF' },
            { src: '/studio-images/drive-homepage-4.jpg', alt: 'VibeShack Studios — SF Northern Waterfront' },
          ].map(({ src, alt }) => (
            <div key={src} className="img-reveal overflow-hidden rounded-xl group relative" style={{height: '320px'}}>
              <Image src={src} alt={alt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* ═══ OVERSIZED TEXT STATEMENT ═══ */}
      <section className="relative py-32 bg-zinc-950 border-t border-white/5 overflow-hidden">
        {/* Huge background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-white font-black leading-none" style={{
            fontSize: 'clamp(8rem, 20vw, 22rem)',
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
          <div data-reveal="up">
            <span className="number-label mb-16 block">What Clients Say</span>
            <blockquote data-reveal="up" className="text-white font-light leading-relaxed mb-12" style={{fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', letterSpacing: '-0.02em'}}>
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
              <Image src="/studio-images/drive-podcast-hero.jpg"
                alt="VibeShack Studios, 950 Battery St, San Francisco"
                fill
                className="object-cover"
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
          <Image src="/studio-images/photography-hero.jpg" alt="" fill className="object-cover" style={{opacity: 0.15}} />
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
            Free studio tours available 24/7. 950 Battery St, San Francisco.
          </p>
          <a href="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-base tracking-wide rounded-full hover:bg-gray-100 hover:scale-[1.03] hover:gap-4 active:scale-[0.98] transition-all duration-300 cursor-pointer">
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
            <a href="/book" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 hover:scale-[1.02] hover:gap-4 active:scale-[0.98] transition-all duration-300 cursor-pointer">
              Book Your Session
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </a>
            <a href="/contact" className="text-gray-500 hover:text-white transition-colors text-sm">Free tour available →</a>
          </div>
          <p className="text-gray-700 text-xs mt-8 tracking-wide">From $100/hr &nbsp;&middot;&nbsp; Open 24/7 &nbsp;&middot;&nbsp; Instant confirmation</p>
        </div>
      </section>
    </>
  )
}
