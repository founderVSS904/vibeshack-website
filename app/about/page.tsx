import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'About',
  description: 'VibeShack Studios is San Francisco creative production infrastructure: podcast, green screen, photo, and rental studios at the Northern Waterfront.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/about/' }
}

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-black pt-32 sm:pt-48 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">About</span>
          <h1 className="font-black text-brand-red leading-none mb-6" style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', letterSpacing: '-0.05em' }}>
            The Dream<br />
            Factory.
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed max-w-2xl mb-6">
            Every creator deserves the infrastructure to make their best work — regardless of budget, background, or experience.
          </p>
          <p className="text-gray-600 text-sm tracking-[0.15em] uppercase">The Creative Standard · SF Northern Waterfront</p>
        </div>
      </section>

      {/* The belief */}
      <section className="py-0 bg-black border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="px-6 sm:px-10 lg:px-20 py-32 flex flex-col justify-center">
            <p className="text-gray-600 text-xs uppercase tracking-widest mb-8">The Belief</p>
            <h2 className="font-black text-white leading-none mb-8" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', letterSpacing: '-0.05em' }}>
              Just bring<br />
              your <span className="text-brand-red">idea.</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-sm">
              We built The Dream Factory because creators in San Francisco deserved better. Not a repurposed warehouse. Not borrowed gear. Not a studio that prices out the people doing the most interesting work.
            </p>
            <p className="text-gray-500 text-lg leading-relaxed max-w-sm">
              Every studio. Cinema-grade equipment. Open every hour of every day. The infrastructure is here. You just show up.
            </p>
          </div>
          <div className="relative min-h-[500px] lg:min-h-0 overflow-hidden rounded-2xl">
            <Image src="/studio-images/enhanced-the-wing-podcast-guest-closeup-v20260510.jpg" alt="Creator recording inside VibeShack Studios in San Francisco"
              fill className="object-cover" style={{objectPosition: 'center'}} priority />
          </div>
        </div>
      </section>

      {/* The Dream Factory statement */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-gray-600 text-xs uppercase tracking-widest mb-8">The Name</p>
              <h2 className="font-black text-white leading-none mb-8" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em' }}>
                Why<br /><span className="text-brand-red">&ldquo;The Dream Factory&rdquo;?</span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                A factory produces things at scale, consistently, without variation in quality. A dream is the thing you&apos;re trying to make real.
              </p>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                We are the place where ideas become content. Where a first-time podcaster records their first episode and sounds like they&apos;ve been doing it for years. Where a brand shoots a video that actually matches the vision in their head.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                That&apos;s what a dream factory does. It takes what&apos;s in your head and gives you the tools to make it real.
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
                <div key={src} className={`overflow-hidden rounded-xl ${className}`}>
                  <Image
                    src={src}
                    alt={alt}
                    width={800}
                    height={height}
                    className="w-full object-cover"
                    style={{ height, objectPosition }}
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
            <p className="text-gray-600 text-xs uppercase tracking-widest mb-8">What We&apos;re Building</p>
            <h2 className="font-black text-white leading-tight mb-10" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em' }}>
              The studio is where<br />it <span className="text-brand-red">starts.</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-6">
              VibeShack is creative infrastructure. The studio is where it lives right now. Multiple studios, professional gear, open every hour of every day, at a price that doesn&apos;t require a production budget to walk through the door.
            </p>
            <p className="text-gray-500 text-lg leading-relaxed">
              The belief behind it is simple: the quality of an idea should determine what gets made. Not access. Not money. Not who you know. We built VibeShack so that stops being the reason good work doesn&apos;t get done.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20 pt-16 border-t border-white/[0.08]">
            {[
              { n: '01', title: 'Studios', body: 'The physical home. Multiple studios at SF\'s Northern Waterfront. Where the work gets made today.' },
              { n: '02', title: 'Creative Services', body: 'Branding, content strategy, production support. The expertise that surrounds the space.' },
              { n: '03', title: 'Platform', body: 'The future. Tools, education, and creative infrastructure for anyone building something worth sharing.' },
            ].map(({ n, title, body }) => (
              <div key={n} className="border-t border-white/[0.08] pt-8">
                <span className="text-gray-700 font-black text-sm block mb-4">{n}</span>
                <h3 className="text-white font-bold text-xl mb-3" style={{letterSpacing: '-0.02em'}}>{title}</h3>
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
              <p className="text-gray-600 text-xs uppercase tracking-widest mb-8">The Promise</p>
              <h2 className="font-black text-white leading-none mb-8" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em' }}>
                The Creative<br /><span className="text-brand-red">Standard.</span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                The Creative Standard is not a tagline. It&apos;s a commitment to the quality of what happens inside this building.
              </p>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                Every room is at the level it was promised to be. Every session starts on time. Every piece of equipment works. Every creator — whether they&apos;ve been here once or fifty times — is treated with the same level of respect and care.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                When you say &ldquo;made at VibeShack,&rdquo; people know what that means.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl">
              <Image src="/studio-images/enhanced-the-wing-podcast-guest-closeup-v20260510.jpg" alt="Podcast guest recording at VibeShack Studios" width={800} height={480} className="w-full object-cover" style={{height: '480px'}} />
            </div>
          </div>
        </div>
      </section>

      {/* The Space */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">The Space</span>
          <h2 className="font-black text-white leading-tight mb-16" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em' }}>
            950 Battery St<br />
            <span className="text-brand-red">Northern Waterfront.</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="col-span-2 row-span-2 overflow-hidden rounded-xl">
              <Image src="/studio-images/horizon-wide-v20260509.jpg" alt="Horizon podcast set at VibeShack Studios" width={800} height={480} className="w-full object-cover" style={{ height: '480px' }} />
            </div>
            <div className="overflow-hidden rounded-xl">
              <Image src="/studio-images/parlor-side-v20260509.jpg" alt="Parlor lounge production set at VibeShack Studios" width={400} height={234} className="w-full object-cover" style={{ height: '234px' }} />
            </div>
            <div className="overflow-hidden rounded-xl">
              <Image src="/studio-images/inside-photography-red-v20260509.jpg" alt="Red backdrop photography set at VibeShack Studios" width={400} height={234} className="w-full object-cover" style={{ height: '234px' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-0 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-20 pb-0">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="number-label mb-4 block">Location</span>
              <h2 className="text-white font-black leading-none" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em' }}>Find Us</h2>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">950 Battery St</p>
              <p className="text-gray-500 text-sm">San Francisco, CA 94111</p>
              <p className="text-gray-600 text-xs mt-1">Northern Waterfront · Open 24/7</p>
            </div>
          </div>
        </div>
        <div className="relative w-full" style={{ height: '480px' }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d800!2d-122.4003!3d37.8009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808580f3b43fcd85%3A0x37a86c6c0f0a3f5a!2s950%20Battery%20St%2C%20San%20Francisco%2C%20CA%2094111!5e0!3m2!1sen!2sus!4v1"
            width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
            referrerPolicy="no-referrer-when-downgrade" title="VibeShack Studios location"
          />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 2 }}>
            <div className="relative" style={{ marginTop: '-20px' }}>
              <div className="absolute -inset-4 rounded-full bg-brand-red opacity-20 animate-ping" />
              <div className="absolute -inset-2 rounded-full bg-brand-red opacity-30" />
              <div className="w-4 h-4 rounded-full bg-brand-red shadow-lg" style={{ boxShadow: '0 0 20px rgba(229,0,0,0.8), 0 0 40px rgba(229,0,0,0.4)' }} />
            </div>
          </div>
          <div className="absolute bottom-6 left-6 glass-card rounded-lg p-5" style={{ backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-brand-red" style={{ boxShadow: '0 0 8px #E50000' }} />
              <span className="text-white font-bold text-sm">VibeShack Studios</span>
            </div>
            <p className="text-gray-300 text-xs mb-1">950 Battery St</p>
            <p className="text-gray-300 text-xs mb-3">San Francisco, CA 94111</p>
            <a href="https://maps.google.com/?q=950+Battery+St+San+Francisco+CA+94111" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-red text-xs font-semibold hover:text-white transition-colors">
              Get Directions →
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-zinc-950 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <p className="text-gray-600 text-xs uppercase tracking-widest mb-6">The Dream Factory</p>
          <h2 className="font-black text-white leading-tight mb-6" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.04em' }}>
            Come see the space.<br />
            <span className="text-brand-red">Book a free tour.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10">Pick a live tour time. 950 Battery St, San Francisco.</p>
          <a href="/tour/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-sm tracking-wide rounded-full hover:bg-gray-100 transition-colors">
            Book a Free Tour
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </a>
        </div>
      </section>
    </>
  )
}
