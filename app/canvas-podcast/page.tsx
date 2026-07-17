import type { Metadata } from 'next'
import Image from 'next/image'
import { studioServiceSchema } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'Canvas Podcast Studio',
  description: 'Customizable LED backdrop podcast studio in San Francisco. Programmable lighting, cinema-grade equipment, same-day footage delivery. $400/hr with crew included.',
  keywords: 'podcast studio san francisco, professional podcast recording, customizable backgrounds, LED backdrop studio, podcast production sf',
  alternates: { canonical: 'https://www.vibeshackstudios.com/canvas-podcast/' },
  openGraph: {
    title: 'Canvas Podcast Studio | VibeShack Studios',
    description: 'Professional podcast production with customizable LED backgrounds and cinema-grade lighting.',
    url: 'https://www.vibeshackstudios.com/canvas-podcast',
    images: ['/studio-images/enhanced-canvas-podcast-red-set-wide-v20260510.jpg'],
  },
}

const canvasPodcastServiceSchema = studioServiceSchema({
  name: 'Canvas Podcast Studio Rental in San Francisco',
  description: 'Podcast studio in San Francisco with customizable LED backgrounds, cinema-grade lighting, and full crew included.',
  url: 'https://www.vibeshackstudios.com/canvas-podcast/',
  image: 'https://www.vibeshackstudios.com/studio-images/enhanced-canvas-podcast-warm-panel-wide-v20260510.jpg',
  price: '400',
  serviceType: 'Podcast Studio Rental',
})

export default function CanvasPodcastPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(canvasPodcastServiceSchema) }}
      />
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-black overflow-hidden pt-20">
        <div className="absolute inset-0">
          <Image
            src="/studio-images/enhanced-canvas-podcast-warm-panel-wide-v20260510.jpg"
            alt="Canvas Podcast Studio with warm custom podcast setup"
            fill
            priority
            className="object-cover"
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
          <p className="text-gray-400 text-xs tracking-[0.3em] uppercase mb-6">Full-Crew Podcast Production</p>
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
            href="/book/?studio=canvas-podcast"
            className="inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700"
          >
            Book Canvas Podcast
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      {/* Signature Setups */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
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
                  src="/studio-images/enhanced-canvas-podcast-parlor-gold-wide-v20260510.jpg"
                  alt="Parlor interview set with Chesterfield seating"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h3 className="text-white font-black text-3xl leading-tight">Parlor</h3>
                  <p className="text-gray-400 text-sm mt-1">Chesterfield seating under clean linear light.</p>
                </div>
                <span className="text-white font-black text-2xl">$400<span className="text-sm text-gray-400">/hr</span></span>
              </div>
              <div className="divide-y divide-white/10 border-y border-white/10 mt-6 mb-8">
                <div className="py-3 text-gray-400 text-sm">Linear white lights + Chesterfield seating</div>
                <div className="py-3 text-gray-400 text-sm">Minimal, professional aesthetic</div>
                <div className="py-3 text-gray-400 text-sm">Built for executive conversations</div>
              </div>
              <a
                href="/book/?studio=parlor"
                className="inline-flex items-center gap-3 rounded-lg bg-brand-red px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700"
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
                  src="/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg"
                  alt="Horizon podcast set with warm sunset backdrop"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h3 className="text-white font-black text-3xl leading-tight">Horizon</h3>
                  <p className="text-gray-400 text-sm mt-1">Sage green seating on a warm, backlit set.</p>
                </div>
                <span className="text-white font-black text-2xl">$400<span className="text-sm text-gray-400">/hr</span></span>
              </div>
              <div className="divide-y divide-white/10 border-y border-white/10 mt-6 mb-8">
                <div className="py-3 text-gray-400 text-sm">Curated sunset environment + warm atmosphere</div>
                <div className="py-3 text-gray-400 text-sm">Perfect for creative storytelling</div>
                <div className="py-3 text-gray-400 text-sm">Modern sage seating + impact</div>
              </div>
              <a
                href="/book/?studio=horizon"
                className="inline-flex items-center gap-3 rounded-lg bg-brand-red px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700"
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
            <h3 className="text-white font-black text-2xl mb-2">Design Your Own</h3>
            <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
              Not seeing exactly what you need? Custom lighting, backdrops, furniture, equipment. Tell us and we'll build it.
            </p>
            <a
              href="/canvas-podcast/custom-setup/"
              className="inline-flex items-center gap-3 rounded-lg bg-brand-red px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700"
            >
              Start Custom Setup
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Why Canvas: Alternating Layout */}
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
              Full-crew production. No compromises.
            </h2>
          </div>

          {/* Feature 1: Image Left */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-video">
              <Image
                src="/studio-images/enhanced-canvas-podcast-red-set-wide-v20260510.jpg"
                alt="Customizable lighting moods"
                fill
                className="object-cover"
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
                LED backdrop shifts your aesthetic instantly. Warm sunset, moody nights, crisp mornings. Match your brand in seconds.
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
                Professional diffused rigs + custom LED backdrop. Soft, even light on every face. Every frame is production-ready.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-video">
              <Image
                src="/studio-images/enhanced-canvas-podcast-blue-stage-wide-v20260510.jpg"
                alt="Cinema-grade lighting setup"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Feature 3: Image Left */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-video">
              <Image
                src="/studio-images/enhanced-canvas-podcast-white-studio-closeup-v20260510.jpg"
                alt="Guest seating and set design in the white studio"
                fill
                className="object-cover"
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
                Not the gear room. Comfortable seating and clean sightlines that hold up in vertical crops. Your guests will feel it immediately.
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
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <div className="text-brand-red font-black text-3xl mb-2">24/7</div>
                <p className="text-gray-400 text-sm">Studio always ready. No setup delays.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
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
                desc: 'Companies launching flagship shows. Canvas looks the way your brand should.',
              },
              {
                title: 'Interview Series',
                desc: 'High-profile guests on camera, with a sound engineer riding levels the whole session.',
              },
              {
                title: 'Produced Shows',
                desc: 'Scripted, multi-camera episodes with cinema-grade lighting and same-day footage delivery.',
              },
              {
                title: 'Visual Podcasts',
                desc: 'Filmed for YouTube first, with LED backdrops that read on camera at any resolution.',
              },
              {
                title: 'Network Productions',
                desc: 'Studios that need consistency across episodes. Saved lighting looks make every setup repeatable.',
              },
              {
                title: 'Product Launches',
                desc: 'Announce on a set dressed in your launch colors, with footage in hand the same day.',
              },
            ].map(({ title, desc }) => (
              <div key={title} className="border-t border-white/[0.08] pt-8">
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
            <div className="divide-y divide-white/10 border-y border-white/10 text-left">
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
                <div key={item} className="py-3 text-gray-400 text-sm">{item}</div>
              ))}
            </div>
          </div>

          <a
            href="/book/?studio=canvas-podcast"
            className="mb-8 inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700"
          >
            Book Your Episode
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          <p className="text-gray-600 text-sm">
            Open 24/7. Instant confirmation. Free cancellation 48hrs before.
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
            href="/book/?studio=canvas-podcast"
            className="inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700"
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
