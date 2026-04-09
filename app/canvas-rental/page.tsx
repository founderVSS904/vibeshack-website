import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Canvas Rental: White Cyc Studio Space | VibeShack Studios SF',
  description: 'Creative Series. Flexible white cyc backdrop studio. Perfect for photography, video, and creative projects. $100/hr. Open 24/7.',
  alternates: { canonical: 'https://www.vibeshackstudios.com/canvas-rental' }
}

export default function CanvasRentalPage() {
  return (
    <>
      <style>{`
        .use-card {
          position: relative;
          border-radius: 1rem;
          overflow: hidden;
          cursor: pointer;
          background: #18181b;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .use-card:hover {
          transform: scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
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
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: block;
        }
        
        .use-card:hover img {
          transform: scale(1.08);
        }
        
        .use-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
          pointer-events: none;
          z-index: 5;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .use-card:hover::before {
          opacity: 1;
        }
      `}</style>

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-end bg-black overflow-hidden">
        <Image src="/studio-images/canvas-rental-hero-v1775094073.jpg"
          alt="Canvas rental studio white cyc backdrop — VibeShack Studios San Francisco"
          fill
          className="object-cover opacity-85"
          priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-28 sm:pt-40 w-full">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{color: '#14b8a6'}}>Creative Series</p>
          <h1 className="text-6xl sm:text-7xl font-black text-white leading-none mb-4" style={{letterSpacing: '-0.04em'}}>Canvas Rental</h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed mb-8">
            White cyc backdrop. Overhead lighting grid. Total creative control. Rent by the hour for any production.
          </p>
          <a href="/book?studio=canvas-rental" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold text-sm tracking-wide rounded-full hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer">
            Book Canvas Rental
          </a>
        </div>
      </section>

      {/* Accent line */}
      <div className="h-1 w-full" style={{backgroundColor: '#14b8a6'}} />

      {/* Features */}
      <section className="bg-black py-20 sm:py-28 px-6 sm:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
            <div className="order-1">
              <Image src="/studio-images/canvas-rental-blackfloor-v1775094171.jpg" alt="Canvas rental with black floor options" width={800} height={600} className="w-full h-auto rounded-3xl" />
            </div>
            <div className="order-2 flex flex-col justify-center">
              <h2 className="text-white font-black text-4xl mb-6" style={{letterSpacing: '-0.02em'}}>Flexible Space</h2>
              <div className="divide-y divide-white/10 border-y border-white/10">
                <div className="py-4 text-gray-400 text-base">Seamless white cyc wall</div>
                <div className="py-4 text-gray-400 text-base">Black floor mats available</div>
                <div className="py-4 text-gray-400 text-base">Full overhead lighting grid</div>
                <div className="py-4 text-gray-400 text-base">750 sqft open space</div>
                <div className="py-4 text-gray-400 text-base">Bring your own equipment</div>
                <div className="py-4 text-gray-400 text-base">Photography, video, content creation</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-black text-3xl mb-12" style={{letterSpacing: '-0.02em'}}>Create Anything</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="use-card">
                <div className="use-card-img-wrapper">
                  <Image src="/studio-images/canvas-rental-podcast-v1775096685.jpg" alt="Podcast production setup at Canvas" fill className="object-cover" />
                </div>
                <div className="bg-zinc-900 p-4">
                  <p className="text-white font-bold text-sm">Podcast & Interview</p>
                  <p className="text-gray-400 text-xs mt-1">Boom mics. Professional setup. Your crew.</p>
                </div>
              </div>
              <div className="use-card">
                <div className="use-card-img-wrapper">
                  <Image src="/studio-images/canvas-rental-music-v1775095665.jpg" alt="Music video production at Canvas" fill className="object-cover" />
                </div>
                <div className="bg-zinc-900 p-4">
                  <p className="text-white font-bold text-sm">Music Video & Performance</p>
                  <p className="text-gray-400 text-xs mt-1">Dynamic lighting. Energy. Movement.</p>
                </div>
              </div>
              <div className="use-card">
                <div className="use-card-img-wrapper">
                  <Image src="/studio-images/canvas-rental-portrait-v1775096209.jpg" alt="Professional portrait shoot at Canvas" fill className="object-cover" />
                </div>
                <div className="bg-zinc-900 p-4">
                  <p className="text-white font-bold text-sm">Portraits & Headshots</p>
                  <p className="text-gray-400 text-xs mt-1">Clean light. Professional finish. Your vision.</p>
                </div>
              </div>
              <div className="use-card">
                <div className="use-card-img-wrapper">
                  <Image src="/studio-images/canvas-rental-space-v1775096416.jpg" alt="Canvas rental studio space ready for your project" fill className="object-cover" />
                </div>
                <div className="bg-zinc-900 p-4">
                  <p className="text-white font-bold text-sm">Your Project Here</p>
                  <p className="text-gray-400 text-xs mt-1">White cyc. Overhead grid. Full control.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black py-20 sm:py-28 px-6 sm:px-10 lg:px-16 border-t border-white/10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="h-1 w-16 rounded-full mx-auto mb-8" style={{backgroundColor: '#14b8a6'}} />
          <h2 className="text-5xl sm:text-6xl font-black text-white mb-6" style={{letterSpacing: '-0.03em'}}>Ready to Create?</h2>
          <p className="text-gray-400 text-lg mb-8">Book your studio time. No production crew needed. Full control. 24/7 access.</p>
          <a href="/book?studio=canvas-rental" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold text-sm tracking-wide rounded-full hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer">
            Reserve Canvas Rental
          </a>
        </div>
      </section>
    </>
  );
}
