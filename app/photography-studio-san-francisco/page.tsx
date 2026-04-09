import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Photography Studio San Francisco | Professional Lighting | VibeShack Studios',
  description:
    'Photography studio in San Francisco with a Hair and Makeup room, seamless white backdrop, and professional lighting grid. From $100/hr. Book instantly at VibeShack Studios.',
  alternates: {
    canonical: 'https://www.vibeshackstudios.com/photography-studio-san-francisco',
  },
  openGraph: {
    title: 'Photography Studio San Francisco | Professional Lighting | VibeShack Studios',
    description:
      'Professional photography studio in SF. White backdrop wall, Hair and Makeup room, professional lighting grid. $100/hr.',
    url: 'https://www.vibeshackstudios.com/photography-studio-san-francisco',
  },
}

const useCases = [
  { label: 'Headshots', description: 'Professional headshots for executives, talent, and personal branding. Multiple backdrops available.' },
  { label: 'Brand Campaigns', description: 'Full production capability for brand campaigns. Flexible studio environment.' },
  { label: 'E-Commerce', description: 'Clean, controlled lighting for products of all sizes. White cyc wall for flawless backgrounds.' },
  { label: 'Editorial', description: 'Cinema-quality lighting for editorial content. Full overhead lighting grid access.' },
  { label: 'Lookbooks', description: 'White cyc wall with full lighting control for fashion and seasonal campaigns.' },
  { label: 'Music Press Shots', description: 'Album art, press photos, and promo imagery. Professional lighting for cinema-grade portraits.' },
]

