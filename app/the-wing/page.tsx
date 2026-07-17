import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'The Wing Podcast Studio',
  description: 'Walnut Series. Cozy 2-person setup with premium lighting and acoustics. $300/hr. Cameraman included. Open 24/7.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/the-wing/' },
  openGraph: {
    title: 'The Wing | VibeShack Studios SF',
    description: 'Walnut Series intimate 2-person podcast studio with cognac leather, warm lighting, and premium acoustics. Cameraman included. $300/hr in San Francisco.',
    url: 'https://www.vibeshackstudios.com/the-wing',
    siteName: 'VibeShack Studios',
    images: [{ url: '/studio-images/enhanced-the-wing-podcast-guest-closeup-v20260510.jpg', width: 1200, height: 630, alt: 'The Wing at VibeShack Studios SF' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Wing | VibeShack Studios SF',
    description: 'Walnut Series intimate 2-person podcast studio with cognac leather, warm lighting, and premium acoustics. Cameraman included. $300/hr in San Francisco.',
    images: ['/studio-images/enhanced-the-wing-podcast-guest-closeup-v20260510.jpg'],
  },
}

export default function TheWingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/the-wing-hero.jpg"
          alt="The Wing podcast studio hero shot, VibeShack Studios San Francisco"
          fill sizes="100vw" className="object-cover opacity-80" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-28 sm:pt-40 w-full">
          <p className="text-xs font-bold tracking-widest uppercase mb-4 text-brand-red">Walnut Series</p>
          <h1 className="text-6xl sm:text-7xl font-black text-white leading-none mb-4" style={{letterSpacing: 0}}>
            The Wing<span className="text-brand-red">.</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-xl mb-8">
            A compact two-person set with warm lighting, broadcast audio, and two-camera coverage.
          </p>
          <a href="/book/?studio=the-wing" className="group inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
            Book This Studio
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </section>

      {/* Show up. Record - 2 Column: Features Left + Photo Right */}
      <section className="py-32 bg-zinc-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Features */}
            <div>
              <h2 className="text-white font-black leading-none mb-12" style={{fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', letterSpacing: 0}}>
                Ready<br/><span className="text-brand-red">for two.</span>
              </h2>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {[
                  '2 cameras framed for close conversation',
                  'Warm light tuned for two faces',
                  'A cameraman with you, included',
                  'One broadcast mic locked on each of you',
                  'Cognac leather chairs from Nod Design',
                  'Walnut slat acoustics, minimal echo',
                  'Fast WiFi, ready to stream',
                  'Support on site the whole session',
                ].map(item => (
                  <div key={item} className="py-4 text-gray-400 text-base">{item}</div>
                ))}
              </div>
            </div>
            {/* Right: Full Room Photo */}
            <div>
              <Image src="/studio-images/the-wing-3.jpg" alt="The Wing full room with professional lighting and cozy setup, VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Studio Details Gallery */}
      <section className="py-32 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">The Set</span>
          <h2 className="text-white font-black leading-none mb-4" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: 0}}>
            A close two-person<br/><span className="text-brand-red">conversation set.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-20 max-w-2xl">Cognac leather chairs, walnut slats, and a tighter camera layout keep both speakers visually connected in the wide and individual angles.</p>
          
          <div className="space-y-24">
            {/* Detail 1: Image Left, Text Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-1">
                <Image src="/studio-images/enhanced-the-wing-podcast-guest-closeup-v20260510.jpg" alt="Cognac leather seating in The Wing, VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-lg object-cover" />
              </div>
              <div className="order-2">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: 0}}>Cognac Leather by Nod Design</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">The chairs are sized for long conversations and maintain a clean profile in the two-shot.</p>
                <p className="text-gray-400 text-lg leading-relaxed">Brass details and walnut armrests coordinate with the slatted wall behind the set.</p>
              </div>
            </div>

            {/* Detail 2: Text Left, Image Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: 0}}>Warm Light for Two Faces</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">Four fixtures balance both speakers without flattening the walnut backdrop or creating glare in eyeglasses.</p>
                <p className="text-gray-400 text-lg leading-relaxed">The baseline look is set before arrival and can be adjusted for wardrobe or skin tone.</p>
              </div>
              <div className="order-1 md:order-2">
                <Image src="/studio-images/the-wing-detail-02.jpg" alt="Lighting in The Wing studio at VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-lg object-cover" />
              </div>
            </div>

            {/* Detail 3: Image Left, Text Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-1">
                <Image src="/studio-images/the-wing-detail-03.jpg" alt="Walnut walls in The Wing studio at VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-lg object-cover" />
              </div>
              <div className="order-2">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: 0}}>Walnut Slat Acoustics</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">The slatted wall adds visual depth while helping control reflections around the conversation area.</p>
                <p className="text-gray-400 text-lg leading-relaxed">The acoustic treatment stays out of frame, so the set reads as a finished interior rather than a recording booth.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 bg-zinc-950 border-t border-white/10">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">Pricing</span>
          <div className="text-brand-red font-black leading-none mb-2" style={{fontSize: 'clamp(5rem, 14vw, 10rem)', letterSpacing: 0}}>$300</div>
          <p className="text-gray-500 text-lg mb-1">per hour</p>
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
          <a href="/book/?studio=the-wing" className="group inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
            Book The Wing
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
          <p className="text-gray-700 text-xs mt-4">Instant confirmation. Free cancellation 48hrs before.</p>
        </div>
      </section>



      {/* Explore the Walnut Series - Expanded */}
      <section className="py-32 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="mb-16">
            <span className="number-label mb-6 block">Explore the Collection</span>
            <h2 className="text-white font-black leading-none" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: 0}}>
              Also in the<br/><span className="text-brand-red">Walnut Series.</span>
            </h2>
          </div>
          <a href="/the-executive/" className="relative overflow-hidden rounded-lg group block w-full" style={{height: '400px'}}>
            <Image src="/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg" alt="The Executive, Walnut Series podcast studio, VibeShack Studios San Francisco" fill sizes="100vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]" />
            <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 40%)'}} />
            <div className="absolute bottom-0 left-0 right-0 p-12">
              <p className="text-xs font-bold tracking-widest uppercase mb-3 text-brand-red">Walnut Series</p>
              <h3 className="text-white font-black leading-none mb-3" style={{fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: 0}}>The Executive</h3>
              <p className="text-gray-300 text-lg max-w-md mb-6">Premium two-host set. Warm, cinematic atmosphere. Full production capability.</p>
              <p className="text-gray-400 text-sm">$300/hr · Cameraman included</p>
            </div>
          </a>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <h2 className="font-black text-white leading-none mb-4" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: 0 }}>
            Ready to <span className="text-brand-red">Record?</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10">$300/hr. Cameraman included. Instant confirmation.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/book/?studio=the-wing" className="group inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
              Book Your Session
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
            <a href="/tour/?studio=the-wing" className="text-gray-500 hover:text-white transition-colors text-sm self-center">Schedule a free tour →
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
