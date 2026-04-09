import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Premier: Luxury Podcast Studio | VibeShack Studios SF',
  description: 'Vault Series. Premium interview studio with luxury furnishings, dual mics, and intimate conversational setup. $300/hr. Cameraman and director included. Open 24/7.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/premier' },
  openGraph: {
    title: 'Premier | VibeShack Studios SF',
    description: 'Vault Series luxury podcast studio with premium furnishings, dual boom mics, and gold curtain backdrop. Cameraman and director included. $300/hr in San Francisco.',
    url: 'https://www.vibeshackstudios.com/premier',
    siteName: 'VibeShack Studios',
    images: [{ url: '/studio-images/premier-hero-v1775084326.jpg', width: 1200, height: 630, alt: 'Premier at VibeShack Studios SF' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premier | VibeShack Studios SF',
    description: 'Vault Series luxury podcast studio with premium furnishings, dual boom mics, and gold curtain backdrop. Cameraman and director included. $300/hr in San Francisco.',
    images: ['/studio-images/premier-hero-v1775084326.jpg'],
  },
}

export default function PremierPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/premier-hero-v1775084326.jpg"
          alt="Premier luxury podcast studio hero shot — VibeShack Studios San Francisco"
          fill className="object-cover object-bottom md:object-center opacity-85" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-28 sm:pt-40 w-full">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{color: '#a855f7'}}>Vault Series</p>
          <h1 data-reveal="up" className="text-6xl sm:text-7xl font-black text-white leading-none mb-4" style={{letterSpacing: '-0.04em'}}>Premier</h1>
          <p className="text-gray-400 text-xl max-w-xl mb-8" data-reveal="fade">Luxury conversation. Premium interview space. Where serious podcasters record their best work.</p>
          <a href="/book?studio=premier" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-red text-white font-bold text-sm tracking-wide rounded hover:bg-red-700 transition-colors">
            Book This Studio
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-32 bg-zinc-950 border-t" style={{borderColor: '#a855f7'}}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 data-reveal="up" className="text-white font-black leading-none mb-12" style={{fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
                Built for <span style={{color: '#a855f7'}}>conversations</span><br/>that <span style={{color: '#a855f7'}}>matter.</span>
              </h2>
              <div className="divide-y divide-white/10 border-y border-white/10">
                <div className="py-4 text-gray-400 text-base">Luxury furnishings: armchairs, premium rug</div>
                <div className="py-4 text-gray-400 text-base">Dual boom mics for stereo interview format</div>
                <div className="py-4 text-gray-400 text-base">Gold curtain backdrop with adjustable lighting</div>
                <div className="py-4 text-gray-400 text-base">Cameraman and director included</div>
                <div className="py-4 text-gray-400 text-base">Professional audio kit with wireless</div>
                <div className="py-4 text-gray-400 text-base">Intimate 2-person conversation focus</div>
                <div className="py-4 text-gray-400 text-base">High-end stone and natural finishes</div>
                <div className="py-4 text-gray-400 text-base">Full production support</div>
              </div>
            </div>
            <div>
              <Image src="/studio-images/premier-wide-v1775084326.jpg" alt="Premier studio wide view with luxury furnishings and dual mics" width={800} height={600} className="w-full h-auto rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">The Vault</span>
          <h2 data-reveal="up" className="text-white font-black leading-none mb-4" style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.04em'}}>
            When your podcast <span style={{color: '#a855f7'}}>deserves better than a box.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-20 max-w-2xl">
            You're not compromising on where this happens. Leather that feels expensive because it is. A rug with actual pattern and weight. A gold curtain backdrop that makes the space feel intentional. This isn't "studio aesthetic" — it's a room someone invested in because the conversation matters.
          </p>
          <div className="space-y-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-1">
                <Image src="/studio-images/premier-detail-v1775084326.jpg" alt="Premier studio detail — luxury furnishings and premium finish" width={800} height={600} className="w-full h-auto rounded-3xl object-cover" />
              </div>
              <div className="order-2">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: '-0.02em'}}>Everything Works Together</h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Upholstered chairs. Hand-patterned rug. Gold backdrop. Two boom mics positioned for natural conversation.
                </p>
                <p className="text-gray-400 text-lg leading-relaxed mt-4">
                  The space respects the conversation. Your recording reflects that.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-white font-black text-3xl mb-6" style={{letterSpacing: '-0.02em'}}>Dual Mics, Stereo Sound</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-4">
                  Two guests. Two separate channels. Your editor has flexibility in post. You can isolate each voice, adjust levels independently, build a mix that reflects the conversation's dynamics.
                </p>
                <p className="text-gray-400 text-lg leading-relaxed">
                  The boom mics are positioned for natural conversation distance. No one's reaching. No one's cramped. Just two people talking, recorded right.
                </p>
              </div>
              <div className="order-1 md:order-2">
                <Image src="/studio-images/premier-setup-v1775084326.jpg" alt="Premier studio setup — dual boom mics and interview configuration" width={800} height={600} className="w-full h-auto rounded-3xl object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">Pricing</span>
          <div className="text-brand-red font-black leading-none mb-2" style={{fontSize: 'clamp(5rem, 14vw, 10rem)', letterSpacing: '-0.05em'}}>$300</div>
          <p className="text-gray-500 text-lg mb-1" data-reveal="fade">per hour</p>
          <p className="text-white font-semibold mb-12">Cameraman and director included. 2 hour minimum. Open 24/7.</p>
          <div className="divide-y divide-white/10 border-y border-white/10 mb-12">
            <div className="flex items-center justify-between py-4">
              <span className="text-gray-400 text-sm">2 Hours</span>
              <span className="text-white font-black text-lg">$600</span>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-gray-400 text-sm">4 Hours</span>
              <span className="text-white font-black text-lg">$1,200</span>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-gray-400 text-sm">8 Hours</span>
              <span className="text-white font-black text-lg">$2,400</span>
            </div>
          </div>
          <a href="/book?studio=premier" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-sm tracking-wide rounded hover:bg-gray-200 transition-colors">
            Book Premier
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>
    </>
  )
}
