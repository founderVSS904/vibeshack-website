import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'The Wing: Intimate Podcast Studio | VibeShack Studios SF',
  description: 'Walnut Series. Cozy 2-person setup with premium lighting and acoustics. $300/hr. Cameraman included. Open 24/7.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/the-wing' },
  openGraph: {
    title: 'The Wing | VibeShack Studios SF',
    description: 'Walnut Series intimate 2-person podcast studio with cognac leather, warm lighting, and premium acoustics. Cameraman included. $300/hr in San Francisco.',
    url: 'https://www.vibeshackstudios.com/the-wing',
    siteName: 'VibeShack Studios',
    images: [{ url: '/studio-images/the-wing-hero.jpg', width: 1200, height: 630, alt: 'The Wing at VibeShack Studios SF' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Wing | VibeShack Studios SF',
    description: 'Walnut Series intimate 2-person podcast studio with cognac leather, warm lighting, and premium acoustics. Cameraman included. $300/hr in San Francisco.',
    images: ['/studio-images/the-wing-hero.jpg'],
  },
}

export default function TheWingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/the-wing-hero.jpg"
          alt="The Wing podcast studio hero shot — VibeShack Studios San Francisco"
          fill className="object-cover opacity-80" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-28 sm:pt-40 w-full">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{color: '#fcd34d'}}>Walnut Series</p>
          <h1 data-reveal="up" className="text-6xl sm:text-7xl font-black text-white leading-none mb-4" style={{letterSpacing: '-0.04em'}}>
            The Wing
          </h1>
          <p className="text-gray-400 text-xl max-w-xl mb-8" data-reveal="fade">
            Cozy intimacy. Premium quality. Built for duos and close conversations.
          </p>
          <a href="/book?studio=the-wing" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors">
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
                  '2 cameras, dual angle coverage',
                  'Warm, cinematic lighting pre-configured',
                  'Cameraman included',
                  'Broadcast microphones for 2 people',
                  'Premium seating, intimate layout',
                  'Acoustic walls, minimal echo',
                  'High-speed WiFi, streaming capable',
                  'On-site support',
                ].map(item => (
                  <div key={item} className="py-4 text-gray-400 text-base">{item}</div>
                ))}
              </div>
            </div>
            {/* Right: Full Room Photo */}
            <div>
              <Image src="/studio-images/the-wing-detail-02.jpg" alt="The Wing full room with professional lighting and cozy setup — VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Studio Details Gallery */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">The Room</span>
          <h2 data-reveal="up" className="text-white font-black leading-none mb-4" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
            Built for two<br/>people to <span className="text-brand-red">actually talk.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-20 max-w-2xl">Walk in and the first thing you notice is the furniture. Cognac leather that's broken in, chairs that fit you. You sit down and you forget you're on camera. That's not accidental.</p>
          
          <div className="space-y-24">
            {/* Detail 1: Image Left, Text Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-1">
                <Image src="/studio-images/the-wing-detail-01.jpg" alt="Cognac leather seating in The Wing, VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-3xl object-cover" />
              </div>
              <div className="order-2">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: '-0.02em'}}>The Leather Gets Better With Time</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">We picked Nod Design because they get it. The chairs look good, sure. But they're designed to be sat in. Heavy use. Years of use. The leather develops a patina. It's worn in the right way, not damaged.</p>
                <p className="text-gray-400 text-lg leading-relaxed">Brass accents that won't look cheap in a year. Walnut armrests you actually want to touch. We were ruthless about cutting anything that doesn't earn its place.</p>
              </div>
            </div>

            {/* Detail 2: Text Left, Image Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: '-0.02em'}}>Light That Doesn't Get In The Way</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">You walk in and it's warm. Not bright. There's a difference. Four lights that work together to make you look like yourself. No shadows on your face. No glare in the lenses. Your skin doesn't look washed out or orange.</p>
                <p className="text-gray-400 text-lg leading-relaxed">We tuned these lights for 8 hours a day. They don't get hot. You can adjust them if you need to, but you probably won't.</p>
              </div>
              <div className="order-1 md:order-2">
                <Image src="/studio-images/the-wing-detail-02.jpg" alt="Lighting in The Wing studio at VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-3xl object-cover" />
              </div>
            </div>

            {/* Detail 3: Image Left, Text Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-1">
                <Image src="/studio-images/the-wing-detail-03.jpg" alt="Walnut walls in The Wing studio at VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-3xl object-cover" />
              </div>
              <div className="order-2">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: '-0.02em'}}>Walnut Walls That Actually Sound Good</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">The vertical slats aren't decoration. They absorb sound in a natural way. No dead spots. No weird boomy corners. You talk and it sounds like you talking, not like you in a box.</p>
                <p className="text-gray-400 text-lg leading-relaxed">We didn't put in any foam panels. No thick carpet. Just wood that's been shaped right. Over time it'll age and the color will shift. That's the point. It looks like a room people actually use.</p>
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
          <a href="/book?studio=the-wing" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors">
            Book The Wing
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <p className="text-gray-700 text-xs mt-4">Instant confirmation. Free cancellation 48hrs before.</p>
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
          <a href="/the-executive" className="relative overflow-hidden rounded-3xl group block w-full" style={{height: '400px'}}>
            <Image src="/studio-images/the-executive-hero.jpg" alt="The Executive — Walnut Series podcast studio, VibeShack Studios San Francisco" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 40%)'}} />
            <div className="absolute bottom-0 left-0 right-0 p-12">
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{color: '#fcd34d'}}>Walnut Series</p>
              <h3 className="text-white font-black leading-none mb-3" style={{fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.04em'}}>The Executive</h3>
              <p className="text-gray-300 text-lg max-w-md mb-6">Premium 3-person setup. Warm, cinematic atmosphere. Full production capability.</p>
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
            <a href="/book?studio=the-wing" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors">
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
