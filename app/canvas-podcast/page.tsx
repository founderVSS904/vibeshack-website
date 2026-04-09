import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Canvas Podcast Studio | Premium Podcast Production | VibeShack SF',
  description: 'Customizable LED backdrop podcast studio in San Francisco. Programmable lighting, cinema-grade equipment, premium aesthetics. $400/hr with crew included.',
  keywords: 'podcast studio san francisco, premium podcast recording, customizable backgrounds, LED backdrop studio, podcast production sf',
  openGraph: {
    title: 'Canvas Podcast Studio — VibeShack Studios',
    description: 'Professional podcast production with customizable LED backgrounds and premium lighting.',
    url: 'https://www.vibeshackstudios.com/canvas-podcast/',
  },
}

export default function CanvasPodcastPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-black overflow-hidden pt-20">
        <div className="absolute inset-0">
          <Image
            src="/studio-images/podcast-cyc-duo.jpg"
            alt="Canvas Podcast Studio with orange LED backdrop"
            fill
            priority
            className="object-cover object-bottom md:object-center"
            style={{ opacity: 0.4 }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <p className="text-gray-600 text-xs tracking-[0.3em] uppercase mb-6">Premium Podcast Production</p>
          <h1
            className="font-black text-white leading-tight mb-6"
            style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              letterSpacing: '-0.05em',
            }}
          >
            Canvas <span className="text-brand-red">Podcast</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed mb-12">
            Customizable LED backgrounds. Cinema-grade lighting. Everything you need to produce a show that looks and sounds premium.
          </p>
          <a
            href="/book?studio=canvas-rental"
            className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors"
          >
            Book Canvas Podcast
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      {/* Signature Setups */}
      <section className="py-16 md:py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="mb-20">
            <span className="number-label mb-12 block">Choose Your Setup</span>
            <h2
              className="font-black text-white leading-tight"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                letterSpacing: '-0.04em',
              }}
            >
              Signature spaces. Or design your own.
            </h2>
          </div>

          {/* Equal Setups Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Parlor */}
            <div>
              <div className="relative overflow-hidden rounded-2xl mb-8 h-72">
                <Image
                  src="/studio-images/parlor-hero.jpg"
                  alt="Parlor — Premium interview studio"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h3 className="text-white font-black text-3xl leading-tight">Parlor</h3>
                  <p className="text-gray-400 text-sm mt-1">Premium interviews. Clean design. Impact.</p>
                </div>
                <span className="text-white font-black text-2xl">$400<span className="text-sm text-gray-400">/hr</span></span>
              </div>
              <ul className="space-y-3 text-gray-500 text-sm mt-6 mb-8">
                <li className="flex gap-3"><span className="text-brand-red flex-shrink-0">✓</span> <span>Linear white lights + Chesterfield seating</span></li>
                <li className="flex gap-3"><span className="text-brand-red flex-shrink-0">✓</span> <span>Minimal, professional aesthetic</span></li>
                <li className="flex gap-3"><span className="text-brand-red flex-shrink-0">✓</span> <span>Built for executive conversations</span></li>
              </ul>
              <a
                href="/book?studio=parlor"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors"
              >
                Book Parlor
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            {/* Horizon */}
            <div>
              <div className="relative overflow-hidden rounded-2xl mb-8 h-72">
                <Image
                  src="/studio-images/horizon-hero.jpg"
                  alt="Horizon — Immersive creative space"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h3 className="text-white font-black text-3xl leading-tight">Horizon</h3>
                  <p className="text-gray-400 text-sm mt-1">Dreamy. Cinematic. Immersive.</p>
                </div>
                <span className="text-white font-black text-2xl">$400<span className="text-sm text-gray-400">/hr</span></span>
              </div>
              <ul className="space-y-3 text-gray-500 text-sm mt-6 mb-8">
                <li className="flex gap-3"><span className="text-brand-red flex-shrink-0">✓</span> <span>Sunset LED wall + cloud projection</span></li>
                <li className="flex gap-3"><span className="text-brand-red flex-shrink-0">✓</span> <span>Perfect for creative storytelling</span></li>
                <li className="flex gap-3"><span className="text-brand-red flex-shrink-0">✓</span> <span>Modern sage seating + impact</span></li>
              </ul>
              <a
                href="/book?studio=horizon"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors"
              >
                Book Horizon
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

          {/* Custom Setup CTA */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <svg className="w-12 h-12 mx-auto mb-6 text-brand-red opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <h3 className="text-white font-black text-2xl mb-2">Design Your Own</h3>
            <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
              Not seeing exactly what you need? Tell us your vision. Custom lighting, backdrops, furniture, equipment — we'll build it.
            </p>
            <a
              href="/book?studio=canvas-rental"
              className="inline-flex items-center gap-2 px-8 py-3 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors"
            >
              Start Custom Setup
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Why Canvas — Alternating Layout */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="mb-32">
            <span className="number-label mb-12 block">What Makes Canvas Different</span>
            <h2
              className="font-black text-white leading-tight"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                letterSpacing: '-0.04em',
              }}
            >
              Premium production. No compromises.
            </h2>
          </div>

          {/* Feature 1: Image Left */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-video">
              <Image
                src="/studio-images/podcast-cyc-duo.jpg"
                alt="Customizable lighting moods"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h3
                className="text-white font-black mb-6"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  letterSpacing: '-0.04em',
                }}
              >
                Customizable Moods
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
                LED backdrop shifts your aesthetic instantly. Warm sunset, moody nights, crisp mornings — match your brand in seconds.
              </p>
            </div>
          </div>

          {/* Feature 2: Image Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <div className="order-last lg:order-first">
              <h3
                className="text-white font-black mb-6"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  letterSpacing: '-0.04em',
                }}
              >
                Cinema-Grade Lighting
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
                Professional diffused rigs + custom LED backdrop. Your talent looks premium. Every frame is production-ready.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-video">
              <Image
                src="/studio-images/podcast-cyc-solo-1.jpg"
                alt="Cinema-grade lighting setup"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Feature 3: Image Left */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-video">
              <Image
                src="/studio-images/podcast-cyc-solo-2.jpg"
                alt="Premium comfort and design"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h3
                className="text-white font-black mb-6"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  letterSpacing: '-0.04em',
                }}
              >
                Designed for Your Show
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
                Not the gear room. Premium seating, clean sightlines, Instagram-worthy aesthetics. Your guests will feel it immediately.
              </p>
            </div>
          </div>

          {/* Feature 4: Two Column Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12">
              <div>
                <h3 className="text-white font-black text-2xl mb-3">Dual Mic Setup</h3>
                <p className="text-gray-400 leading-relaxed">Host + guest perfectly isolated. Professional audio, zero compromise on comfort.</p>
              </div>
              <div>
                <h3 className="text-white font-black text-2xl mb-3">Full Crew Included</h3>
                <p className="text-gray-400 leading-relaxed">Sound engineer, lighting tech, everything. You focus on the show. We handle production.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                <div className="text-brand-red font-black text-3xl mb-2">24/7</div>
                <p className="text-gray-400 text-sm">Studio always ready. No setup delays.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                <div className="text-brand-red font-black text-3xl mb-2">$400/hr</div>
                <p className="text-gray-400 text-sm">Crew, gear, space all included. No surprises.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">Who Books Canvas</span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Brand Podcasts',
                desc: 'Companies launching flagship shows. Canvas looks like your brand deserves.',
              },
              {
                title: 'Interview Series',
                desc: 'Conversations matter. Premium guests expect premium production. Canvas delivers.',
              },
              {
                title: 'Premium Content Shows',
                desc: 'Scripted, produced, high-budget shows. Canvas matches your production value.',
              },
              {
                title: 'Visual Podcasts',
                desc: 'Video components? YouTube integration? Canvas is built for it.',
              },
              {
                title: 'Network Productions',
                desc: 'Studios that need consistency across episodes. Customizable yet repeatable.',
              },
              {
                title: 'Product Launches',
                desc: 'Announce, interview, celebrate. Canvas makes it feel like the big moment it is.',
              },
            ].map(({ title, desc }) => (
              <div key={title} className="border-t border-white/8 pt-8">
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & Booking */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <span className="number-label mb-12 block">Simple Pricing</span>
          <h2
            className="font-black text-white leading-tight mb-8"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              letterSpacing: '-0.04em',
            }}
          >
            <span className="text-brand-red">$400</span> / hour
          </h2>
          <p className="text-gray-500 text-lg mb-12 max-w-2xl mx-auto">
            Everything included. Crew, lighting setup, background customization, dual-mic audio, the space itself.
          </p>

          <div className="bg-black rounded-xl p-12 mb-12 border border-white/10">
            <h3 className="text-white font-bold text-xl mb-6">What's Included</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
              {[
                'Sound Engineer on-site',
                'Lighting Tech on-site',
                'Customizable LED backdrop',
                'Cinema-grade key lights',
                'Dual professional microphones',
                'Professional audio mixing',
                'Comfortable guest seating',
                'Same-day footage delivery',
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="text-brand-red font-black flex-shrink-0">✓</span>
                  <span className="text-gray-400 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <a
            href="/book?studio=canvas-rental"
            className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors mb-8"
          >
            Book Your Episode
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          <p className="text-gray-600 text-sm">
            Available 24/7. Book instantly. Confirmation within 1 hour.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <h2
            className="font-black text-white leading-tight mb-8"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              letterSpacing: '-0.04em',
            }}
          >
            Ready to make your <span className="text-brand-red">next episode</span> look premium?
          </h2>
          <p className="text-gray-500 text-lg mb-12">
            Canvas Podcast is available now. Book your session and let's create something great.
          </p>
          <a
            href="/book?studio=canvas-rental"
            className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-base tracking-wide rounded hover:bg-red-700 transition-colors"
          >
            Book Canvas Podcast
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>
    </>
  )
}
