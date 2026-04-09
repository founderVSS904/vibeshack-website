import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Encore: Premium Production Studio | VibeShack Studios SF',
  description: 'Vault Series. Full-scale production studio with dual green screens, 4K cinema cameras, and professional crew. $300/hr. Cameraman and director included. Open 24/7.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/encore' },
  openGraph: {
    title: 'Encore | VibeShack Studios SF',
    description: 'Vault Series full-scale production studio with dual green screens and 4K cinema cameras. Cameraman and director included. $300/hr in San Francisco.',
    url: 'https://www.vibeshackstudios.com/encore',
    siteName: 'VibeShack Studios',
    images: [{ url: '/studio-images/encore-wide.jpg', width: 1200, height: 630, alt: 'Encore at VibeShack Studios SF' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Encore | VibeShack Studios SF',
    description: 'Vault Series full-scale production studio with dual green screens and 4K cinema cameras. Cameraman and director included. $300/hr in San Francisco.',
    images: ['/studio-images/encore-wide.jpg'],
  },
}

export default function EncorePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/encore-wide.jpg"
          alt="Encore production studio hero shot — VibeShack Studios San Francisco"
          fill className="object-cover opacity-85" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-28 sm:pt-40 w-full">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{color: '#a855f7'}}>Vault Series</p>
          <h1 data-reveal="up" className="text-6xl sm:text-7xl font-black text-white leading-none mb-4" style={{letterSpacing: '-0.04em'}}>
            Encore
          </h1>
          <p className="text-gray-400 text-xl max-w-xl mb-8" data-reveal="fade">
            Full production firepower. Green screen flexibility. Everything you need to make broadcast-quality content.
          </p>
          <a href="/book?studio=encore" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors">
            Book This Studio
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      {/* What You Get - 2 Column: Features Left + Photo Right */}
      <section className="py-32 bg-zinc-950 border-t" style={{borderColor: '#a855f7'}}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Features */}
            <div>
              <h2 data-reveal="up" className="text-white font-black leading-none mb-12" style={{fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
                Go <span style={{color: '#a855f7'}}>big.</span><br/>Go<span style={{color: '#a855f7'}}> professional.</span>
              </h2>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {[
                  'Dual 4K cinema cameras',
                  'Dual green screens, independent control',
                  'Cameraman and director included',
                  'Professional audio kit with wireless',
                  'Kino Flo lighting for large spaces',
                  'Professional color grading setup',
                  'Streaming and recording simultaneous',
                  'Full production support',
                ].map(item => (
                  <div key={item} className="py-4 text-gray-400 text-base">{item}</div>
                ))}
              </div>
            </div>
            {/* Right: Full Room Photo */}
            <div>
              <Image src="/studio-images/encore-production.jpg" alt="Encore studio in full production mode — VibeShack Studios San Francisco" width={800} height={600} className="w-full h-auto rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* The Studio Philosophy */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">The Vault</span>
          <h2 data-reveal="up" className="text-white font-black leading-none mb-4" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
            Scale without the <span style={{color: '#a855f7'}}>overhead.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-20 max-w-2xl">Encore is what production companies use when they need to book space fast. Not because they can't afford studios elsewhere, but because this place works. The crew knows the room. The equipment is maintained like obsessives maintain equipment. You walk in and you're making content immediately.</p>
          
          <div className="space-y-24">
            {/* Detail 1: Image Left, Text Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-1">
                <Image src="/studio-images/encore-wide.jpg" alt="Encore studio wide view with green screens and cinema lighting" width={800} height={600} className="w-full h-auto rounded-3xl object-cover" />
              </div>
              <div className="order-2">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: '-0.02em'}}>Two Stages, One Shoot</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">Dual green screens mean you're not locked into one setup. Shoot product on one screen. Have your host on the other. Cut between locations. No second take, no lighting reset. One camera can go tight, the other pulls back. Your editor has actual choices.</p>
                <p className="text-gray-400 text-lg leading-relaxed">We've seen people waste half their time wrestling with single-screen shows. Encore gives you the flexibility to plan the shoot you actually want, not the shoot the room allows.</p>
              </div>
            </div>

            {/* Detail 2: Text Left, Image Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: '-0.02em'}}>Broadcast Lights, No Heat Damage</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">Kino Flos run cool. You can shoot for hours without your talent looking cooked or sweating through makeup. The light is soft, flicker-free, and color-accurate. RGB control lets you dial in exactly what you need for your aesthetic.</p>
                <p className="text-gray-400 text-lg leading-relaxed">No gels, no filters, no guessing. What you see on set is what you get in post. The crew knows how to light for your show's style, but if you want to direct the lights yourself, you can.</p>
              </div>
              <div className="order-1 md:order-2">
                <Image src="/studio-images/encore-close.jpg" alt="Encore studio detail — professional lighting and production equipment" width={800} height={600} className="w-full h-auto rounded-3xl object-cover" />
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
          <p className="text-white font-semibold mb-12">Cameraman and director included. 2 hour minimum. Open 24/7.</p>
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
          <a href="/book?studio=encore" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-sm tracking-wide rounded hover:bg-gray-200 transition-colors">
            Book Encore
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>
    </>
  )
}
