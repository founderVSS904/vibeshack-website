import type { Metadata } from 'next'
import Image from 'next/image'
import { studioServiceSchema } from '@/lib/schemas'

export const metadata: Metadata = {
  title: 'Parlor Interview Studio',
  description: 'Chesterfield seating. Full 4K production. Cameraman included. Premium interview studio in San Francisco. $400/hr. Open 24/7.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/parlor/' },
  openGraph: {
    title: 'Parlor | VibeShack Studios SF',
    description: 'Premium interview studio with Chesterfield seating and full 4K production. Cameraman included. $400/hr in San Francisco.',
    url: 'https://www.vibeshackstudios.com/parlor',
    siteName: 'VibeShack Studios',
    images: [{ url: '/studio-images/parlor-hero.jpg', width: 1200, height: 630, alt: 'Parlor at VibeShack Studios SF' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Parlor | VibeShack Studios SF',
    description: 'Premium interview studio with Chesterfield seating and full 4K production. Cameraman included. $400/hr in San Francisco.',
    images: ['/studio-images/parlor-hero.jpg'],
  },
}

const parlorServiceSchema = studioServiceSchema({
  name: 'Parlor Interview Studio Rental in San Francisco',
  description: 'Premium interview studio in San Francisco with Chesterfield seating, 4K production, broadcast audio, and crew included.',
  url: 'https://www.vibeshackstudios.com/parlor/',
  image: 'https://www.vibeshackstudios.com/studio-images/parlor-hero.jpg',
  price: '400',
  serviceType: 'Interview Studio Rental',
})

export default function ParlorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(parlorServiceSchema) }}
      />
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/parlor-hero.jpg"
          alt="Parlor premium interview studio, VibeShack Studios San Francisco"
          fill sizes="100vw" className="object-cover opacity-80" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-28 sm:pt-40 w-full">
          <p className="text-xs font-bold tracking-widest uppercase mb-4 text-brand-red">Creative Series</p>
          <h1 className="text-6xl sm:text-7xl font-black text-white leading-none mb-4" style={{letterSpacing: 0}}>
            Parlor<span className="text-brand-red">.</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-xl mb-8">
            Premium interview setup. Chesterfield seating. Full crew included.
          </p>
          <a href="/book/?studio=parlor" className="group inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
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
                A crewed<br/><span className="text-brand-red">interview set.</span>
              </h2>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {[
                  'Custom setup, tailored to your production',
                  'Full 4K production framed for interviews',
                  'Cameraman + producer included',
                  'Chesterfield seating framed for camera',
                  'Broadcast mics on host and guest',
                  'Treated acoustics, clean dialogue',
                  'Footage back in 6 to 12 hours',
                  'Support in the room, start to finish',
                ].map(item => (
                  <div key={item} className="py-4 text-gray-400 text-base">{item}</div>
                ))}
              </div>
            </div>
            {/* Right: Photo */}
            <div>
              <Image src="/studio-images/parlor-side-v20260509.jpg" alt="Parlor premium interview setup with Chesterfield seating, VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Studio Details */}
      <section className="py-32 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">The Set</span>
          <h2 className="text-white font-black leading-none mb-4" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: 0}}>
            A documentary-style<br/><span className="text-brand-red">interview set.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-20 max-w-2xl">Chesterfield seating, warm directional light, broadcast microphones, and full crew support give interviews a finished documentary frame.</p>

          <div className="space-y-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-1">
                <Image src="/studio-images/parlor-production-v20260509.jpg" alt="Chesterfield seating and broadcast microphones in Parlor at VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-lg object-cover" />
              </div>
              <div className="order-2">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: 0}}>Chesterfield Seating That Reads on Camera</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">Tufted leather gives the wide shot texture and keeps the interview grounded in a recognizable interior.</p>
                <p className="text-gray-400 text-lg leading-relaxed">Warm, directional lighting separates both speakers from the background without harsh facial shadows.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: 0}}>Full Crew. No Coordination Required.</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">Your cameraman and producer are already here. You walk in, get mic'd up, and record. The Parlor team handles the angles, the audio levels, the lighting adjustments.</p>
                <p className="text-gray-400 text-lg leading-relaxed">You focus on the conversation. We focus on capturing it.</p>
              </div>
              <div className="order-1 md:order-2">
                <Image src="/studio-images/parlor-angled-v20260509.jpg" alt="Angled Parlor production setup with microphones and premium seating at VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-lg object-cover" />
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
          <a href="/book/?studio=parlor" className="group inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
            Book Parlor
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
            <a href="/book/?studio=parlor" className="group inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
              Book Your Session
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
            <a href="/tour/?studio=parlor" className="text-gray-500 hover:text-white transition-colors text-sm self-center">Schedule a free tour →</a>
          </div>
        </div>
      </section>
    </>
  )
}
