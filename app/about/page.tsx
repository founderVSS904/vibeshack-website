import type { Metadata } from 'next'
import Image from 'next/image'
import { StudioLocation } from '@/components/StudioLocation'
import { siteUrl } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: 'About',
  description: 'VibeShack Studios is San Francisco creative production infrastructure: podcast, green screen, photo, and rental studios at the Northern Waterfront.',
  alternates: { canonical: `${siteUrl}/about/` }
}

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-black pt-32 sm:pt-48 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">About</span>
          <h1 className="font-black text-brand-red leading-none mb-6" style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', letterSpacing: 0 }}>
            The Dream<br />
            Factory.
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed max-w-2xl mb-6">
            Podcast sets, photo rooms, a green screen, a white cyc, and production support at 950 Battery St in San Francisco.
          </p>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-600">Studios and production · SF Northern Waterfront</p>
        </div>
      </section>

      {/* The belief */}
      <section className="py-0 bg-black border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="px-6 sm:px-10 lg:px-20 py-32 flex flex-col justify-center">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-600 mb-8">The Belief</p>
            <h2 className="font-black text-white leading-none mb-8" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', letterSpacing: 0 }}>
              Production,<br />
              under <span className="text-brand-red">one roof.</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-sm">
              VibeShack combines podcast sets, photo rooms, green screen, white cyc, cameras, lighting, and audio in one building.
            </p>
            <p className="text-gray-500 text-lg leading-relaxed max-w-sm">
              Book a set and crew, or rent the space for your own team. The studios are available around the clock.
            </p>
          </div>
          <div className="relative min-h-[500px] lg:min-h-0 overflow-hidden rounded-lg">
            <Image src="/studio-images/enhanced-the-wing-podcast-guest-closeup-v20260510.jpg" alt="Creator recording inside VibeShack Studios in San Francisco"
              fill sizes="100vw" className="object-cover" style={{objectPosition: 'center'}} priority />
          </div>
        </div>
      </section>

      {/* The Dream Factory statement */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-600 mb-8">The Name</p>
              <h2 className="font-black text-white leading-none mb-8" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: 0 }}>
                Why<br /><span className="text-brand-red">&ldquo;The Dream Factory&rdquo;.</span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                The name is literal. This is where a brief moves onto a camera-ready set and becomes finished content.
              </p>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                Camera positions, audio, lighting, and set layouts can be reset between sessions, so recurring shows and campaign shoots can return to a setup that works.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                The sets and rental spaces are distinct. The production standard stays consistent.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  src: '/brand/vibeshack/dream-factory-rooftop-wide-v20260520.jpg',
                  alt: 'VibeShack Dream Factory hoodie on a San Francisco rooftop',
                  className: 'col-span-2',
                  height: 260,
                  objectPosition: 'center center',
                },
                {
                  src: '/brand/vibeshack/dream-factory-rooftop-detail-v20260520.jpg',
                  alt: 'Dream Factory hoodie detail with red and blue production light',
                  className: 'col-span-2',
                  height: 300,
                  objectPosition: 'center center',
                },
              ].map(({ src, alt, className, height, objectPosition }) => (
                <div key={src} className={`relative overflow-hidden rounded-lg ${className}`} style={{ height }}>
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    style={{ objectPosition }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What we're building */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-600 mb-8">What We&apos;re Building</p>
            <h2 className="font-black text-white leading-tight mb-10" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: 0 }}>
              Studios first.<br /><span className="text-brand-red">Production alongside.</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-6">
              Today, VibeShack operates podcast, photo, video, and rental studios at 950 Battery St. Each space can be booked on its own or paired with production support.
            </p>
            <p className="text-gray-500 text-lg leading-relaxed">
              The focus is practical: dependable equipment, repeatable setups, clear rates, and access at the hours working crews need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-20 pt-16 border-t border-white/[0.08]">
            {[
              { n: '01', title: 'Studios', body: 'Podcast sets, photo rooms, green screen, and white cyc rental at San Francisco\'s Northern Waterfront.' },
              { n: '02', title: 'Creative Services', body: 'Planning, crew, production, editing, and brand work for teams that need more than the space.' },
            ].map(({ n, title, body }) => (
              <div key={n} className="border-t border-white/[0.08] pt-8">
                <span className="text-gray-700 font-black text-sm block mb-4">{n}</span>
                <h3 className="text-white font-bold text-xl mb-3" style={{letterSpacing: 0}}>{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Creative Standard */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-600 mb-8">The Promise</p>
              <h2 className="font-black text-white leading-none mb-8" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: 0 }}>
                The Creative<br /><span className="text-brand-red">Standard.</span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                Before a session, the booked set is reset and the camera, audio, lighting, and network setup are checked.
              </p>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                The layout and included equipment match the booking, and the on-site team handles set turnover and technical questions.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                Repeat productions can return to a familiar set, frame, and technical baseline.
              </p>
            </div>
            <div className="relative h-[480px] overflow-hidden rounded-lg">
              <Image src="/studio-images/parlor-production-v20260509.jpg" alt="Production underway on the Parlor set at VibeShack Studios" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* The Space */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">The Space</span>
          <h2 className="font-black text-white leading-tight mb-16" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: 0 }}>
            950 Battery St<br />
            <span className="text-brand-red">Northern Waterfront.</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="relative col-span-2 row-span-2 h-[360px] overflow-hidden rounded-lg sm:h-[480px]">
              <Image src="/studio-images/horizon-wide-v20260509.jpg" alt="Horizon podcast set at VibeShack Studios" fill sizes="(min-width: 768px) 66vw, 100vw" className="object-cover" />
            </div>
            <div className="relative h-[174px] overflow-hidden rounded-lg sm:h-[234px]">
              <Image src="/studio-images/parlor-side-v20260509.jpg" alt="Parlor lounge production set at VibeShack Studios" fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover" />
            </div>
            <div className="relative h-[174px] overflow-hidden rounded-lg sm:h-[234px]">
              <Image src="/studio-images/inside-canvas-cyc-v20260509.jpg" alt="Canvas white cyc set at VibeShack Studios" fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-0 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
          <span className="number-label mb-4 block">Location</span>
          <h2 className="text-white font-black leading-none" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: 0 }}>Find Us</h2>
        </div>
        <StudioLocation heightClassName="h-[360px] sm:h-[480px]" />
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-zinc-950 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-gray-600 mb-6">The Dream Factory</p>
          <h2 className="font-black text-white leading-tight mb-6" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: 0 }}>
            Come see the space.<br />
            <span className="text-brand-red">Book a free tour.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10">Pick a live tour time. 950 Battery St, San Francisco.</p>
          <a href="/tour/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-sm tracking-wide rounded-lg hover:bg-gray-100 transition-colors">
            Book a Free Tour
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </a>
        </div>
      </section>
    </>
  )
}