export default function PhotographyStudioPage() {
  return (
    <>
      {/* Hero — anchored bottom-left in dark zone */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/studio-images/photography-hero.jpg"
            fill
            className="object-cover object-bottom md:object-center"
            alt="Photography studio with professional lighting and white backdrop — VibeShack Studios San Francisco"
            priority
          />
          {/* Heavy bottom + left gradient so white text reads on light studio */}
          <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 25%, rgba(0,0,0,0.1) 60%, transparent 100%)'}} />
          <div className="absolute inset-0" style={{background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)'}} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-12 pt-28 sm:pt-40 w-full">
          <div className="max-w-md">
            <h1
              className="font-black text-white leading-none mb-8"
              style={{ fontSize: 'clamp(2.8rem, 5vw, 5rem)', letterSpacing: '-0.04em' }}
            >
              Your talent<br />
              arrives <span className="text-brand-red">ready.</span>
            </h1>
            <a
              href="/book?studio=photography"
              className="inline-flex items-center gap-3 px-7 py-3.5 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors"
            >
              Book Your Session
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="mb-20">
            <span className="number-label mb-12 block">What&apos;s Included</span>
            <h2 data-reveal="up" className="text-white font-black leading-none max-w-xl" style={{fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', letterSpacing: '-0.04em'}}>
              Everything&apos;s here.<br/>
              <span className="text-brand-red">Already set up.</span>
            </h2>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10 mb-16">
            {[
              { label: 'Hair and Makeup Room', detail: 'Dedicated vanity room with mirror lights. Bring your own Hair & Makeup team.' },
              { label: 'White Cyclorama Wall', detail: 'Seamless floor-to-ceiling infinity backdrop. No seams, no shadows at the base.' },
              { label: 'Professional Lighting', detail: '3-point kit. Overhead grid. Multiple configurations.' },
              { label: 'Panel Lights', detail: '4x4 fill panels. Adjustable color temperature.' },
              { label: 'Colored Backdrops', detail: 'Multiple colors available on request. Switch in minutes.' },
              { label: 'Clothing Rack and Steamer', detail: 'Keep wardrobe clean and wrinkle-free.' },
              { label: 'Changing Area', detail: 'Private space for talent to change between setups.' },
              { label: 'High-Speed WiFi', detail: 'For tethered shooting, uploads, and streaming.' },
            ].map(({ label, detail }) => (
              <div key={label} className="flex items-start justify-between gap-8 py-5">
                <span className="text-white font-semibold text-sm flex-shrink-0 w-56">{label}</span>
                <span className="text-gray-500 text-sm text-right">{detail}</span>
              </div>
            ))}
          </div>

          {/* Room photo grid */}
          <div className="space-y-3">
            <Image src="/studio-images/photo-studio-empty.jpg" alt="Photography studio full room view with lighting grid — VibeShack Studios San Francisco"
                width={1200} height={800} className="w-full h-auto rounded-2xl" />
            <div className="grid grid-cols-2 gap-3">
              <Image src="/studio-images/photo-studio-backdrops.jpg" alt="Photography studio backdrop selection options — VibeShack Studios San Francisco"
                  width={600} height={400} className="w-full h-auto rounded-2xl" />
              <Image src="/studio-images/photography-hero.jpg" alt="Photography studio with red backdrop and professional lighting — VibeShack Studios San Francisco"
                  width={600} height={400} className="w-full h-auto rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">What Gets Shot Here</span>
          <h2
            className="font-black text-white leading-tight mb-16"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em' }}
          >
            Every frame,<br />
            <span className="text-brand-red">controlled.</span>
          </h2>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {useCases.map(({ label, description }) => (
              <div key={label} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-16 py-7">
                <p className="text-white font-semibold text-base">{label}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Made Here */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="number-label mb-4 block">Made Here</span>
              <h2 data-reveal="up" className="text-white font-black leading-none" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
                Productions shot<br/>in <span className="text-brand-red">Photography.</span>
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Image src="/studio-images/photo-studio-shoot-1.jpg" alt="Fashion shoot in progress — Photography Studio VibeShack Studios San Francisco"
              width={600} height={400} className="w-full h-auto rounded-2xl" />
            <Image src="/studio-images/photo-studio-shoot-2.jpg" alt="Video production shoot — Photography Studio VibeShack Studios San Francisco"
              width={600} height={400} className="w-full h-auto rounded-2xl" />
          </div>
          <p className="text-gray-600 text-xs mt-4">
            Have a production shot here? <a href="mailto:founder@vibeshackstudios.com" className="text-brand-red hover:text-white transition-colors">Send it to us</a> — we&apos;ll feature it.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">Pricing</span>
          <div
            className="font-black text-brand-red leading-none mb-2"
            style={{ fontSize: 'clamp(5rem, 14vw, 10rem)', letterSpacing: '-0.05em' }}
          >
            $100
          </div>
          <p className="text-gray-500 text-lg mb-1" data-reveal="fade">per hour</p>
          <p className="text-white font-semibold mb-12">No minimums. No hidden fees.</p>
          <div className="divide-y divide-white/10 border-y border-white/10 mb-12">
            {[
              'Professional overhead lighting',
              'Panel fill lights',
              'Seamless white backdrop',
              'Full vanity and makeup station',
              'Multiple backdrops',
              'Equipment staging area',
            ].map((f) => (
              <div key={f} className="py-3.5 text-gray-400 text-sm">{f}</div>
            ))}
          </div>
          <a
            href="/book?studio=photography"
            className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors"
          >
            Book Your Session
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      {/* Sister Studios */}
      <section className="py-16 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <p className="text-gray-600 text-xs uppercase tracking-widest mb-6">Also in the Creative Series</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a href="/white-backdrop-studio" className="relative overflow-hidden rounded-2xl group block aspect-square md:aspect-video">
              <Image src="/studio-images/drive-cyc-wall.jpg" alt="Canvas — seamless white cyc wall, VibeShack Studios San Francisco" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)'}} />
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-black">Canvas</p>
                <p className="text-gray-400 text-xs">$100/hr · White cyc wall</p>
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
      <section className="py-32 bg-zinc-950 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <h2
            className="font-black text-white leading-none mb-4"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.04em' }}
          >
            Book the <span className="text-brand-red">Photography Studio.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10" data-reveal="fade">Professional lighting, white backdrop, Hair and Makeup room. $100/hr. Open 24/7.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/book?studio=photography"
              className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors"
            >
              Book Your Session
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="/contact"
              className="text-gray-500 hover:text-white transition-colors text-sm self-center"
            >Schedule a free tour →
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
