import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Horizon: Immersive LED Studio | VibeShack Studios SF',
  description: 'Sunset LED wall. Full 4K production. Cameraman included. Immersive studio setup in San Francisco. $300/hr. Open 24/7.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/horizon' },
  openGraph: {
    title: 'Horizon | VibeShack Studios SF',
    description: 'Immersive LED studio with programmable sunset wall and full 4K production. Cameraman included. $300/hr in San Francisco.',
    url: 'https://www.vibeshackstudios.com/horizon',
    siteName: 'VibeShack Studios',
    images: [{ url: '/studio-images/horizon-hero.jpg', width: 1200, height: 630, alt: 'Horizon at VibeShack Studios SF' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Horizon | VibeShack Studios SF',
    description: 'Immersive LED studio with programmable sunset wall and full 4K production. Cameraman included. $300/hr in San Francisco.',
    images: ['/studio-images/horizon-hero.jpg'],
  },
}

export default function HorizonPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/horizon-hero.jpg"
          alt="Horizon immersive LED studio — VibeShack Studios San Francisco"
          fill className="object-cover opacity-80" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-28 sm:pt-40 w-full">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{color: '#99f6e4'}}>Creative Series</p>
          <h1 data-reveal="up" className="text-6xl sm:text-7xl font-black text-white leading-none mb-4" style={{letterSpacing: '-0.04em'}}>
            Horizon.
          </h1>
          <p className="text-gray-400 text-xl max-w-xl mb-8" data-reveal="fade">
            Immersive setup. Sunset LED wall. Full crew included.
          </p>
          <a href="/book?studio=horizon" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors">
            Book This Studio
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      {/* Show up. Record */}
      <section className="py-32 bg-zinc-950 border-t border-brand-red" style={{borderColor: '#e11d48'}}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Features */}
            <div>
              <h2 data-reveal="up" className="text-white font-black leading-none mb-12" style={{fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
                Step in.<br/><span className="text-brand-red">Set the scene.</span>
              </h2>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {[
                  'Custom setup — built around your vision',
                  'Full 4K production, all angles covered',
                  'Cameraman + producer included',
                  'LED sunset wall — programmable, cinematic',
                  'Broadcast microphones, zero compromise',
                  'Immersive ambient lighting control',
                  '6–12hr footage turnaround',
                  'On-site support throughout',
                ].map(item => (
                  <div key={item} className="py-4 text-gray-400 text-base">{item}</div>
                ))}
              </div>
            </div>
            {/* Right: Photo */}
            <div>
              <Image src="/studio-images/horizon-hero.jpg" alt="Horizon LED sunset wall — VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Studio Details */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">The Room</span>
          <h2 data-reveal="up" className="text-white font-black leading-none mb-4" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
            Where content becomes<br/><span className="text-brand-red">an experience.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-20 max-w-2xl">Horizon is built for productions that want more than a clean background. The sunset LED wall shifts the whole energy of the room — warm amber, deep violet, whatever the scene calls for. Your audience feels it through the screen.</p>

          <div className="space-y-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-1">
                <Image src="/studio-images/horizon-hero.jpg" alt="LED sunset wall in Horizon at VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-3xl object-cover" />
              </div>
              <div className="order-2">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: '-0.02em'}}>Sunset LED Wall That Sets the Mood</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">A programmable LED wall that wraps your content in color. Golden hour at noon. Deep sunset at midnight. The kind of background that doesn't look like a background — it looks like a location.</p>
                <p className="text-gray-400 text-lg leading-relaxed">No green screen. No post-production compositing. Real light. Real atmosphere. Real on camera.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: '-0.02em'}}>Full Crew. Zero Setup Stress.</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">Your cameraman and producer are already set up before you walk in. Horizon is dialed in — LED tuned, cameras locked, audio checked. All you do is show up and perform.</p>
                <p className="text-gray-400 text-lg leading-relaxed">We handle the technical. You own the creative.</p>
              </div>
              <div className="order-1 md:order-2">
                <Image src="/studio-images/horizon-hero.jpg" alt="Production crew at work — Horizon at VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-3xl object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">Pricing</span>
          <div className="text-brand-red font-black leading-none mb-2" style={{fontSize: 'clamp(5rem, 14vw, 10rem)', letterSpacing: '-0.05em'}}>$300</div>
          <p className="text-gray-500 text-lg mb-1" data-reveal="fade">per hour</p>
          <p className="text-white font-semibold mb-12">Cameraman included. 1 hour minimum. Open 24/7.</p>
          <div className="divide-y divide-white/10 border-y border-white/10 mb-12">
            {[
              { label: '2 Hours', price: '$600' },
              { label: '4 Hours', price: '$1,200' },
              { label: '8 Hours', price: '$2,400' },
            ].map(({ label, price }) => (
              <div key={label} className="flex items-center justify-between py-4">
                <span className="text-gray-400 text-sm">{label}</span>
                <span className="text-white font-black text-lg">{price}</span>
              </div>
            ))}
          </div>
          <a href="/book?studio=horizon" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors">
            Book Horizon
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <p className="text-gray-700 text-xs mt-4">Instant confirmation. Free cancellation 48hrs before.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <h2 data-reveal="up" className="font-black text-white leading-none mb-4" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.04em' }}>
            Ready to <span className="text-brand-red">Record?</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10" data-reveal="fade">$300/hr. Cameraman included. Instant confirmation.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/book?studio=horizon" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors">
              Book Your Session
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="/contact" className="text-gray-500 hover:text-white transition-colors text-sm self-center">Schedule a free tour →</a>
          </div>
        </div>
      </section>
    </>
  )
}
