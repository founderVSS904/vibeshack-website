import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Canvas | VibeShack Studios',
  description: 'Creative Series · Canvas — seamless white cyc wall for fashion, product, and lifestyle photography in San Francisco. Professional lighting grid, overhead rigging. $100/hr. Open 24/7.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/white-backdrop-studio' }
}

export default function WhiteBackdropStudioPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/drive-cyc-wall.jpg"
          alt="Canvas seamless white cyc wall studio hero — Creative Series VibeShack Studios San Francisco"
          fill
          className="object-cover object-bottom md:object-center opacity-80"
          priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-28 sm:pt-40 w-full">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{color: '#99f6e4'}}>Creative Series</p>
          <h1 data-reveal="up" className="text-6xl sm:text-7xl font-black text-white leading-none mb-4" style={{letterSpacing: '-0.04em'}}>
            Canvas <span className="text-white">Rental</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-xl mb-8" data-reveal="fade">
            Seamless white cyc wall. Fashion, product, and lifestyle. Everything already lit.
          </p>
          <a href="/book?studio=canvas-rental" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors">
            Book This Studio
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <span className="number-label mb-12 block">What&apos;s Included</span>
              <h2 data-reveal="up" className="text-white font-black leading-none mb-14" style={{fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
                Show up.<br/><span className="text-brand-red">Shoot.</span>
              </h2>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {[
                  'Seamless white cyc wall, floor to ceiling',
                  'Professional lighting grid, full overhead rigging',
                  'Multiple lighting configurations',
                  'No visible corners or seams from any angle',
                  'Large shooting space for fashion and editorial',
                  'Hair and Makeup room on-site',
                  'On-site support',
                ].map(item => (
                  <div key={item} className="py-3.5 text-gray-400 text-sm">{item}</div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Image src="/studio-images/drive-cyc-wall.jpg" alt="Canvas white cyc wall full interior view — VibeShack Studios San Francisco" width={1200} height={800} className="w-full h-auto rounded-2xl" />
              <div className="grid grid-cols-2 gap-3">
                <Image src="/studio-images/drive-photo-hero.jpg" alt="White backdrop photography session — Canvas VibeShack Studios San Francisco" width={600} height={400} className="w-full h-auto rounded-2xl" />
                <Image src="/studio-images/instagram-white-cyc-wall-lighting.jpg" alt="White cyc wall overhead lighting grid setup — Canvas VibeShack Studios San Francisco" width={600} height={400} className="w-full h-auto rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">Pricing</span>
          <div className="text-brand-red font-black leading-none mb-2" style={{fontSize: 'clamp(5rem, 14vw, 10rem)', letterSpacing: '-0.05em'}}>$100</div>
          <p className="text-gray-500 text-lg mb-1" data-reveal="fade">per hour</p>
          <p className="text-white font-semibold mb-12">No minimums. No hidden fees. Open 24/7.</p>
          <div className="divide-y divide-white/10 border-y border-white/10 mb-12">
            {[
              { label: '2 Hours', price: '$300' },
              { label: '4 Hours', price: '$400' },
              { label: '8 Hours', price: '$800' },
            ].map(({ label, price }) => (
              <div key={label} className="flex items-center justify-between py-4">
                <span className="text-gray-400 text-sm">{label}</span>
                <span className="text-white font-black text-lg">{price}</span>
              </div>
            ))}
          </div>
          <a href="/book?studio=canvas-rental" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors">
            Book Canvas
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <p className="text-gray-700 text-xs mt-4">Instant confirmation. Free cancellation 48hrs before.</p>
        </div>
      </section>

      {/* Use Cases */}
      {/* Made Here */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="number-label mb-4 block">Made Here</span>
              <h2 data-reveal="up" className="text-white font-black leading-none" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
                Productions shot<br/>in <span className="text-brand-red">Canvas.</span>
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3" data-stagger>
            <Image src="/studio-images/podcast-cyc-duo.jpg" alt="Two-person podcast production on Canvas white cyc wall — VibeShack Studios San Francisco"
                width={800} height={600} className="w-full h-auto rounded-2xl" />
            <Image src="/studio-images/podcast-cyc-solo-1.jpg" alt="Solo creator on Canvas white backdrop — Creative Series VibeShack Studios San Francisco"
                width={800} height={600} className="w-full h-auto rounded-2xl" />
          </div>
          <p className="text-gray-600 text-xs mt-4">
            Have a production shot here? <a href="mailto:founder@vibeshackstudios.com" className="text-brand-red hover:text-white transition-colors">Send it to us</a> — we&apos;ll feature it.
          </p>
        </div>
      </section>

      {/* Sister Studios */}
      <section className="py-16 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <p className="text-gray-600 text-xs uppercase tracking-widest mb-6">Also in the Creative Series</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a href="/photography-studio-san-francisco" className="relative overflow-hidden rounded-2xl group block aspect-square md:aspect-video">
              <Image src="/studio-images/photography-hero.jpg" alt="Photography Studio — Creative Series, VibeShack Studios San Francisco" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)'}} />
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-black">Photography Studio</p>
                <p className="text-gray-400 text-xs">$100/hr · Hair & Makeup room</p>
              </div>
            </a>
            <a href="/green-screen-studio-sf" className="relative overflow-hidden rounded-2xl group block aspect-square md:aspect-video">
              <Image src="/studio-images/greenscreen-wide.jpg" alt="Green Screen Studio — VibeShack Studios San Francisco" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)'}} />
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-black">Green Screen</p>
                <p className="text-gray-400 text-xs">$100/hr · 750 sqft</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <h2 data-reveal="up" className="font-black text-white leading-none mb-4" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.04em' }}>
            Ready to <span className="text-brand-red">Shoot?</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10" data-reveal="fade">$100/hr. Everything included. Instant confirmation.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/book?studio=canvas-rental" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors">
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
