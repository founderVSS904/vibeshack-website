import type { Metadata } from 'next'
import Image from 'next/image'
import WingSetupSelector from './WingSetupSelector'
import { siteUrl } from '@/lib/seo/site'
import { PODCAST_CAMERA_LABEL, PODCAST_CREW_LABEL, PODCAST_HOURLY_RATES, PODCAST_MINIMUM_CAMERAS, PODCAST_PACKAGE_SUMMARY } from '@/lib/booking/podcast-package'

const hourlyRate = PODCAST_HOURLY_RATES['the-wing']
const pageDescription = `Intimate walnut podcast set in San Francisco. ${PODCAST_CREW_LABEL}. ${PODCAST_CAMERA_LABEL}. $${hourlyRate}/hr. Open 24/7.`

export const metadata: Metadata = {
  title: 'The Wing Podcast Studio',
  description: pageDescription,
  alternates: { canonical: `${siteUrl}/the-wing/` },
  openGraph: {
    title: 'The Wing | VibeShack Studios SF',
    description: pageDescription,
    url: `${siteUrl}/the-wing`,
    siteName: 'VibeShack Studios',
    images: [{ url: '/studio-images/enhanced-the-wing-podcast-guest-closeup-v20260510.jpg', width: 1200, height: 630, alt: 'The Wing at VibeShack Studios SF' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Wing | VibeShack Studios SF',
    description: pageDescription,
    images: ['/studio-images/enhanced-the-wing-podcast-guest-closeup-v20260510.jpg'],
  },
}

export default function TheWingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-setups/the-wing/two-brown-chairs.webp"
          alt="The Wing podcast studio hero shot, VibeShack Studios San Francisco"
          fill sizes="100vw" className="object-cover opacity-80" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-28 sm:pt-40 w-full">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] mb-4 text-brand-red">Walnut Series</p>
          <h1 className="text-6xl sm:text-7xl font-black text-white leading-none mb-4" style={{letterSpacing: 0}}>
            The Wing<span className="text-brand-red">.</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-xl mb-8">
            A walnut set for solo recordings and two-person conversations, with warm lighting, broadcast audio, and coverage from at least {PODCAST_MINIMUM_CAMERAS} cameras.
          </p>
          <a href="#choose-setup" className="group inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
            Choose Your Setup
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </section>

      <WingSetupSelector />

      {/* Show up. Record - 2 Column: Features Left + Photo Right */}
      <section className="py-32 bg-zinc-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Features */}
            <div>
              <h2 className="text-white font-black leading-none mb-12" style={{fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', letterSpacing: 0}}>
                Ready<br/><span className="text-brand-red">for your format.</span>
              </h2>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {[
                  PODCAST_CAMERA_LABEL,
                  'Warm light tuned to your selected layout',
                  PODCAST_CREW_LABEL,
                  'Broadcast microphones for your recording',
                  'One or two chairs in brown or black',
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
              <Image src="/studio-setups/the-wing/two-black-chairs.webp" alt="Two black chairs in The Wing at VibeShack Studios San Francisco" width={1448} height={1086} className="w-full h-auto rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Studio Details Gallery */}
      <section className="py-32 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">The Set</span>
          <h2 className="text-white font-black leading-none mb-4" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: 0}}>
            One space.<br/><span className="text-brand-red">Your look.</span>
          </h2>
          <p className="text-gray-400 text-lg mb-20 max-w-2xl">Choose a solo chair or a two-chair conversation layout. Brown or black seating, walnut slats, and warm lighting give each setup its own feel.</p>
          
          <div className="space-y-24">
            {/* Detail 1: Image Left, Text Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-1">
                <Image src="/studio-setups/the-wing/one-brown-chair.webp" alt="One brown chair in The Wing, VibeShack Studios San Francisco" width={1448} height={1086} className="w-full h-auto rounded-lg" />
              </div>
              <div className="order-2">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: 0}}>Black or Brown. One or Two.</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">Choose a single chair for a solo recording or two chairs for a conversation.</p>
                <p className="text-gray-400 text-lg leading-relaxed">Your photo selection is saved with the booking so our team can prepare the chair setup before you arrive.</p>
              </div>
            </div>

            {/* Detail 2: Text Left, Image Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: 0}}>Light for Your Conversation</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">Lighting is adjusted for your selected chair layout, keeping the focus on the people in the frame.</p>
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
          <div className="text-brand-red font-black leading-none mb-2" style={{fontSize: 'clamp(5rem, 14vw, 10rem)', letterSpacing: 0}}>${hourlyRate}</div>
          <p className="text-gray-500 text-lg mb-1">per hour</p>
          <p className="text-white font-semibold mb-12">{PODCAST_PACKAGE_SUMMARY} 1 hour minimum. Open 24/7.</p>
          <div className="divide-y divide-white/10 border-y border-white/10 mb-12">
            {[
              { label: '2 Hours', price: `$${(hourlyRate * 2).toLocaleString('en-US')}` },
              { label: '4 Hours', price: `$${(hourlyRate * 4).toLocaleString('en-US')}` },
              { label: '8 Hours', price: `$${(hourlyRate * 8).toLocaleString('en-US')}` },
            ].map(({ label, price }) => (
              <div key={label} className="flex items-center justify-between py-4">
                <span className="text-gray-400 text-sm">{label}</span>
                <span className="text-white font-black text-lg">{price}</span>
              </div>
            ))}
          </div>
          <a href="#choose-setup" className="group inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
            Book The Wing
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
          <p className="text-gray-700 text-xs mt-4">Instant confirmation. Free cancellation 48 hours before.</p>
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
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] mb-3 text-brand-red">Walnut Series</p>
              <h3 className="text-white font-black leading-none mb-3" style={{fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: 0}}>The Executive</h3>
              <p className="text-gray-300 text-lg max-w-md mb-6">A walnut set with desk layouts for one or two, or three armchairs without a desk.</p>
              <p className="text-gray-400 text-sm">${PODCAST_HOURLY_RATES['the-executive']}/hr · {PODCAST_CREW_LABEL}</p>
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
          <p className="text-gray-500 text-lg mb-10">${hourlyRate}/hr. {PODCAST_CREW_LABEL}. Instant confirmation.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#choose-setup" className="group inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
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
