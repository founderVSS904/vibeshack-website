import type { Metadata } from 'next'
import Image from 'next/image'
import { studioServiceSchema } from '@/lib/schemas'
import { siteUrl } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: 'Canvas White Cyc Studio',
  description: 'Creative Series. Flexible white cyc backdrop studio. Perfect for photography, video, and creative projects. $100/hr. Open 24/7.',
  alternates: { canonical: `${siteUrl}/canvas-rental/` }
}

const canvasRentalServiceSchema = studioServiceSchema({
  name: 'White Cyc Studio Rental in San Francisco',
  description: 'Canvas Rental is a flexible white cyc studio in San Francisco with overhead lighting grid for photography, video, product, and content shoots.',
  url: `${siteUrl}/canvas-rental/`,
  image: `${siteUrl}/studio-images/canvas-rental-hero-v1775094073.jpg`,
  price: '100',
  serviceType: 'White Cyc Studio Rental',
})

export default function CanvasRentalPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(canvasRentalServiceSchema) }}
      />
      <style>{`
        .use-card {
          position: relative;
          display: block;
          border-radius: 0.5rem;
          overflow: hidden;
          background: #18181b;
          transition: transform 0.3s ease-out;
        }

        .use-card:hover {
          transform: scale(1.02);
        }

        .use-card-img-wrapper {
          position: relative;
          overflow: hidden;
          height: 280px;
          background: #000;
        }

        .use-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s ease-out;
          display: block;
        }

        .use-card:hover img {
          transform: scale(1.035);
        }
      `}</style>

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/canvas-rental-hero-v1775094073.jpg"
          alt="Canvas rental studio white cyc backdrop at VibeShack Studios San Francisco"
          fill sizes="100vw"
          className="object-cover opacity-85"
          priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-28 sm:pt-40 w-full">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] mb-4 text-brand-red">White Cyc Studio</p>
          <h1 className="text-6xl sm:text-7xl font-black text-white leading-none mb-4" style={{letterSpacing: 0}}>Canvas<span className="text-brand-red">.</span></h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed mb-8">
            White cyc backdrop. Overhead lighting grid. Total creative control. Rent by the hour for any production.
          </p>
          <a href="/book/?studio=canvas-rental" className="inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
            Book Canvas
          </a>
        </div>
      </section>

      {/* Accent line */}
      <div className="h-px w-full bg-white/10" />

      {/* Features */}
      <section className="bg-black py-32 px-6 sm:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
            <div className="order-1">
              <Image src="/studio-images/canvas-rental-blackfloor-v1775094171.jpg" alt="Canvas rental with black floor options" width={800} height={600} className="w-full h-auto rounded-lg" />
            </div>
            <div className="order-2 flex flex-col justify-center">
              <h2 className="text-white font-black text-4xl mb-6" style={{letterSpacing: 0}}>Flexible space</h2>
              <div className="divide-y divide-white/10 border-y border-white/10">
                <div className="py-4 text-gray-400 text-base">Seamless white cyc wall</div>
                <div className="py-4 text-gray-400 text-base">Black floor mats available</div>
                <div className="py-4 text-gray-400 text-base">Full overhead lighting grid</div>
                <div className="py-4 text-gray-400 text-base">750 sq ft open space</div>
                <div className="py-4 text-gray-400 text-base">Bring your own equipment</div>
                <div className="py-4 text-gray-400 text-base">Photography, video, content creation</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-black text-3xl mb-12" style={{letterSpacing: 0}}>Create Anything</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="/book/?studio=canvas-rental" className="use-card">
                <div className="use-card-img-wrapper">
                  <Image src="/studio-images/canvas-rental-podcast-v1775096685.jpg" alt="Podcast production setup at Canvas" fill sizes="100vw" className="object-cover" />
                </div>
                <div className="bg-zinc-900 p-4">
                  <p className="text-white font-bold text-sm">Podcast & Interview</p>
                  <p className="text-gray-400 text-xs mt-1">Bring boom mics and your own crew.</p>
                </div>
              </a>
              <a href="/book/?studio=canvas-rental" className="use-card">
                <div className="use-card-img-wrapper">
                  <Image src="/studio-images/canvas-rental-music-v1775095665.jpg" alt="Music video production at Canvas" fill sizes="100vw" className="object-cover" />
                </div>
                <div className="bg-zinc-900 p-4">
                  <p className="text-white font-bold text-sm">Music Video & Performance</p>
                  <p className="text-gray-400 text-xs mt-1">Room to move for performance takes.</p>
                </div>
              </a>
              <a href="/book/?studio=canvas-rental" className="use-card">
                <div className="use-card-img-wrapper">
                  <Image src="/studio-images/canvas-rental-portrait-v1775096209.jpg" alt="Professional portrait shoot at Canvas" fill sizes="100vw" className="object-cover" />
                </div>
                <div className="bg-zinc-900 p-4">
                  <p className="text-white font-bold text-sm">Portraits & Headshots</p>
                  <p className="text-gray-400 text-xs mt-1">Soft, even light for clean headshots.</p>
                </div>
              </a>
              <a href="/book/?studio=canvas-rental" className="use-card">
                <div className="use-card-img-wrapper">
                  <Image src="/studio-images/canvas-rental-space-v20260509.jpg" alt="Canvas rental studio space ready for your project" fill sizes="100vw" className="object-cover" />
                </div>
                <div className="bg-zinc-900 p-4">
                  <p className="text-white font-bold text-sm">Your Project Here</p>
                  <p className="text-gray-400 text-xs mt-1">An empty 750 sq ft grid. Build whatever you want.</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16">
          <span className="number-label mb-12 block">Pricing</span>
          <div
            className="font-black text-brand-red leading-none mb-2"
            style={{ fontSize: 'clamp(5rem, 14vw, 10rem)', letterSpacing: 0 }}
          >
            $100
          </div>
          <p className="text-gray-500 text-lg mb-1">per hour</p>
          <p className="text-white font-semibold mb-12">Book by the hour. No hidden fees.</p>
          <div className="divide-y divide-white/10 border-y border-white/10 mb-12">
            {[
              'Full overhead lighting grid',
              'Seamless white cyc backdrop',
              'Black floor mats available',
              '750 sq ft production floor',
            ].map((f) => (
              <div key={f} className="py-3.5 text-gray-400 text-sm">{f}</div>
            ))}
          </div>
          <a
            href="/book/?studio=canvas-rental"
            className="inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700"
          >
            Book Canvas
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <p className="text-gray-500 text-sm mt-4">Open 24/7. Instant confirmation. Free cancellation 48 hours before.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black py-32 px-6 sm:px-10 lg:px-16 border-t border-white/10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="h-1 w-16 rounded-full mx-auto mb-8 bg-white/10" />
          <h2 className="text-5xl sm:text-6xl font-black text-white mb-6" style={{letterSpacing: 0}}>Ready to <span className="text-brand-red">Create?</span></h2>
          <p className="text-gray-400 text-lg mb-8">Book your studio time. No production crew needed. Full control. 24/7 access.</p>
          <a href="/book/?studio=canvas-rental" className="inline-flex items-center gap-3 rounded-lg bg-brand-red px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-700">
            Reserve Canvas
          </a>
        </div>
      </section>
    </>
  );
}
