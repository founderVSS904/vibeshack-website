import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Green Screen Studio San Francisco | 750 sqft | VibeShack Studios',
  description:
    '750 sqft green screen studio in San Francisco. Floor-to-ceiling green screen, professional lighting, easy load-in. From $100/hr. Northern Waterfront location.',
  keywords: [
    'green screen studio san francisco',
    'chroma key studio sf',
    'music video studio',
    'commercial production studio',
    'vfx studio san francisco',
    'content creation studio sf',
  ],
  alternates: {
    canonical: 'https://www.vibeshackstudios.com/green-screen-studio-sf',
  },
  openGraph: {
    title: 'Green Screen Studio SF | 750 sqft Floor-to-Ceiling | VibeShack Studios',
    description:
      '750 sqft floor-to-ceiling green screen in SF. Professional lighting, rigging, VFX-ready. $100/hr. Northern Waterfront, open 24/7.',
    url: 'https://www.vibeshackstudios.com/green-screen-studio-sf',
    type: 'website',
    images: [
      {
        url: 'https://www.vibeshackstudios.com/studio-images/greenscreen-wide.jpg',
        width: 1200,
        height: 630,
        alt: 'Green Screen Studio - 750 sqft floor-to-ceiling - VibeShack Studios SF',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Green Screen Studio SF | VibeShack Studios',
    description: '750 sqft floor-to-ceiling green screen. Professional lighting. From $100/hr. Open 24/7.',
    images: ['https://www.vibeshackstudios.com/studio-images/greenscreen-wide.jpg'],
  },
}

const useCases = [
  { index: '01', label: 'Music Videos' },
  { index: '02', label: 'Brand Commercials' },
  { index: '03', label: 'Gaming Content' },
  { index: '04', label: 'Social Media' },
  { index: '05', label: 'Corporate Video' },
  { index: '06', label: 'Interviews' },
]

const specs = [
  { label: 'Stage Size', detail: '750 sqft production floor' },
  { label: 'Screen Coverage', detail: 'Floor-to-ceiling, seamless infinity curve' },
  { label: 'Lighting Grid', detail: 'Professional overhead, pre-calibrated' },
  { label: 'Fill & Key Lights', detail: 'Included, green screen optimized' },
  { label: 'Load-in', detail: 'Ground-level, street parking + loading zone' },
  { label: 'Rigging Points', detail: 'Available for hanging elements' },
  { label: 'On-site Support', detail: 'Available on request' },
  { label: 'Live Streaming', detail: 'Add-on available, $100/hr' },
]

const faqs = [
  {
    question: 'What is the size of the green screen?',
    answer:
      '750 square feet, floor-to-ceiling. The infinity curve means no visible corners or seams from any camera angle.',
  },
  {
    question: 'Is the lighting included?',
    answer:
      'Yes. The studio includes a professional overhead lighting grid, fill and key lights, and pre-calibrated green screen lighting. Everything is set up for a clean key pull.',
  },
  {
    question: 'Do I need to bring my own camera?',
    answer:
      'You can bring your own, or add a Camera Operator for $50/hr. We also offer a Ready-to-Shoot package with everything pre-configured.',
  },
  {
    question: 'What is the load-in process?',
    answer:
      'Ground-level load-in with street parking and a loading zone directly in front of the building. No freight elevator required for standard equipment.',
  },
  {
    question: 'Can I use the green screen for live streaming?',
    answer:
      'Yes. Live switching and streaming add-on is available for $100/hr. We handle the technical switching so you focus on your content.',
  },
]

export const dynamic = 'force-dynamic'

export default function GreenScreenPage() {
  return (
    <>
      {/* Hero — text anchored LEFT in dark zone, green screen breathes RIGHT */}
      <section className="relative min-h-screen flex items-end overflow-hidden bg-black">
        <div className="absolute inset-0 bg-black">
          <Image
            src="/studio-images/greenscreen-wide.jpg"
            fill
            className="object-cover object-bottom md:object-center"
            alt="750 sqft green screen studio floor-to-ceiling hero view — VibeShack Studios San Francisco"
            priority
          />
          {/* Heavy left gradient — text lives in the dark */}
          <div className="absolute inset-0" style={{background: 'linear-gradient(to right, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.95) 35%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.4) 100%)'}} />
          <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)'}} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-12 pt-28 sm:pt-40 w-full">
          <div className="max-w-lg">
            <h1
              className="font-black text-white leading-none mb-6"
              style={{ fontSize: 'clamp(3.5rem, 7vw, 7rem)', letterSpacing: '-0.05em' }}
            >
              Build Any<br/>
              <span className="text-brand-red">World.</span>
            </h1>
            <p className="text-gray-400 mb-10 leading-relaxed max-w-sm" style={{fontSize: '1.1rem'}}>
              750 sq ft. Floor-to-ceiling Green Screen. Lights included. Drop in any environment you can imagine.
            </p>
            <div className="flex gap-6 items-center">
              <a href="/book?studio=green-screen" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 hover:scale-[1.02] hover:gap-4 active:scale-[0.98] transition-all duration-300 cursor-pointer">
                Book Your Session
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — Apple asymmetric hierarchy */}
      <section className="py-20 bg-zinc-950 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {/* Featured stat — biggest */}
            <div className="py-10 md:py-0 md:pr-16">
              <div className="font-black text-white leading-none mb-2" style={{fontSize: 'clamp(4rem, 8vw, 7rem)', letterSpacing: '-0.05em'}}>750</div>
              <div className="text-gray-500 text-sm mb-1">Square feet</div>
              <div className="text-gray-600 text-xs">Full production floor. Enough room for crew, equipment, and talent.</div>
            </div>
            {/* Two smaller stats */}
            <div className="py-10 md:py-0 md:px-16 flex flex-col justify-center">
              <div className="font-black text-white leading-none mb-2" style={{fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>Floor-to-ceiling</div>
              <div className="text-gray-500 text-sm">Green Screen coverage. No corners. No seams. Any camera angle works.</div>
            </div>
            <div className="py-10 md:py-0 md:pl-16 flex flex-col justify-center gap-8">
              <div>
                <div className="font-black text-brand-red leading-none mb-1" style={{fontSize: 'clamp(2rem, 3vw, 2.5rem)', letterSpacing: '-0.03em'}}>$100/hr</div>
                <div className="text-gray-600 text-xs">No minimums</div>
              </div>
              <div>
                <div className="font-black text-white leading-none mb-1" style={{fontSize: 'clamp(2rem, 3vw, 2.5rem)', letterSpacing: '-0.03em'}}>24/7</div>
                <div className="text-gray-600 text-xs">Book any time, day or night</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 750 sqft Ghost Stat */}
      <section className="py-24 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="relative">
            {/* Ghost giant number behind content */}
            <div
              className="absolute inset-0 flex items-center pointer-events-none select-none"
              aria-hidden="true"
            >
              <span
                className="font-black text-white/[0.04] leading-none"
                style={{ fontSize: '20vw', letterSpacing: '-0.06em', whiteSpace: 'nowrap' }}
              >
                750
              </span>
            </div>
            {/* Use cases numbered list */}
            <div className="relative z-10">
              <span className="number-label mb-12 block">What Gets Shot Here</span>
              <h2
                className="font-black text-white leading-tight mb-16"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em' }}
              >
                The most versatile<br />
                <span className="text-brand-red">stage in SF.</span>
              </h2>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {useCases.map(({ index, label }) => (
                  <div key={index} className="flex items-center gap-8 py-6">
                    <span className="text-gray-700 text-xs tracking-widest font-mono w-6 flex-shrink-0">{index}</span>
                    <span
                      className="text-white font-black"
                      style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.75rem)', letterSpacing: '-0.02em' }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Split — Spec Sheet */}
      <section className="py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Photo grid — all shots */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
            {[
              { src: '/studio-images/greenscreen-wide.jpg',    alt: 'Green Screen Studio full 750 sqft floor-to-ceiling view — VibeShack Studios San Francisco' },
              { src: '/studio-images/greenscreen-shoot-1.jpg', alt: 'Production shoot on green screen — VibeShack Studios San Francisco' },
              { src: '/studio-images/greenscreen-shoot-2.jpg', alt: 'Production crew filming on green screen stage — VibeShack Studios San Francisco' },
              { src: '/studio-images/greenscreen-empty.jpg',   alt: 'Green screen studio empty stage ready for production — VibeShack Studios San Francisco' },
            ].map(({ src, alt }) => (
              <div key={src} className="overflow-hidden rounded-xl relative" style={{height: '220px'}}>
                <Image src={src} alt={alt} fill className="object-cover" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <Image
                src="/studio-images/greenscreen-shoot-2.jpg"
                alt="Green Screen Studio with professional overhead lighting grid — VibeShack Studios San Francisco"
                width={800}
                height={600}
                className="w-full h-auto rounded-2xl"
                style={{ height: '600px', objectFit: 'cover' }}
              />
            <div>
              <span className="number-label mb-12 block">Specifications</span>
              <h2
                className="font-black text-white leading-tight mb-12"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em' }}
              >
                Built for<br />
                <span className="text-brand-red">professionals.</span>
              </h2>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {specs.map(({ label, detail }) => (
                  <div key={label} className="flex items-start justify-between gap-6 py-4">
                    <span className="text-white font-semibold text-sm flex-shrink-0 w-36">{label}</span>
                    <span className="text-gray-500 text-sm text-right">{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 bg-black">
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
              '750 sqft production floor',
              'Floor-to-ceiling Green Screen',
              'Professional lighting grid',
              'Professional fill and key lights',
              'On-site support',
              'Ground-level load-in access',
            ].map((f) => (
              <div key={f} className="py-3.5 text-gray-400 text-sm">{f}</div>
            ))}
          </div>
          <a
            href="/book?studio=green-screen"
            className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded-lg hover:bg-red-700 hover:scale-[1.02] hover:gap-4 active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            Book Your Session
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      {/* FAQ — two-column Apple style */}
      <section className="py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex items-end justify-between mb-20">
            <h2 data-reveal="up" className="font-black text-white leading-none" style={{fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.04em'}}>
              Questions.
            </h2>
            <span className="number-label">FAQ</span>
          </div>
          <div className="divide-y divide-white/8">
            {faqs.map((faq) => (
              <div key={faq.question} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-16 py-8">
                <p className="text-white font-semibold text-base">{faq.question}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sister Studios */}
      <section className="py-16 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <p className="text-gray-600 text-xs uppercase tracking-widest mb-6">Also in the Creative Series</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a href="/photography-studio-san-francisco" className="relative overflow-hidden rounded-2xl group block" style={{height: '200px'}}>
              <Image src="/studio-images/photography-hero.jpg" alt="Photography Studio — Creative Series, VibeShack Studios San Francisco" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)'}} />
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-black">Photography Studio</p>
                <p className="text-gray-400 text-xs">$100/hr · Hair & Makeup room</p>
              </div>
            </a>
            <a href="/white-backdrop-studio" className="relative overflow-hidden rounded-2xl group block" style={{height: '200px'}}>
              <Image src="/studio-images/drive-cyc-wall.jpg" alt="Canvas — seamless white cyc wall, VibeShack Studios San Francisco" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)'}} />
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-black">Canvas</p>
                <p className="text-gray-400 text-xs">$100/hr · White cyc wall</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <h2
            className="font-black text-white leading-none mb-4"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.04em' }}
          >
            Book the <span className="text-brand-red">Green Screen.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10" data-reveal="fade">750 sq ft. Professional lighting. $100/hr. Open 24/7.</p>
          <a
            href="/book?studio=green-screen"
            className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded-lg hover:bg-red-700 hover:scale-[1.02] hover:gap-4 active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            Book Your Session
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>
    </>
  )
}
