import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'The Executive: Podcast Studio | VibeShack Studios SF',
  description: 'Walnut Series. Wood slat walls, leather seating, globe lighting. 3-camera 4K podcast studio in San Francisco. $300/hr. Cameraman included. Open 24/7.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/the-executive' },
  openGraph: {
    title: 'The Executive | VibeShack Studios SF',
    description: 'Walnut Series 3-camera 4K podcast studio with wood slat walls, leather seating, and globe lighting. Cameraman included. $300/hr in San Francisco.',
    url: 'https://www.vibeshackstudios.com/the-executive',
    siteName: 'VibeShack Studios',
    images: [{ url: '/studio-images/the-executive-hero.jpg', width: 1200, height: 630, alt: 'The Executive at VibeShack Studios SF' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Executive | VibeShack Studios SF',
    description: 'Walnut Series 3-camera 4K podcast studio with wood slat walls, leather seating, and globe lighting. Cameraman included. $300/hr in San Francisco.',
    images: ['/studio-images/the-executive-hero.jpg'],
  },
}

export default function TheExecutivePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/the-executive-hero.jpg"
          alt="The Executive podcast studio hero shot — VibeShack Studios San Francisco"
          fill className="object-cover opacity-80" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-28 sm:pt-40 w-full">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{color: '#fcd34d'}}>Walnut Series</p>
          <h1 data-reveal="up" className="text-6xl sm:text-7xl font-black text-white leading-none mb-4" style={{letterSpacing: '-0.04em'}}>
            The Executive
          </h1>
          <p className="text-gray-400 text-xl max-w-xl mb-8" data-reveal="fade">
            Warm lighting. Intimate setting. 3 cameras. Built for conversations that feel real.
          </p>
          <a href="/book?studio=the-executive" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 hover:scale-[1.02] hover:gap-4 active:scale-[0.98] transition-all duration-300 cursor-pointer">
            Book This Studio
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      {/* Show up. Record - 2 Column: Features Left + Photo Right */}
      <section className="py-32 bg-zinc-950 border-t" style={{borderColor: '#fcd34d'}}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Features */}
            <div>
              <h2 data-reveal="up" className="text-white font-black leading-none mb-12" style={{fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
                Show up.<br/><span className="text-brand-red">Record.</span>
              </h2>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {[
                  '3 cameras, all angles covered',
                  'Warm, cinematic lighting pre-configured',
                  'Cameraman included',
                  'Broadcast microphones for 2 people',
                  'Leather seating, adjustable layout',
                  'Acoustic walls, zero echo',
                  'High-speed WiFi, streaming capable',
                  'On-site support',
                ].map(item => (
                  <div key={item} className="py-4 text-gray-400 text-base">{item}</div>
                ))}
              </div>
            </div>
            {/* Right: Full Room Photo */}
            <div>
              <Image src="/studio-images/the-executive-detail-02.jpg" alt="The Executive full room with professional lighting and setup — VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Studio Details Gallery */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">The Room</span>
          <h2 data-reveal="up" className="text-white font-black leading-none mb-4" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
            Where three people<br/>sound <span className="text-brand-red">like legends.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-20 max-w-2xl">The Executive is the room where your show stops being a podcast and becomes a broadcast. Three cameras, three angles, three voices that cut through the noise.</p>
          
          <div className="space-y-24">
            {/* Detail 1: Image Left, Text Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-1">
                <Image src="/studio-images/the-executive-detail-01.jpg" alt="Neumann microphones in The Executive at VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-3xl object-cover" />
              </div>
              <div className="order-2">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: '-0.02em'}}>Shure Mics That Cost More Than Your Gear</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">Three Shure broadcast microphones. If you know what that means, you already know they're the standard. If you don't, just know that every word you say comes through clean and true.</p>
                <p className="text-gray-400 text-lg leading-relaxed">They're positioned right. Tested every morning. You don't think about them. They just work.</p>
              </div>
            </div>

            {/* Detail 2: Text Left, Image Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: '-0.02em'}}>One Master. Two Singles.</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">You've got the wide master that shows the whole room and both of you talking. Then two singles, one locked on each person. Your editor has everything they need to cut between you, hold on reactions, frame the moment that matters.</p>
                <p className="text-gray-400 text-lg leading-relaxed">All locked down. All rolling. That's the standard setup for a reason.</p>
              </div>
              <div className="order-1 md:order-2">
                <Image src="/studio-images/the-executive-detail-02.jpg" alt="Three camera setup in The Executive at VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-3xl object-cover" />
              </div>
            </div>

            {/* Detail 3: Image Left, Text Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-1">
                <Image src="/studio-images/the-executive-detail-03.jpg" alt="Wood and leather in The Executive at VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-3xl object-cover" />
              </div>
              <div className="order-2">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: '-0.02em'}}>Walnut Walls and Leather That Reads on Camera</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">Walk in and you're in a room that looks expensive. Not because we're trying to impress you. Because expensive materials look expensive. Walnut slats that age over time. Leather that the camera loves.</p>
                <p className="text-gray-400 text-lg leading-relaxed">Your guests sit here and they stand up straighter. The room does that.</p>
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
          <a href="/book?studio=the-executive" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 hover:scale-[1.02] hover:gap-4 active:scale-[0.98] transition-all duration-300 cursor-pointer">
            Book The Executive
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <p className="text-gray-700 text-xs mt-4">Instant confirmation. Free cancellation 48hrs before.</p>
        </div>
      </section>

      {/* Made Here */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="number-label mb-4 block">Made Here</span>
              <h2 data-reveal="up" className="text-white font-black leading-none" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
                Productions shot<br/>in <span className="text-brand-red">The Executive.</span>
              </h2>
            </div>
          </div>
          <div className="mb-3">
            <Image src="/studio-images/executive-made-3.jpg" alt="Portfolio Players Front Office Sports production — The Executive VibeShack Studios San Francisco"
                width={1200} height={800} className="w-full h-auto rounded-2xl" />
            <p className="text-gray-600 text-xs mt-2">Portfolio Players · <span className="text-gray-500">Front Office Sports</span></p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Image src="/studio-images/executive-made-1.jpg" alt="Live broadcast production setup — The Executive VibeShack Studios San Francisco"
                  width={600} height={400} className="w-full h-auto rounded-2xl" />
              <p className="text-gray-600 text-xs mt-2">Live broadcast setup · The Executive</p>
            </div>
            <div>
              <Image src="/studio-images/executive-made-4.jpg" alt="Multi-camera production monitors — The Executive VibeShack Studios San Francisco"
                  width={600} height={400} className="w-full h-auto rounded-2xl" />
              <p className="text-gray-600 text-xs mt-2">Multi-camera production · The Executive</p>
            </div>
          </div>
          <p className="text-gray-600 text-xs mt-4">
            Have a production shot here? <a href="mailto:founder@vibeshackstudios.com" className="text-brand-red hover:text-white transition-colors">Send it to us</a> — we&apos;ll feature it.
          </p>
        </div>
      </section>

      {/* Explore the Walnut Series - Expanded */}
      <section className="py-48 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="mb-16">
            <span className="number-label mb-6 block">Explore the Collection</span>
            <h2 data-reveal="up" className="text-white font-black leading-none" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
              Also in the<br/><span style={{color: '#fcd34d'}}>Walnut Series.</span>
            </h2>
          </div>
          <a href="/the-wing" className="relative overflow-hidden rounded-3xl group block w-full" style={{height: '400px'}}>
            <Image src="/studio-images/the-wing-hero.jpg" alt="The Wing — Walnut Series podcast studio, VibeShack Studios San Francisco" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 40%)'}} />
            <div className="absolute bottom-0 left-0 right-0 p-12">
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{color: '#fcd34d'}}>Walnut Series</p>
              <h3 className="text-white font-black leading-none mb-3" style={{fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.04em'}}>The Wing</h3>
              <p className="text-gray-300 text-lg max-w-md mb-6">Cozy, intimate 2-person setup. Same premium quality. 20% smaller footprint.</p>
              <p className="text-gray-400 text-sm">$300/hr · Cameraman included</p>
            </div>
          </a>
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
            <a href="/book?studio=the-executive" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 hover:scale-[1.02] hover:gap-4 active:scale-[0.98] transition-all duration-300 cursor-pointer">
              Book Your Session
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="/contact" className="text-gray-500 hover:text-white transition-colors text-sm self-center">Schedule a free tour →
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
