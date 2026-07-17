import type { Metadata } from 'next'
import Image from 'next/image'
import { studioServiceSchema } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'Horizon Studio',
  description: 'Curated sunset environment. Full 4K production. Cameraman included. Studio with ambient light control in San Francisco. $400/hr. Open 24/7.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/horizon/' },
  openGraph: {
    title: 'Horizon | VibeShack Studios SF',
    description: 'Warm sunset backdrop with ambient light control and full 4K production. Cameraman included. $400/hr in San Francisco.',
    url: 'https://www.vibeshackstudios.com/horizon',
    siteName: 'VibeShack Studios',
    images: [{ url: '/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg', width: 1200, height: 630, alt: 'Horizon at VibeShack Studios SF' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Horizon | VibeShack Studios SF',
    description: 'Warm sunset backdrop with ambient light control and full 4K production. Cameraman included. $400/hr in San Francisco.',
    images: ['/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg'],
  },
}

const horizonServiceSchema = studioServiceSchema({
  name: 'Horizon Studio Rental in San Francisco',
  description: 'Curated sunset podcast and video studio in San Francisco with full 4K production and crew included.',
  url: 'https://www.vibeshackstudios.com/horizon/',
  image: 'https://www.vibeshackstudios.com/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg',
  price: '400',
  serviceType: 'Creative Studio Rental',
})

export default function HorizonPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(horizonServiceSchema) }}
      />
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg"
          alt="Horizon warm sunset studio at VibeShack Studios San Francisco"
          fill sizes="100vw" className="object-cover opacity-80" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-28 sm:pt-40 w-full">
          <p className="text-xs font-bold tracking-widest uppercase mb-4 text-brand-red">Creative Series</p>
          <h1 className="text-6xl sm:text-7xl font-black text-white leading-none mb-4" style={{letterSpacing: 0}}>
            Horizon<span className="text-brand-red">.</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-xl mb-8">
            Warm sunset set, flexible seating, broadcast audio, and full crew included.
          </p>
          <a href="/book/?studio=horizon" className="group inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
            Book This Studio
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </section>

      {/* Show up. Record */}
      <section className="py-32 bg-zinc-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Features */}
            <div>
              <h2 className="text-white font-black leading-none mb-12" style={{fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', letterSpacing: 0}}>
                Warm color.<br/><span className="text-brand-red">Ready to shoot.</span>
              </h2>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {[
                  'Set layout tailored to the production',
                  'Full 4K coverage from every angle',
                  'Cameraman + producer included',
                  'Warm sunset backdrop with practical lighting',
                  'Broadcast mics tuned for the room',
                  'Ambient light control, dialed to your scene',
                  'Footage turned around in 6 to 12 hours',
                  'On-site crew through the whole shoot',
                ].map(item => (
                  <div key={item} className="py-4 text-gray-400 text-base">{item}</div>
                ))}
              </div>
            </div>
            {/* Right: Photo */}
            <div>
              <Image src="/studio-images/enhanced-horizon-orange-podcast-wide-v20260510.jpg" alt="Horizon warm sunset podcast setup at VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Studio Details */}
      <section className="py-32 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">The Set</span>
          <h2 className="text-white font-black leading-none mb-4" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: 0}}>
            Golden-hour color,<br/><span className="text-brand-red">on set.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-20 max-w-2xl">Horizon combines a warm backdrop, layered practical light, and a flexible seating layout for podcasts, interviews, and branded video.</p>

          <div className="space-y-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-1">
                <Image src="/studio-images/enhanced-horizon-orange-guest-closeup-v20260510.jpg" alt="Warm sunset backdrop and microphones in Horizon at VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-lg object-cover" />
              </div>
              <div className="order-2">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: 0}}>Warm Color Without Compositing</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">The background and practical fixtures create the set&apos;s amber color in camera, with enough separation to keep skin tones neutral.</p>
                <p className="text-gray-400 text-lg leading-relaxed">No green screen. No compositing. The light and the atmosphere you see are really in the room, and the camera picks all of it up.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: 0}}>Camera and Producer Included</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">The baseline camera, lighting, and audio setup is prepared before the session, then adjusted for the shot list and talent.</p>
                <p className="text-gray-400 text-lg leading-relaxed">The crew monitors framing and sound while the interview or performance is underway.</p>
              </div>
              <div className="order-1 md:order-2">
                <Image src="/studio-images/enhanced-horizon-warm-guest-closeup-v20260510.jpg" alt="Horizon warm production setup at VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-lg object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 bg-zinc-950 border-t border-white/10">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">Pricing</span>
          <div className="text-brand-red font-black leading-none mb-2" style={{fontSize: 'clamp(5rem, 14vw, 10rem)', letterSpacing: 0}}>$400</div>
          <p className="text-gray-500 text-lg mb-1">per hour</p>
          <p className="text-white font-semibold mb-12">Cameraman + producer included. 1 hour minimum. Open 24/7.</p>
          <div className="divide-y divide-white/10 border-y border-white/10 mb-12">
            {[
              { label: '2 Hours', price: '$800' },
              { label: '4 Hours', price: '$1,600' },
              { label: '8 Hours', price: '$3,200' },
            ].map(({ label, price }) => (
              <div key={label} className="flex items-center justify-between py-4">
                <span className="text-gray-400 text-sm">{label}</span>
                <span className="text-white font-black text-lg">{price}</span>
              </div>
            ))}
          </div>
          <a href="/book/?studio=horizon" className="group inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
            Book Horizon
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
          <p className="text-gray-700 text-xs mt-4">Instant confirmation. Free cancellation 48hrs before.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <h2 className="font-black text-white leading-none mb-4" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: 0 }}>
            Ready to <span className="text-brand-red">Record?</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10">$400/hr. Cameraman + producer included. Instant confirmation.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/book/?studio=horizon" className="group inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
              Book Your Session
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
            <a href="/tour/?studio=horizon" className="text-gray-500 hover:text-white transition-colors text-sm self-center">Schedule a free tour →</a>
          </div>
        </div>
      </section>
    </>
  )
}
